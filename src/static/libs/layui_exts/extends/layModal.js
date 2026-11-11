// 统一弹层：接管 [data-modal]、[data-open] 与表格新增/编辑
layui.define(['layer', 'jquery'], function (exports) {
    "use strict";
    const MODULE_NAME = 'layModal';
    const $ = layui.jquery;
    const layer = layui.layer;

    // 最近一次打开的弹层索引
    let currentIndex = null;

    const layModal = {
        /**
         * 请求页面并打开弹层
         * @param url 页面地址
         * @param options {title, width, height, type, data, maxmin, success, end}
         */
        open: function (url, options) {
            options = options || {};
            const type = options.type || 'GET';
            const loadIndex = layer.load(1, {shade: [0.1, '#000']});

            return $.ajax({
                url: url,
                type: type,
                data: options.data || {},
                success: function (res) {
                    layer.close(loadIndex);
                    // 接口返回 JSON 时统一按 code === 1 判断成功
                    if (res && typeof res === 'object') {
                        if (res.code !== 1) {
                            layer.msg(res.msg || '操作失败', {icon: 2});
                            return;
                        }
                        if (res.url) {
                            window.location.href = res.url;
                            return;
                        }
                        layer.msg(res.msg || '操作成功', {icon: 1});
                        return;
                    }
                    const width = options.width || ($(window).width() >= 1400 ? '800px' : '80%');
                    currentIndex = layer.open({
                        type: 1,
                        title: options.title || '',
                        content: res,
                        area: [width, options.height || 'auto'],
                        maxmin: options.maxmin !== false,
                        success: function (layero, index) {
                            if (typeof options.success === 'function') {
                                options.success(layero, index);
                            }
                        },
                        end: function () {
                            currentIndex = null;
                            if (typeof options.end === 'function') {
                                options.end();
                            }
                        }
                    });
                },
                error: function (xhr, textStatus) {
                    layer.close(loadIndex);
                    layer.msg('请求失败：' + textStatus, {icon: 2});
                }
            });
        },

        // 关闭最近一次打开的弹层
        closeCurrent: function () {
            if (currentIndex !== null) {
                layer.close(currentIndex);
                currentIndex = null;
            }
        },

        // 关闭指定元素所在的弹层，返回是否关闭成功
        closeByElem: function (elem) {
            const $layer = $(elem).closest('.layui-layer');
            if (!$layer.length) {
                return false;
            }
            const index = Number(String($layer.attr('id')).replace('layui-layer', ''));
            if (!isNaN(index)) {
                layer.close(index);
            }
            return true;
        },

        // 绑定 [data-modal] 点击事件
        bind: function (selector) {
            $('body').on('click', selector || '[data-modal]', function (e) {
                e.preventDefault();
                const $this = $(e.currentTarget);
                layModal.open($this.data('modal'), {
                    title: $this.data('title') || $this.text().trim(),
                    width: $this.data('width'),
                    type: $this.data('type') || 'GET',
                    end: function () {
                        if ($this.data('removeAfterClick')) {
                            $this.remove();
                        }
                    }
                });
            });
        }
    };

    exports(MODULE_NAME, layModal);
});
