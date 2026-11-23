// 统一弹层与声明式动作：接管 [data-modal]、[data-confirm-ajax]、[data-ajax]、[data-open]
layui.define(['layer', 'jquery'], function (exports) {
    "use strict";
    const MODULE_NAME = 'layModal';
    const $ = layui.jquery;
    const layer = layui.layer;

    // 最近一次打开的弹层索引
    let currentIndex = null;

    // 软依赖：按需取用已加载的 layui 模块，避免 define 层出现依赖倒挂
    function optional(name) {
        return layui[name] || null;
    }

    /**
     * 执行动作序列（data-before / data-then 共用），多个动作以英文逗号分隔。
     * - clear-session : 清空 sessionStorage
     * - clear-all     : 清空 sessionStorage + localStorage
     * - tab-cache     : 清理 layTabs 缓存（layTabs 已加载时）
     * - tab-reload    : 刷新当前 tab（layTabs 已加载时，否则降级为整页 reload）
     * - reload        : 整页刷新
     * - redirect      : 跳转到响应里的 res.url，或元素的 data-redirect
     * - close-current : 关闭最近一次弹层
     */
    function runActions(list, ctx) {
        if (!list) {
            return;
        }
        String(list).split(',').map(function (s) {
            return s.trim();
        }).filter(Boolean).forEach(function (action) {
            switch (action) {
                case 'clear-session':
                    try { sessionStorage.clear(); } catch (e) {}
                    break;
                case 'clear-all':
                    try { sessionStorage.clear(); localStorage.clear(); } catch (e) {}
                    break;
                case 'tab-cache':
                    var lt = optional('layTabs');
                    if (lt && typeof lt.clearCache === 'function') {
                        lt.clearCache();
                    }
                    break;
                case 'tab-reload':
                    var ltr = optional('layTabs');
                    if (ltr && typeof ltr.reload === 'function') {
                        ltr.reload();
                    } else {
                        setTimeout(function () { location.reload(); }, 600);
                    }
                    break;
                case 'reload':
                    setTimeout(function () { location.reload(); }, 800);
                    break;
                case 'redirect':
                    var url = (ctx.res && ctx.res.url) || ctx.$this.data('redirect') || '';
                    if (url) {
                        setTimeout(function () { location.href = url; }, 1000);
                    }
                    break;
                case 'close-current':
                    layModal.closeCurrent();
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * 统一 ajax：loading → msg → 成功后按 data-then 执行后续动作
     */
    function request($this, type, url, data) {
        const ld = layer.load(1);
        return $.ajax({
            url: url,
            type: type || 'POST',
            dataType: 'json',
            data: data || {},
            success: function (res) {
                layer.close(ld);
                res = res || {};
                layer.msg(res.msg || '操作完成', {icon: res.code === 1 ? 1 : 2});
                if (res.code === 1) {
                    runActions($this.data('then'), {res: res, $this: $this});
                }
            },
            error: function () {
                layer.close(ld);
                layer.msg('网络错误', {icon: 2});
            }
        });
    }

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

        /**
         * 一次性绑定全部声明式动作（命名空间 click.layModal，重复调用不会叠加）。
         * 保留 selector 形参仅为兼容旧的 bind('[data-modal]') 调用，实际忽略。
         */
        bind: function (selector) {
            const $body = $('body');
            $body.off('click.layModal');

            // [data-modal] → 请求页面并开弹层
            $body.on('click.layModal', '[data-modal]', function (e) {
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

            // [data-open] → 同 data-modal（历史命名，从 layAdmin 迁入）
            $body.on('click.layModal', '[data-open]', function (e) {
                e.preventDefault();
                const $this = $(e.currentTarget);
                layModal.open($this.data('open'), {
                    title: $this.data('title') || $this.text().trim(),
                    type: $this.data('type') || 'GET',
                    width: $this.data('width')
                });
            });

            // [data-confirm-ajax] → 确认后发起 ajax，按 data-then 处理后续动作
            $body.on('click.layModal', '[data-confirm-ajax]', function (e) {
                e.preventDefault();
                const $this = $(e.currentTarget);
                const tip = $this.data('tip') || '确认执行此操作？';
                layer.confirm(tip, {
                    icon: 3,
                    title: $this.data('title') || '操作确认'
                }, function (i) {
                    layer.close(i);
                    runActions($this.data('before'), {$this: $this});
                    request(
                        $this,
                        $this.data('type') || 'POST',
                        $this.data('confirmAjax'),
                        $this.data('value') || {}
                    );
                });
            });

            // [data-ajax] → 直接 ajax，按 data-then 处理后续动作（从 layAdmin 迁入）
            $body.on('click.layModal', '[data-ajax]', function (e) {
                e.preventDefault();
                const $this = $(e.currentTarget);
                request(
                    $this,
                    $this.data('type') || 'GET',
                    $this.data('ajax'),
                    $this.data('value') || {}
                );
            });
        }
    };

    exports(MODULE_NAME, layModal);
});
