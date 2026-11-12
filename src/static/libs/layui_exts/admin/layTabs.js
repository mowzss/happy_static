layui.define(["tabs", "layer", "jquery", 'dropdown'], function (exports) {
    const MODULE_NAME = "layTabs";

    const CLASS_NAMES = {
        TAB_CONTENT: 'happy-tab-content',
        ANIMATION_IN: 'animated slideInFromBottom'
    };
    const ID_SELECTORS = {
        LOADING_BAR: '#loading-bar',
        MENU_CONTAINER: '#menu-container',
        TOP_NAV: '#topNav'
    };


    let pageTabs = {};
    const $ = layui.jquery;
    const tabs = layui.tabs;
    const dropdown = layui.dropdown;
    const layer = layui.layer;

    // --- 重构后的数据获取函数 ---
    function _fetchContent(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'html',
                success: function (res) {
                    if (res.startsWith('{') || res.startsWith('[')) {
                        try {
                            resolve({type: 'json', data: JSON.parse(res)});
                        } catch (e) {
                            layer.msg('JSON解析错误');
                            console.error(e);
                            reject(e);
                        }
                    } else {
                        resolve({type: 'html', data: res});
                    }
                },
                error: function (xhr, status, error) {
                    layer.msg('加载失败，请重试！');
                    console.error('AJAX Error:', error);
                    reject(error);
                }
            });
        });
    }

    // ---: 引入内存缓存 ---
    let cachedTabsList = JSON.parse(sessionStorage.getItem('tabsList')) || [];

    // 辅助函数：将内存缓存同步到 sessionStorage
    function _syncToStorage(activeId = null) {
        sessionStorage.setItem('tabsList', JSON.stringify(cachedTabsList));
        if (activeId) {
            sessionStorage.setItem('tabsActiveId', activeId);
        }
    }

    // 正在加载中的页签，避免同一页签重复请求
    const loadingTabs = new Set();

    // 加载页签内容（仅在页签内容为空时调用）
    async function _loadTabContent($headerItem, $bodyItem) {
        const id = $headerItem.attr('lay-id');
        const url = $headerItem.attr('lay-url');
        if (!url || loadingTabs.has(id)) {
            return;
        }
        loadingTabs.add(id);
        try {
            const response = await _fetchContent(url);
            if (response.type === 'json') {
                if (response.data.info) layer.msg(response.data.info);
                if (response.data.url) {
                    setTimeout(() => window.location.href = response.data.url, 1500);
                }
                return;
            }
            // 请求期间页签已关闭或已切换到其它页签：丢弃本次结果，
            // 避免多个页签同时保留页面 HTML（表格配置 id 等会相互干扰）
            if (!$.contains(document, $headerItem[0]) || !$headerItem.hasClass('layui-this')) {
                return;
            }
            $bodyItem.empty().html(`<div class="${CLASS_NAMES.TAB_CONTENT} ${CLASS_NAMES.ANIMATION_IN}" style="display: block"
                             data-page-id="${id}"
                             data-src="${url}">
                            ${response.data}
                        </div>`);
        } catch (error) {
            console.error('Failed to load content for tab:', error);
        } finally {
            loadingTabs.delete(id);
        }
    }

    pageTabs = {
        config: {
            elem: "layTabs",
        },

        // ---: 拆分 activeTabMenu 的逻辑 ---
        _highlightMenuItem: function ($menuItem) {
            const $menuContainer = $(ID_SELECTORS.MENU_CONTAINER);
            $menuContainer.find('.layui-nav-item').removeClass('layui-this');

            if ($menuItem.length > 0) {
                $menuItem.parent('.layui-nav-item').addClass('layui-this');
            }
        },

        _expandParentMenu: function ($menuItem) {
            const pItem = $menuItem.parents('.side-menu-container > .layui-nav-item');
            if (pItem.length && !pItem.hasClass('layui-nav-itemed')) {
                pItem.addClass('layui-nav-itemed');
            }
        },

        _showSideContainer: function ($menuItem) {
            const $targetContainer = $menuItem.parents('.side-menu-container');

            if ($targetContainer.length > 0) {
                $(ID_SELECTORS.MENU_CONTAINER).find('.side-menu-container').hide();

                $targetContainer.show();
                return $targetContainer.attr('data-tab-id');
            }
            return null;
        },

        _activateTopNav: function (pid) {
            if (pid) {
                const $topNav = $(ID_SELECTORS.TOP_NAV);
                $topNav.find('.layui-nav-item').removeClass('layui-this');
                $topNav.find(`.layui-nav-item[data-tab-id="${pid}"]`).addClass('layui-this');
            }
        },

        activeTabMenu: function (tabId) {
            const $menuContainer = $(ID_SELECTORS.MENU_CONTAINER);
            const $menuItem = $menuContainer.find('[lay-id]').filter(function () {
                return $(this).attr('lay-id') === tabId;
            });

            this._highlightMenuItem($menuItem);

            const pid = this._showSideContainer($menuItem);
            this._expandParentMenu($menuItem);
            this._activateTopNav(pid);
        },
        // --- end ---

        rightMenu: function (opt) {
            let that = this;
            dropdown.render({
                elem: `#${that.config.elem} .layui-tabs-header>li`,
                trigger: 'contextmenu',
                data: [
                    {title: '关闭', icon: 'happy-admin-iconfont ha-icon-close', action: 'close', mode: 'this'},
                    {title: '刷新', icon: "happy-admin-iconfont ha-icon-refresh", action: 'refresh', mode: 'this'},
                    {type: '-'},
                    {
                        title: '关闭右侧',
                        icon: "happy-admin-iconfont ha-icon-close-right",
                        action: 'close',
                        mode: 'right'
                    },
                    {title: '关闭左侧', icon: "happy-admin-iconfont ha-icon-close-left", action: 'close', mode: 'left'},
                    {
                        title: '关闭其它',
                        icon: "happy-admin-iconfont ha-icon-close-other",
                        action: 'close',
                        mode: 'other'
                    },
                    {type: '-'},
                    {title: '关闭所有', icon: "happy-admin-iconfont ha-icon-close-all", action: 'close', mode: 'all'}
                ],
                click: function (data) {
                    let index = this.elem.index();
                    if (data.action === 'close') {
                        if (data.mode === 'this') {
                            tabs.close(that.config.elem, index);
                        } else {
                            tabs.closeMult(that.config.elem, data.mode, index);
                            if (data.mode === 'all') {
                                that.delSessionTabsAll();
                            } else {
                                let $tabs = $(`#${that.config.elem} .layui-tabs-header li`);
                                that.delSessionTabsAll();
                                $tabs.each(function () {
                                    let tabsData = {
                                        id: $(this).attr('lay-id'),
                                        title: $(this).text(),
                                        closable: $(this).attr('lay-closable') !== 'false',
                                        url: $(this).attr('lay-url')
                                    };
                                    that.updateSessionTabs(tabsData.id, tabsData);
                                });
                            }
                        }
                    } else if (data.action === 'refresh') {
                        that.reload($(this.elem).attr('lay-id'));
                    }
                },
                templet: function (d) {
                    return `<i class="${d.icon}" style="font-size: 14px"></i> ${d.title}`;
                }
            });
        },

        showLoadingBar: function () {
            $(ID_SELECTORS.LOADING_BAR).css('width', '0%').show();
            setTimeout(() => {
                $(ID_SELECTORS.LOADING_BAR).css('width', '100%');
            }, 0);
        },

        hideLoadingBar: function () {
            setTimeout(() => {
                $(ID_SELECTORS.LOADING_BAR).css('width', '0%').hide();
            }, 2000);
        },

        on: function () {
            let that = this;
            tabs.on('beforeChange(' + that.config.elem + ')', function (data) {
                // 点击的是当前页签时无需清理
                if (data && data.to && data.to.headerItem && data.thisHeaderItem
                    && data.to.headerItem[0] === data.thisHeaderItem[0]) {
                    return;
                }
                // 切换前清空所有页签内容：同一时刻只保留当前页签的 HTML，
                // 避免上一个页签的表格配置/DOM（如 #happy-table-config）被新页签读取
                $(`#${that.config.elem} .layui-tabs-body > .layui-tabs-item`).empty();
            });

            tabs.on('afterChange(' + that.config.elem + ')', function (data) {
                let $thisHeaderItem = $(data.thisHeaderItem);
                let $bodyItem = $(data.thisBodyItem);
                let id = $thisHeaderItem.attr('lay-id');

                // 已加载过的页签保留原内容，只有空页签才请求
                if (!$bodyItem.children().length) {
                    _loadTabContent($thisHeaderItem, $bodyItem);
                }
                _syncToStorage(id);
                that.activeTabMenu(id);
            });

            tabs.on('beforeClose(' + that.config.elem + ')', function (data) {
                let index = data.index;
                let id = $(data.container.header.items).eq(index).attr('lay-id');
                that.delSessionTabs(id);
                // 清理该页签内表格的登记配置（layTable 未加载时跳过）
                const layTable = layui.layTable;
                if (layTable && typeof layTable.prune === 'function') {
                    layTable.prune();
                }
            });
        },
        /**
         * 打开标签
         * @param opt
         */
        add: function (opt) {
            const that = this;
            if (!opt || typeof opt.id === 'undefined') {
                console.error('LayTabs.add: Missing required parameter "opt.id".');
                return;
            }
            let tabsAddLoad = layer.load(2);
            that.showLoadingBar();
            try {
                let id = String(opt.id);
                let config = $.extend({
                    id: String(opt.id),
                    done: function (data) {
                        that.rightMenu();
                        data.headerItem.attr('lay-url', opt.url);
                    },
                    content: '',
                }, opt);
                if (!that.tabIsExist(id)) {
                    tabs.add(that.config.elem, config);
                    // layui 的 tabs.add 内部切换页签时会跳过 beforeChange 事件，
                    // 导致“打开/切换页签时清空其他页签内容”的规则不生效。
                    // 这里手动执行一次，保证 data-menu-open 与菜单 lay-url 链路行为一致。
                    $(`#${that.config.elem} .layui-tabs-body > .layui-tabs-item`).empty();
                }
                // 恢复会话时非激活页签不切换，避免启动阶段依次加载所有页签
                if (opt.active !== false) {
                    tabs.change(that.config.elem, id);
                }
                that.updateSessionTabs(id, config);
            } finally {
                that.hideLoadingBar()
                layer.close(tabsAddLoad);
            }
        },
        /**
         * 重新加载指定页签的内容
         * @param id 页签 id，默认当前激活页签
         */
        reload: function (id) {
            const tabId = String(id || sessionStorage.getItem('tabsActiveId'));
            const $headerItems = $(`#${this.config.elem} .layui-tabs-header > li`);
            const $headerItem = $headerItems.filter(function () {
                return $(this).attr('lay-id') === tabId;
            });
            if (!$headerItem.length) {
                return;
            }
            const isActive = $headerItem.hasClass('layui-this');
            const $bodyItem = $(`#${this.config.elem} .layui-tabs-body > .layui-tabs-item`).eq($headerItems.index($headerItem));
            loadingTabs.delete(tabId);
            $bodyItem.empty();
            if (isActive) {
                _loadTabContent($headerItem, $bodyItem);
            } else {
                tabs.change(this.config.elem, tabId);
            }
        },
        /**
         * 刷新当前标签页
         * @param id
         */
        refresh: function (id) {
            this.reload(id);
        },
        tabIsExist: function (id) {
            let isExist = false;
            $(`#${this.config.elem}`).find('.layui-tabs-header li').each(function () {
                if ($(this).attr("lay-id") === id) {
                    isExist = true;
                    return false;
                }
            });
            return isExist;
        },
        close: function (id = null) {
            if (!id) {
                id = sessionStorage.getItem('tabsActiveId');
            }
            tabs.close(this.config.elem, id);
        },

        // --- 更新缓存函数 ---
        updateSessionTabs: function (tabId, newOpt) {
            let tabsId = String(tabId);

            let cacheOpt = {...newOpt};
            delete cacheOpt.content; // 移除 content 字段

            let index = cachedTabsList.findIndex(tab => tab.id === tabsId);

            if (index === -1) {
                cachedTabsList.push({id: tabsId, ...cacheOpt});
            } else {
                // 更新时也只更新不包含 content 的属性
                Object.assign(cachedTabsList[index], cacheOpt);
            }
            _syncToStorage(tabsId);
        },

        delSessionTabs: function (tabId) {
            let index = cachedTabsList.findIndex(tab => tab.id === tabId);
            if (index !== -1) {
                cachedTabsList.splice(index, 1);
                _syncToStorage();
            }
        },

        delSessionTabsAll: function () {
            this.clearCache();
        },

        // 清空页签缓存（内存 + sessionStorage）
        clearCache: function () {
            cachedTabsList = [];
            sessionStorage.removeItem('tabsList');
            sessionStorage.removeItem('tabsActiveId');
        },
        // --- end ---

    };

    exports(MODULE_NAME, pageTabs);
});
