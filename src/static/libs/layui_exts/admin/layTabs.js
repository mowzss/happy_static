layui.define(["tabs", "layer", "jquery", 'dropdown'], function (exports) {
    const MODULE_NAME = "layTabs";

    // --- 将硬编码的ID和类名提取为常量 ---
    const CLASS_NAMES = {
        TAB_CONTENT: 'happy-tab-content',
        ANIMATION_IN: 'animated slideInFromBottom'
    };
    const ID_SELECTORS = {
        LOADING_BAR: '#loading-bar',
        MENU_CONTAINER: '#menu-container',
        TOP_NAV: '#topNav'
    };
    // ---------------------------------------------

    let pageTabs = {};
    let $ = layui.jquery;
    let tabs = layui.tabs;
    let dropdown = layui.dropdown;
    let layer = layui.layer;

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
                        tabs.change(that.config.elem, index);
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
                $(`#${that.config.elem}`).find('.layui-tabs-body > .layui-tabs-item').empty();
            });

            tabs.on('afterChange(' + that.config.elem + ')', async function (data) {
                let $thisHeaderItem = $(data.thisHeaderItem);
                let id = $thisHeaderItem.attr('lay-id');
                let url = $thisHeaderItem.attr('lay-url');

                if (url) {
                    try {
                        const response = await _fetchContent(url);
                        const $bodyItem = $(data.thisBodyItem);
                        $bodyItem.empty();

                        if (response.type === 'json') {
                            if (response.data.info) layer.msg(response.data.info);
                            if (response.data.url) {
                                setTimeout(() => window.location.href = response.data.url, 1500);
                            }
                        } else if (response.type === 'html') {
                            $bodyItem.html(`<div class="${CLASS_NAMES.TAB_CONTENT} ${CLASS_NAMES.ANIMATION_IN}" style="display: block" 
                                             data-page-id="${$bodyItem.attr('data-page-id')}" 
                                             data-src="${url}">
                                            ${response.data}
                                        </div>`);
                        }
                    } catch (error) {
                        console.error('Failed to load content for active tab:', error);
                    }
                }
                _syncToStorage(id);
                that.activeTabMenu(id);
            });

            tabs.on('beforeClose(' + that.config.elem + ')', function (data) {
                let index = data.index;
                let id = $(data.container.header.items).eq(index).attr('lay-id');
                that.delSessionTabs(id);
            });
        },
        /**
         * 打开标签
         * @param opt
         * @returns {Promise<void>}
         */
        add: async function (opt) {
            // --- 增加参数校验 ---
            if (!opt || typeof opt.id === 'undefined') {
                console.error('LayTabs.add: Missing required parameter "opt.id".');
                return;
            }
            // -------------------------

            let that = this;
            let id = String(opt.id);
            let config = $.extend({
                id: String(opt.id),
                done: function (data) {
                    that.rightMenu();
                    data.headerItem.attr('lay-url', opt.url);
                },
                content: '',
            }, opt);

            let PageUrl = config.url;
            let isAjax = opt.isAjax ?? true;

            that.showLoadingBar();

            if (!that.tabIsExist(id)) {
                if (PageUrl && isAjax) {
                    try {
                        const response = await _fetchContent(PageUrl);

                        if (response.type === 'json') {
                            if (response.data.info) layer.msg(response.data.info);
                            if (response.data.url) {
                                setTimeout(() => window.location.href = response.data.url, 1500);
                            }
                        } else if (response.type === 'html') {
                            config.content = `<div class="${CLASS_NAMES.TAB_CONTENT}" style="display: block"
                                                 data-page-id="${id}"
                                                 data-src="${PageUrl}">
                                                ${response.data}
                                            </div>`;
                            tabs.add(that.config.elem, config);
                        }
                    } catch (error) {
                        console.error('Failed to load content for new tab:', id, error);
                    }
                } else {
                    tabs.add(that.config.elem, config);
                }
            } else {
                tabs.change(that.config.elem, id);
            }

            that.updateSessionTabs(id, config);
            that.hideLoadingBar();
        },
        /**
         * 刷新当前标签页
         * @param id
         */
        refresh: function (id) {
            const activeId = String(sessionStorage.getItem('tabsActiveId'));
            let index = id || activeId;
            tabs.change(this.config.elem, index);
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
        del: function (id = null) {
            if (!id) {
                id = sessionStorage.getItem('tabsActiveId');
            }
            tabs.del(this.config.elem, id);
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
            cachedTabsList = [];
            sessionStorage.removeItem('tabsList');
        },
        // --- end ---

        requestFullscreen: function (element) {
            return new Promise((resolve, reject) => {
                if (element.requestFullscreen) {
                    element.requestFullscreen().then(resolve).catch(reject);
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen().then(resolve).catch(reject);
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen().then(resolve).catch(reject);
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen().then(resolve).catch(reject);
                } else {
                    reject(new Error("浏览器不支持全屏"));
                }
            });
        },

        exitFullscreen: function () {
            return new Promise((resolve, reject) => {
                if (document.exitFullscreen) {
                    document.exitFullscreen().then(resolve).catch(reject);
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen().then(resolve).catch(reject);
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen().then(resolve).catch(reject);
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen().then(resolve).catch(reject);
                } else {
                    reject(new Error("浏览器不支持退出全屏"));
                }
            });
        },
    };

    exports(MODULE_NAME, pageTabs);
});
