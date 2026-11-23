// 上传组件 - UI 渲染层：容器、项模板、预览、图片查看。
// 导出方法集合，由 uploads-core 混入 Uploads.prototype。本层只依赖 config，不碰后端注入配置。
layui.define(['layer'], function (exports) {
    "use strict";

    var layer = layui.layer;

    // 渲染容器：上传入口始终放在 list 之外，避免 addItem 覆盖后无法再次上传
    function initView() {
        var that = this, viewHtml;
        if (that.config.type === 'images') {
            viewHtml = '<div class="layui-images-show">' +
                '<div class="layui-images-show-list"></div>' +
                '<div class="layui-images-show-item" data-upload>' +
                '<em class="layui-icon layui-icon-upload"></em>' +
                '</div>' +
                '</div>';
        } else {
            viewHtml = '<a class="layui-btn layui-btn-primary" data-upload>' +
                '<em class="layui-icon layui-icon-upload"></em>上传文件</a>\n' +
                '<div class="layui-files-show">\n' +
                '<div class="layui-files-show-list">\n' +
                '</div>\n' +
                '</div>';
        }
        $(that.elem).append(viewHtml);
    }

    // 获取项模板
    function getTemplate(type, url, name, size) {
        var that = this;
        switch (type) {
            case 'images':
                return '<div class="layui-images-show-item sortable-item" data-files-url="' + url + '">' +
                    (that.config.multiple === true
                        ? '<span class="drag"><em class="iconfont icon-drag"></em></span>'
                        : '') +
                    '<span class="del"><em class="layui-icon layui-icon-close"></em></span>' +
                    '<img src="' + url + '" alt="">' +
                    '<div class="layui-images-show-item-but">' +
                    '<span class="preview" title="预览"><em class="layui-icon layui-icon-eye"></em></span>' +
                    '<span class="replace" title="替换"><em class="layui-icon layui-icon-upload"></em></span>' +
                    '</div>' +
                    '</div>';
            default:
                var formattedSize = this.formatSize(size);
                return '<div class="layui-files-show-item sortable-item" data-files-url="' + url + '">' +
                    (that.config.multiple === true
                        ? '<span class="drag"><em class="iconfont icon-drag"></em></span>'
                        : '') +
                    '<a class="files" href="' + url + '" target="_blank"><em class="layui-icon layui-icon-file"></em>' + name + '</a>' +
                    '<span class="file-size">(' + formattedSize + ')</span>' +
                    '<span class="edit-name"><em class="layui-icon layui-icon-edit" title="修改文件名"></em></span>' +
                    '<span class="del"><em class="layui-icon layui-icon-close"></em></span>' +
                    '</div>';
        }
    };

    // 创建上传进度占位卡片（就地显示，图片用本地缩略图预览）
    // 返回 jQuery 对象，由 core 插入到列表并在完成时替换
    function createProgressCard(file) {
        var that = this;
        var isImage = that.config.type === 'images';
        var html;

        if (isImage) {
            var thumb = URL.createObjectURL && /^image\//.test(file.type)
                ? URL.createObjectURL(file) : '';
            html = '<div class="layui-images-show-item upload-progress-card" data-progress-card>' +
                (thumb ? '<img src="' + thumb + '" alt="">' : '<em class="layui-icon layui-icon-upload"></em>') +
                '<div class="upload-progress-mask">' +
                '<span class="upload-progress-percent">0%</span>' +
                '<div class="upload-progress-track"><div class="upload-progress-bar"></div></div>' +
                '</div>' +
                '</div>';
        } else {
            html = '<div class="layui-files-show-item upload-progress-card upload-progress-file" data-progress-card>' +
                '<em class="layui-icon layui-icon-loading"></em> ' + escapeHtml(file.name || 'uploading...') +
                ' <span class="upload-progress-percent">0%</span>' +
                '<div class="upload-progress-track"><div class="upload-progress-bar"></div></div>' +
                '</div>';
        }
        var $card = $(html);
        $card.data('objectUrl', thumb || '');
        return $card;
    }

    // 更新进度条：百分比文字 + 条宽
    function setProgress($card, percent) {
        percent = Math.max(0, Math.min(100, Number(percent) || 0));
        // 直传降级中转时进度会重新计数，这里只增不减，避免进度回退观感
        var prev = Number($card.attr('data-progress')) || 0;
        if (percent <= prev) return;
        $card.attr('data-progress', percent);
        $card.find('.upload-progress-percent').text(percent + '%');
        $card.find('.upload-progress-bar').css('width', percent + '%');
    }

    // 完成：释放缩略图 URL，移除占位卡（正式项由 core 调 addItem/replaceItem 插入）
    function removeProgressCard($card) {
        var objectUrl = $card.data('objectUrl');
        if (objectUrl && URL.revokeObjectURL) {
            URL.revokeObjectURL(objectUrl);
        }
        $card.remove();
    }

    // HTML 转义（文件名来自用户/剪贴板，防注入）
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // 格式化文件大小
    function formatSize(bytes) {
        if (isNaN(bytes) || bytes === 0) return '0 B';
        var k = 1024,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 渲染预览（初始隐藏域已有值时）
    function renderPreviews() {
        if (this.callback) return; // 回调模式不渲染初始预览

        var Input = $(this.elem).find('input[name="' + this.config.field + '"]');
        var items = Input.val() ? Input.val().split(',') : [];

        if (items.length > 0) {
            items.forEach(function (item) {
                var parts = item.split('|');
                var url = parts[0];
                var name = parts[1] || '';
                var size = parseFloat(parts[2]) || 0;

                if (this.config.type === 'images') {
                    this.addItem({ url: url });
                } else {
                    this.addItem({ url: url, name: name, size: size });
                }
            }, this);
        }
    };

    // 添加项到界面：单图清空 list，多图追加
    function addItem(data) {
        if (this.callback) return;

        var template = this.getTemplate(this.config.type, data.url, data.name, data.size);
        var containerSelector = this.config.type === 'images' ? '.layui-images-show-list' : '.layui-files-show-list';
        var $list = $(this.elem).find(containerSelector);
        if (this.config.multiple === true) {
            $list.append(template);
        } else {
            $list.html(template);
        }
        this.updateHiddenField(data);
    };

    // 替换指定 url 的项：移除旧 DOM 后走 addItem（隐藏域由 state 层覆盖处理）
    function replaceItem(oldUrl, data) {
        if (this.callback) return;
        var containerSelector = this.config.type === 'images' ? '.layui-images-show-list' : '.layui-files-show-list';
        $(this.elem).find(containerSelector).children('[data-files-url]').each(function () {
            if ($(this).attr('data-files-url') === oldUrl) {
                $(this).remove();
                return false;
            }
        });
        this.addItem(data);
    };

    // 图片预览（点击图片或预览按钮）
    function preview() {
        var that = this;
        $(that.elem).off('click.uploadPreview').on('click.uploadPreview', '.layui-images-show-item .preview, .layui-images-show-item img', function (e) {
            e.stopPropagation();
            var imageSrcs = [];
            $(that.elem).find('.layui-images-show-list img').each(function () {
                imageSrcs.push($(this).attr('src'));
            });
            if (!imageSrcs.length) return;
            var clicked = $(this).is('img') ? $(this).attr('src') : $(this).closest('[data-files-url]').find('img').attr('src');
            var start = clicked ? Math.max(0, imageSrcs.indexOf(clicked)) : 0;
            layer.photos({
                photos: {
                    "data": imageSrcs.map(function (src, index) {
                        return { alt: 'Image ' + (index + 1), pid: index + 1, src: src, thumb: src };
                    }),
                    start: start
                },
                anim: 5
            });
        });
    }

    exports('uploadsView', {
        initView: initView,
        getTemplate: getTemplate,
        createProgressCard: createProgressCard,
        setProgress: setProgress,
        removeProgressCard: removeProgressCard,
        formatSize: formatSize,
        renderPreviews: renderPreviews,
        addItem: addItem,
        replaceItem: replaceItem,
        preview: preview
    });
});
