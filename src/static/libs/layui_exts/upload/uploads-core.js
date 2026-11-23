// 上传组件 - 核心组装层：构造/初始化/上传唤起/替换处理，调用 happyUpload 统一内核。
// 模板层 uploads.js 注入动态配置后重新导出为 'uploads'，保持 new uploads(config) 接口不变。
layui.define(['jquery', 'upload', 'layer', 'element', 'sortable', 'happyUpload', 'uploadsView', 'uploadsState'], function (exports) {
    "use strict";

    var upload = layui.upload,
        sortable = layui.sortable,
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

    function Uploads(options, callback) {
        this.config = $.extend(true, {}, DEFAULTS, this.defaults, options);
        this.elem = options.elem;
        this.callback = callback;
        this.replaceTarget = null; // 待替换的旧 url（点击替换按钮时记录）
        this.init();
    }

    // 模板层可覆盖的默认配置（由 uploads.js 注入）
    Uploads.prototype.defaults = {};

    // 初始化
    Uploads.prototype.init = function () {
        this.config.field = $(this.elem).find('input').attr('name');
        this.initView();
        this.initUploader();
        if (this.config.multiple && this.config.sort) {
            this.initSortable();
        }
        this.renderPreviews();
        this.preview();

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
        $(this.elem).off('click.uploadReplace').on('click.uploadReplace', '.layui-images-show-item .replace', function (e) {
            e.stopPropagation();
            var oldUrl = $(this).closest('[data-files-url]').attr('data-files-url');
            that.replaceTarget = oldUrl || null;
            that.getFileInput().click();
        });
        // 粘贴截图上传（仅图片组件；富文本编辑器各有自己的实现，不走这里）
        this.initPaste();
    };

    // 粘贴截图上传：容器可聚焦后接收 paste，从剪贴板提取图片文件
    Uploads.prototype.initPaste = function () {
        if (this.config.type !== 'images') return; // 文件类型不接粘贴
        var that = this;
        $(that.elem)
            .attr('tabindex', '0')
            .attr('title', '点击选中后可粘贴截图（Ctrl+V）直接上传')
            .off('paste.uploadPaste')
            .on('paste.uploadPaste', function (e) {
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
                that.replaceTarget = null;
                imageFiles.forEach(function (file) { that.handleFile(file); });
            });
    };

    // 根据直传开关选择初始化方式
    Uploads.prototype.initUploader = function () {
        if (!this.config.direct) {
            this.initUpload();
        } else {
            this.initDirect();
        }
    };

    // 复用隐藏的文件选择框
    Uploads.prototype.getFileInput = function () {
        var that = this;
        if (that.$fileInput) return that.$fileInput;

        var accept = '';
        if (that.config.type === 'images') {
            accept = 'image/*';
        } else if (that.config.exts) {
            accept = '.' + String(that.config.exts).split('|').join(',.');
        }

        var $input = $('<input type="file" style="display:none">');
        if (that.config.multiple) $input.attr('multiple', 'multiple');
        if (accept) $input.attr('accept', accept);

        $input.on('change', function () {
            var files = Array.prototype.slice.call(this.files || []);
            this.value = '';
            files.forEach(function (file) { that.handleFile(file); });
        });

        that.$fileInput = $input.appendTo(that.elem);
        return $input;
    };

    // 直传模式：点击上传入口唤起文件选择
    Uploads.prototype.initDirect = function () {
        var that = this;
        $(that.elem).off('click.directUpload').on('click.directUpload', '[data-upload]', function (event) {
            event.preventDefault();
            that.replaceTarget = null; // 新增模式
            that.getFileInput().click();
        });
        that.getFileInput();
    };

    // 中转模式（local 驱动）：沿用 layui.upload 组件
    Uploads.prototype.initUpload = function () {
        var that = this;
        upload.render({
            elem: $(that.elem).find('[data-upload]'),
            url: that.config.severUrl,
            multiple: that.config.multiple,
            accept: that.config.type,
            exts: that.config.exts,
            before: function () { layer.load(); },
            done: function (res) {
                layer.closeAll('loading');
                if (res.code === 0) {
                    that.applyUploaded(res.data);
                } else {
                    layer.msg(res.msg || '上传失败');
                }
            },
            error: function () {
                layer.closeAll('loading');
                layer.msg('上传失败');
            }
        });
    };

    // 处理一个选中文件：就地进度卡 + 统一内核上传；替换模式成功后走替换逻辑
    Uploads.prototype.handleFile = function (file) {
        var that = this;
        var replacingUrl = that.replaceTarget;
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
            // 单图非替换：进度卡失败后补回上传入口由 addItem 逻辑接管（入口在 list 外，无需重建）
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
