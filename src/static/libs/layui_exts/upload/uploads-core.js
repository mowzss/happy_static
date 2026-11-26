// 上传组件 - 核心组装层：构造/初始化/文件选择/粘贴/上传唤起，调用 happyUpload 统一内核。
// 模板层 uploads.js 注入动态配置后重新导出为 'uploads'，保持 new uploads(config) 接口不变。
layui.define(['jquery', 'layer', 'element', 'sortable', 'happyUpload', 'uploadsView', 'uploadsState'], function (exports) {
    "use strict";

    var sortable = layui.sortable,
        layer = layui.layer,
        happyUpload = layui.happyUpload,
        $ = layui.$;

    // 静态默认配置；动态项（接口地址/直传开关等）由模板层注入覆盖
    var DEFAULTS = {
        severUrl: '',
        signUrl: '',
        registerUrl: '',
        direct: false,
        directMaxSize: 0,
        multiple: false,
        exts: '',
        mimes: [],
        sort: false,
        type: 'images',
        extra: false
    };

    // 全局粘贴路由：每个上传组件只注册一次 document 事件，按「点过/聚焦过的组件」分发。
    // 这样空状态（没有已上传图片）时也能直接 Ctrl+V，且不会劫持输入框/富文本编辑器的粘贴。
    var pasteManager = {
        bound: false,
        active: null,
        bind: function () {
            if (this.bound) return;
            this.bound = true;
            var self = this;

            $(document).on('click.uploadPasteActive', function (e) {
                var $target = $(e.target);
                var $holder = $target.closest('[data-upload-holder]');
                if ($holder.length) {
                    self.active = $holder.data('uploadInstance') || null;
                    return;
                }
                if ($target.closest('input, textarea, [contenteditable="true"]').length) {
                    self.active = null;
                }
            });

            $(document).on('focusin.uploadPasteActive', function (e) {
                var $holder = $(e.target).closest('[data-upload-holder]');
                if ($holder.length) self.active = $holder.data('uploadInstance') || null;
            });

            $(document).on('paste.uploadPasteGlobal', function (e) {
                var $target = $(e.target);
                // 输入框/富文本编辑器自己的粘贴不接管
                if ($target.closest('input, textarea, [contenteditable="true"]').length) return;

                var $holder = $target.closest('[data-upload-holder]');
                var inst = $holder.length ? $holder.data('uploadInstance') : self.active;
                if (!inst || inst.config.type !== 'images' || !$.isFunction(inst.handlePasteEvent)) return;
                // 组件所在弹窗已关闭时忽略
                if (!$.contains(document.body, $(inst.elem)[0])) return;
                inst.handlePasteEvent(e);
            });
        }
    };

    function Uploads(options, callback) {
        this.config = $.extend(true, {}, DEFAULTS, this.defaults, options);
        this.elem = options.elem;
        this.callback = callback;
        this.replaceTarget = null; // 待替换的旧 url（点击替换按钮时记录）
        this.$fileInput = null;
        this.init();
    }

    // 模板层可覆盖的默认配置（由 uploads.js 注入）
    Uploads.prototype.defaults = {};

    // 初始化
    Uploads.prototype.init = function () {
        this.config.field = $(this.elem).find('input').attr('name');
        this.initView();
        this.bindEvents();
        if (this.config.multiple && this.config.sort) {
            this.initSortable();
        }
        this.renderPreviews();
        this.preview();
        this.initPaste();
    };

    // 交互事件绑定（文件上传与直传统一走自建 file input，行为一致）
    Uploads.prototype.bindEvents = function () {
        var that = this;

        $(this.elem).off('click.uploadDel').on('click.uploadDel', '.layui-images-show-item .del, .layui-files-show-item .del', function (e) {
            e.stopPropagation();
            that.deleteItem(e.currentTarget);
        });
        $(this.elem).off('click.uploadEdit').on('click.uploadEdit', '.layui-files-show-item .edit-name', function (e) {
            e.stopPropagation();
            that.editFileName(e.currentTarget);
        });
        // 替换：记录目标 url 后唤起文件选择（仅图片）
        $(this.elem).off('click.uploadReplace').on('click.uploadReplace', '.layui-images-show-item:not([data-upload]) .replace', function (e) {
            e.stopImmediatePropagation();
            var oldUrl = $(this).closest('[data-files-url]').attr('data-files-url');
            that.replaceTarget = oldUrl || null;
            that.pickFile();
        });
        // 卡片上的粘贴按钮：聚焦容器并提示 Ctrl+V，粘贴时替换该卡片
        $(this.elem).off('click.uploadPasteBtn').on('click.uploadPasteBtn', '.layui-images-show-item:not([data-upload]) .paste', function (e) {
            e.stopImmediatePropagation();
            var $card = $(this).closest('[data-files-url]');
            that.replaceTarget = $card.length ? $card.attr('data-files-url') : null;
            $(that.elem).trigger('focus');
            layer.tips('按 Ctrl+V 粘贴截图替换此图', this, {tips: 1, time: 3000});
        });
        // 空上传框上的粘贴按钮：不唤起文件选择，仅聚焦容器提示粘贴（新增图片）
        $(this.elem).off('click.uploadPasteEmpty').on('click.uploadPasteEmpty', '[data-upload] .paste', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            that.replaceTarget = null;
            $(that.elem).trigger('focus');
            layer.tips('按 Ctrl+V 粘贴截图上传', this, {tips: 1, time: 3000});
        });
        // 点击上传入口：新增模式，唤起文件选择
        $(this.elem).off('click.uploadPick').on('click.uploadPick', '[data-upload]', function (e) {
            if ($(e.target).closest('.paste').length) return;
            e.preventDefault();
            that.replaceTarget = null;
            that.pickFile();
        });
    };

    // 标记粘贴接收容器；真正的 paste 事件由 pasteManager 在 document 上统一处理
    Uploads.prototype.initPaste = function () {
        if (this.config.type !== 'images') return;
        $(this.elem)
            .attr('tabindex', '0')
            .attr('title', '点击选中后可粘贴截图（Ctrl+V）直接上传')
            .attr('data-upload-holder', '')
            .data('uploadInstance', this);
        pasteManager.bind();
    };

    // 从剪贴板提取图片文件并上传
    Uploads.prototype.handlePasteEvent = function (e) {
        var that = this;
        var items = (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.items) || [];
        var imageFiles = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.kind === 'file' && /^image\//.test(item.type || '')) {
                var file = item.getAsFile && item.getAsFile();
                if (!file) continue;
                // 剪贴板图片通常无文件名，补一个带扩展名的名字供内核判断 ext/path
                if (!file.name) {
                    var ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace('+xml', '');
                    try {
                        file = new File([file], 'pasted_' + Date.now() + '.' + ext, { type: file.type });
                    } catch (err) { /* 老浏览器不支持 File 构造时保持原样 */ }
                }
                imageFiles.push(file);
            }
        }
        if (!imageFiles.length) return;
        e.preventDefault();
        var replacingUrl = that.replaceTarget;
        that.replaceTarget = null;
        imageFiles.forEach(function (file, idx) {
            that.handleFile(file, idx === 0 ? replacingUrl : null);
        });
    };

    // 创建隐藏文件选择框；change 后清空 value，允许重复选同一文件
    Uploads.prototype.createFileInput = function () {
        var that = this;
        var accept = '';
        if (that.config.type === 'images') {
            accept = 'image/*';
        } else if (that.config.exts) {
            accept = '.' + String(that.config.exts).split('|').join(',.');
        }

        var $input = $('<input type="file" style="display:none">').attr('data-upload-input', '');
        if (that.config.multiple) $input.attr('multiple', 'multiple');
        if (accept) $input.attr('accept', accept);

        // 阻止 input 的 click 冒泡回容器，避免与委托事件互相干扰
        $input.on('click', function (e) { e.stopPropagation(); });
        $input.on('change', function () {
            var files = Array.prototype.slice.call(this.files || []);
            this.value = '';
            var replacingUrl = that.replaceTarget;
            that.replaceTarget = null;
            files.forEach(function (file, idx) {
                var error = that.validateFile(file);
                if (error) {
                    layer.msg(error);
                    return;
                }
                that.handleFile(file, idx === 0 ? replacingUrl : null);
            });
        });

        $input.appendTo(that.elem);
        return $input;
    };

    // 每次唤起都换一个新的 input：浏览器对「取消后再次 click 同一个 file input」会丢弃触发
    Uploads.prototype.pickFile = function () {
        var that = this;
        if (that.$fileInput) {
            that.$fileInput.off().remove();
            that.$fileInput = null;
        }
        that.$fileInput = that.createFileInput();
        // 取消文件框后焦点仍在组件上，可直接 Ctrl+V 粘贴
        $(that.elem).trigger('focus');
        that.$fileInput[0].click();
    };

    // 自建输入框后的类型校验（原 layui.upload 的 accept/exts 校验由这里接管）
    Uploads.prototype.validateFile = function (file) {
        var cfg = this.config;
        var name = file.name || '';
        var ext = name.indexOf('.') > -1 ? name.split('.').pop().toLowerCase() : '';
        if (cfg.type === 'images' && !/^image\//.test(file.type || '') && !/^(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(ext)) {
            return '仅支持上传图片';
        }
        if (cfg.exts) {
            var allowed = String(cfg.exts).toLowerCase().split('|').map(function (s) {
                return s.trim();
            }).filter(Boolean);
            if (allowed.length && ext && allowed.indexOf(ext) === -1) {
                return '不支持的文件类型';
            }
        }
        return null;
    };

    // 处理一个选中文件：就地进度卡 + 统一内核上传；替换模式成功后走替换逻辑
    Uploads.prototype.handleFile = function (file, replacingUrl) {
        var that = this;
        if (replacingUrl === undefined) replacingUrl = that.replaceTarget;
        that.replaceTarget = null;

        if (that.config.directMaxSize && file.size > that.config.directMaxSize) {
            layer.msg('文件大小超过限制');
            return;
        }

        // 回调模式（编辑器）不渲染进度卡，沿用各自反馈
        if (that.callback) {
            happyUpload.upload(file, {
                signUrl: that.config.signUrl,
                registerUrl: that.config.registerUrl,
                saveUrl: that.config.severUrl,
                maxSize: that.config.directMaxSize,
                direct: that.config.direct,
                fieldName: 'file'
            }).then(function (data) {
                that.applyUploaded(data, replacingUrl);
            }).catch(function (err) {
                layer.msg((err && err.message) || '上传失败');
            });
            return;
        }

        // 就地进度卡：单图清空列表占位，多图追加；替换模式保留旧项
        var $card = that.createProgressCard(file);
        var containerSelector = that.config.type === 'images' ? '.layui-images-show-list' : '.layui-files-show-list';
        var $list = $(that.elem).find(containerSelector);
        if (!that.config.multiple && !replacingUrl) {
            $list.empty();
        }
        $list.append($card);
        that.syncUploadEntry();

        happyUpload.upload(file, {
            signUrl: that.config.signUrl,
            registerUrl: that.config.registerUrl,
            saveUrl: that.config.severUrl,
            maxSize: that.config.directMaxSize,
            direct: that.config.direct,
            fieldName: 'file',
            progress: function (percent) { that.setProgress($card, percent); }
        }).then(function (data) {
            that.removeProgressCard($card);
            that.applyUploaded(data, replacingUrl);
        }).catch(function (err) {
            that.removeProgressCard($card);
            that.syncUploadEntry();
            layer.msg((err && err.message) || '上传失败');
        });
    };

    // 上传成功后的统一处理：编辑器回调 + 界面回填（新增或替换）
    Uploads.prototype.applyUploaded = function (data, replacingUrl) {
        if (this.callback) {
            if (this.config.type === 'images') {
                this.callback(data.url);
            } else {
                this.callback(data.url, data.name);
            }
            return;
        }
        if (replacingUrl) {
            this.replaceItem(replacingUrl, data);
            this.replaceHiddenField(replacingUrl, data);
        } else {
            this.addItem(data);
        }
    };

    // 初始化排序
    Uploads.prototype.initSortable = function () {
        var that = this;
        new sortable($(that.elem).find('.layui-images-show-list, .layui-files-show-list')[0], {
            animation: 150,
            onEnd: function (evt) { that.updateOrder(evt.oldIndex, evt.newIndex); }
        });
    };

    // 混入渲染层与状态层方法
    $.extend(Uploads.prototype, layui.uploadsView, layui.uploadsState);

    exports('uploadsCore', Uploads);
});
