// admin.js
layui.define(['util', 'element', 'layer', 'jquery', 'layTabs', 'layMenu'], function (exports) {
    "use strict";

    const SELECTORS = {
        LAYOUT_ADMIN: '.layui-layout-admin',// 布局元素
        NAV_ITEM_ICON: '.layui-nav-item i',// 导航图标
        CONTENT_WRAPPER: '#happy-content',// tabs 容器
        LOADING_MASK: '.loading-mask', // 加载遮罩
        DATA_OPEN: '[data-open]', // 全屏窗口打开
        DATA_MENU_OPEN: '[data-menu-open]',// 菜单打开
        DATA_WIN_OPEN: '[data-win-open]',// 窗口打开
        DATA_AJAX: '[data-ajax]'// ajax 请求
    };

    const STORAGE_KEYS = {
        MINI_MENU: 'mimiMenu',
        TABS_LIST: 'tabsList',
        TABS_ACTIVE_ID: 'tabsActiveId'
    };

    const CSS_CLASSES = {
        MINI_NAV: 'mini-nav',
        HIDDEN: 'hidden',
        LAYUI_THIS: 'layui-this',
        LAYUI_NAV_ITEMED: 'layui-nav-itemed'
    };
    // ---------------------------------------------

    let util = layui.util,
        layer = layui.layer,
        $ = layui.jquery,
        tabs = layui.tabs,
        layTabs = layui.layTabs,
        layMenu = layui.layMenu,
        element = layui.element;

    const MODULE_NAME = 'layAdmin';

    let admin = {
        config: {
            menuUrl: '',
        },

        // --- 封装获取布局元素的函数 ---
        _getLayoutElement: function () {
            return $(".happy-admin-layout").find(SELECTORS.LAYOUT_ADMIN);
        },

        // --- 封装菜单切换的核心逻辑 ---
        _toggleMenu: function () {
            const $elem = this._getLayoutElement();
            const isMinified = $elem.hasClass(CSS_CLASSES.MINI_NAV);

            if (isMinified) {
                // 展开菜单
                $(SELECTORS.NAV_ITEM_ICON).css("left", 25);
                $elem.removeClass(CSS_CLASSES.MINI_NAV);
                sessionStorage.setItem(STORAGE_KEYS.MINI_MENU, 'false');
            } else {
                // 收缩菜单
                $(SELECTORS.NAV_ITEM_ICON).css("left", 20);
                $elem.addClass(CSS_CLASSES.MINI_NAV);
                sessionStorage.setItem(STORAGE_KEYS.MINI_MENU, 'true');
            }
        },

        // --- 封装从 sessionStorage 初始化菜单状态的逻辑 ---
        _initMenuState: function () {
            const savedState = sessionStorage.getItem(STORAGE_KEYS.MINI_MENU);
            const $elem = this._getLayoutElement();

            if (savedState === 'true') {
                $(SELECTORS.NAV_ITEM_ICON).css("left", 20);
                $elem.addClass(CSS_CLASSES.MINI_NAV);
            } else {
                $(SELECTORS.NAV_ITEM_ICON).css("left", 25);
                $elem.removeClass(CSS_CLASSES.MINI_NAV);
            }
        },

        // 初始化
        render: function (options) {
            this.config = $.extend({}, this.config, options);

            // 1. 先渲染并初始化菜单状态
            this._initMenuState();

            // 2. 渲染各组件
            this.renderTabs();
            layMenu.render(this.config.menuUrl);
            this.initTabs(); // 在菜单渲染后再初始化Tabs，以保证菜单高亮正确

            // 3. 绑定事件
            this.events();

            // 4. 完成渲染
            this.closeLoading();
        },

        // 初始化记录的标签
        initTabs: function () {
            let tabsList = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.TABS_LIST)) || [];
            let activeId = String(sessionStorage.getItem(STORAGE_KEYS.TABS_ACTIVE_ID));

            // 重新添加所有保存的Tab
            tabsList.forEach((tab) => {
                if (tab.id !== activeId) {
                    tab.active = false;
                    tab.isAjax = false; // 初始化时默认不执行ajax
                }
                layTabs.add(tab);
            });

            // 设置激活的Tab
            if (activeId && tabsList.some(tab => tab.id === activeId)) {
                tabs.change(layTabs.config.elem, activeId);
            } else if (tabsList.length > 0) {
                // 如果没有保存的激活Tab，选择第一个Tab作为默认激活
                tabs.change(layTabs.config.elem, tabsList[0].id);
            }
        },

        // 动态渲染layui-body-tabs
        renderTabs: function () {
            let tabsHtml = `
                <div class="layui-body-tabs layui-tab-rollTool layui-tabs layui-hide-v" 
                     id="${layTabs.config.elem}" 
                     lay-options="{headerMode:'scroll',closable:true}">
                    <ul class="layui-tabs-header"></ul>
                    <div class="layui-tabs-body"></div>        
                </div>
            `;
            $(SELECTORS.CONTENT_WRAPPER).html(tabsHtml);
            tabs.render();
        },

        // 关闭遮罩层
        closeLoading: function () {
            $(SELECTORS.LOADING_MASK).addClass(CSS_CLASSES.HIDDEN);
        },
        showLoading: function () {
            $(SELECTORS.LOADING_MASK).removeClass(CSS_CLASSES.HIDDEN);
        },

        // 事件监听
        events: function () {
            layTabs.on(); // 监听标签页切换事件

            // 1. 监听 layui 自定义事件
            util.event('lay-header-event', {
                home: () => {
                    tabs.change(layTabs.config.elem, 'home');
                },

                // 清理缓存
                cleanCache: (othis) => {
                    let url = othis.data('url');
                    layer.confirm('确认清理缓存？', () => {
                        sessionStorage.clear();
                        if (url) {
                            $.ajax({
                                url: url,
                                type: 'GET',
                                success: (res) => layer.msg(res.msg)
                            });
                        } else {
                            layer.msg('本地缓存已清空');
                        }
                    });
                },

                // 网页全屏
                fullScreen: (othis) => {
                    let iconElement = othis.find('em');
                    let isFullscreen = !!document.fullscreenElement;

                    const toggleIconAndTitle = (entering) => {
                        if (entering) {
                            iconElement.removeClass('layui-icon-screen-full').addClass('layui-icon-screen-restore');
                            othis.attr('title', "退出全屏");
                        } else {
                            iconElement.removeClass('layui-icon-screen-restore').addClass('layui-icon-screen-full');
                            othis.attr('title', "全屏");
                        }
                    };

                    const requestOrExit = isFullscreen
                        ? layTabs.exitFullscreen()
                        : layTabs.requestFullscreen(document.documentElement);

                    requestOrExit.then(() => toggleIconAndTitle(!isFullscreen))
                        .catch(() => layer.msg(`${isFullscreen ? '退出' : '进入'}全屏模式失败,请手动操作`));
                },

                logout: (othis) => {
                    let url = othis.data('href');
                    if (url) {
                        layer.confirm('确认退出系统？', () => {
                            $.ajax({
                                url: url,
                                type: 'GET',
                                success: (res) => {
                                    layer.msg(res.msg);
                                    if (res.code === 1) {
                                        setTimeout(() => {
                                            sessionStorage.clear();
                                            localStorage.clear();
                                            location.href = res.url;
                                        }, 1000);
                                    }
                                }
                            });
                        });
                    }
                },

                // 菜单切换
                menuSwitch: () => {
                    this._toggleMenu();
                },
            });

            // 2. 监听原生DOM事件
            this.onBody();
        },

        // 原生事件监听
        onBody: function () {
            const $body = $('body');

            // 通用 Tab 打开事件
            $body.on('click', SELECTORS.DATA_MENU_OPEN, (e) => {
                e.preventDefault(); // 阻止默认行为，防止锚点跳转
                let $target = $(e.target);
                let url = $target.data('menu-open');
                let id = url.split('?')[0];
                let title = $target.text().trim(); // 去除可能的空白字符
                // 检测url如果非内部链接则新标签跳转
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    // 如果是外部链接，则在新标签页中打开
                    try {
                        const currentHost = window.location.host;
                        const urlObj = new URL(url);
                        if (urlObj.host !== currentHost) {
                            // 外部链接，在新标签页打开
                            window.open(url, '_blank');
                            return; // 不执行后续的layTabs.add
                        }
                    } catch (e) {
                        // 如果URL格式不正确，也作为外部链接处理
                        window.open(url, '_blank');
                        return;
                    }
                }
                layTabs.add({
                    id: id,
                    title: title,
                    url: url,
                    closable: true,
                    change: true,
                });
            });

            // 新窗口打开事件
            $body.on('click', SELECTORS.DATA_WIN_OPEN, (e) => {
                let url = $(e.target).data('winOpen');
                window.open(url, '_blank');
            });

            // Ajax 请求事件
            $body.on('click', SELECTORS.DATA_AJAX, (e) => {
                e.preventDefault(); // 阻止默认行为
                let $this = $(this);
                let index = layer.load(1);

                let url = $this.data('ajax');
                let type = $this.data('type') || 'GET';
                let value = $this.data('value') || {};

                $.ajax({
                    url: url,
                    type: type,
                    data: value,
                    success: (res) => {
                        layer.close(index);
                        layer.msg(res.msg, {icon: res.code === 1 ? 1 : 2}); // code=1用对号，其他用叉号
                    },
                    error: () => {
                        layer.close(index);
                        layer.msg('网络错误');
                    }
                });
            });
            $body.on('click', SELECTORS.DATA_OPEN, (e) => {
                e.preventDefault();
                const $this = $(e.target);
                let url = $this.data('open');
                let type = $this.data('type') || 'GET';
                let title = $this.data('title') || $this.text().trim() || '窗口操作';
                $.ajax({
                    url: url,
                    type: type,
                    success: (res) => {
                        layer.open({
                            type: '1',
                            title: title,
                            content: res,
                            maxmin: true,
                            area: ['80%', '80%'],
                        })
                    }
                })
            })
        },
    };

    exports(MODULE_NAME, admin);
});
