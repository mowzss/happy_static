layui.define(["element", 'util', "layer"], function (exports) {
    let element = layui.element,
        $ = layui.jquery,
        util = layui.util,
        layer = layui.layer;


    // 定义 rightMenu 类
    let RightMenu = function (config) {
        // 默认配置
        const defaultConfig = {
            filter: pageTab.config.tabFilter,  // 必须指定
            naletr: [      // 默认菜单项
                {eventName: "closeThis", title: "关闭", icon: "iconfont icon-cuowuguanbiquxiao"},
                {eventName: "refreshThis", title: "刷新标签", icon: "iconfont icon-shuaxin"},
                {eventName: "toggleFullScreen", title: "全屏显示", icon: "layui-icon layui-icon-screen-full"},  // 合并为一个事件
                {eventName: "line", title: ""},  // 分割线
                {eventName: "closeLeft", title: "关闭左侧标签页", icon: "iconfont icon-diyiye"},
                {eventName: "closeRight", title: "关闭右侧标签页", icon: "iconfont icon-zuihouye"},
                {eventName: "line", title: ""},  // 分割线
                {eventName: "closeOther", title: "关闭其它标签页", icon: "iconfont icon-hengxiangshouqi"},
                {eventName: "closeAll", title: "关闭所有标签页", icon: "iconfont icon-guanbiquanbu"},

            ]
        };
        // 合并默认配置和用户提供的配置
        this.config = {...defaultConfig, ...config};
        // 如果传入了配置项，则立即调用 render 方法
        if (this.config) {
            this.render(this.config);
        }
    };

// 渲染右键菜单
    RightMenu.prototype.render = function (config) {
        if (!config.filter) {
            console.error("[ERROR] 使用 tabRightMenu 组件需要指定 'filter' 属性！");
            return;
        }
        this.filter = config.filter;
        this.naletr = config.naletr;

        // 判断是否处于全屏模式
        if (document.fullscreenElement === this.fullScreenTarget) {
            // 如果处于全屏模式，将右键菜单附加到全屏目标元素上
            if (!this.menuElement) {
                this.menuElement = $("<ul class='right-menu'></ul>").appendTo(this.fullScreenTarget);
            }
        } else {
            // 如果不是全屏模式，将右键菜单附加到 body 上
            if (!this.menuElement) {
                this.menuElement = $("<ul class='right-menu'></ul>").appendTo("body");
            }
        }

        this.renderMenuItems();
        this.bindEvents();

        // 获取指定的全屏目标元素
        this.fullScreenTarget = document.querySelector('[lay-filter="' + this.filter + '"]');

        // 监听全屏状态变化（仅针对指定的全屏目标元素）
        if (this.fullScreenTarget) {
            this.fullScreenTarget.addEventListener('fullscreenchange', () => {
                this.updateFullScreenMenuItem();
                this.updateMenuParent();  // 更新右键菜单的父元素
            });
        } else {
            console.error("[ERROR] 未找到符合 'filter' 的全屏目标元素！");
        }

    };
    // 更新右键菜单的父元素
    RightMenu.prototype.updateMenuParent = function () {
        if (document.fullscreenElement === this.fullScreenTarget) {
            // 进入全屏模式，将右键菜单附加到全屏目标元素
            this.menuElement.appendTo(this.fullScreenTarget);
        } else {
            // 退出全屏模式，将右键菜单重新附加到 body
            this.menuElement.appendTo("body");
        }
    };
// 渲染菜单项
    RightMenu.prototype.renderMenuItems = function () {
        this.menuElement.empty();  // 清空之前的菜单项
        this.naletr.forEach(item => {
            if (item.eventName === "line") {
                $("<hr>").appendTo(this.menuElement);
            } else {
                let li = $("<li class='right-menu-item'  data-event='" + item.eventName + "'>" +
                    "<i class='" + item.icon + "'></i> " + item.title +
                    "</li>")
                    .appendTo(this.menuElement);
            }
        });

        // 初始化全屏菜单项的状态
        this.updateFullScreenMenuItem();
    };

// 更新全屏菜单项的状态
    RightMenu.prototype.updateFullScreenMenuItem = function () {
        let fullScreenItem = this.menuElement.find("[data-event='toggleFullScreen']"),
            $fullScreenBtn = $('[lay-header-event="tabFullScreen"]');
        if (document.fullscreenElement === this.fullScreenTarget) {
            // 当前处于全屏模式，更新为“退出全屏”
            fullScreenItem.html("<i class='layui-icon layui-icon-screen-restore'></i> 退出全屏");
            $fullScreenBtn.html("<em class='layui-icon layui-icon-screen-restore'></em>")
        } else {
            // 当前未处于全屏模式，更新为“全屏显示”
            fullScreenItem.html("<i class='layui-icon layui-icon-screen-full'></i> 全屏显示");
            $fullScreenBtn.html("<em class='layui-icon layui-icon-screen-full'></em>");
        }

    };

    // 绑定事件
    RightMenu.prototype.bindEvents = function () {
        let self = this;

        // 右键点击事件
        $("#happy-content .layui-body-tabs").on("contextmenu", ".layui-tab-title > li", (e) => {
            e.preventDefault();
            self.showMenu(e, $(e.currentTarget).attr("lay-id"));
        });

        // 点击空白处隐藏菜单
        $(document).off("click.rightMenu");
        $(document).on("click.rightMenu", (e) => {
            if (!self.menuElement.is(e.target) && self.menuElement.has(e.target).length === 0) {
                self.hideMenu();
            }
        });

        // 菜单项点击事件（使用事件委托）
        self.menuElement.off("click.rightMenuItem");
        self.menuElement.on("click.rightMenuItem", "li[data-event]", (e) => {
            e.stopPropagation();
            let event = $(e.currentTarget).attr("data-event");
            if (event) {
                self.handleMenuItemClick(event);
            }
        });
    };

// 显示右键菜单
    RightMenu.prototype.showMenu = function (e, tabId) {
        if (!tabId) {
            return;
        }

        this.currentActiveTabID = tabId;
        let menu = this.menuElement;

        // 计算菜单的偏移量
        let offset = $(document).width() - e.clientX < menu.width() ? e.clientX - menu.width() : e.clientX;
        let topOffset = $(document).height() - e.clientY < menu.height() ? e.clientY - menu.height() : e.clientY;

        // 如果处于全屏模式，确保菜单的定位是相对于全屏目标元素
        if (document.fullscreenElement === this.fullScreenTarget) {
            let targetOffset = $(this.fullScreenTarget).offset();
            offset -= targetOffset.left;
            topOffset -= targetOffset.top;
        }

        menu.css({left: offset, top: topOffset}).show();
    };

    // 隐藏右键菜单
    RightMenu.prototype.hideMenu = function () {
        this.menuElement.hide();
    };

    // 处理菜单项点击
    RightMenu.prototype.handleMenuItemClick = function (event) {
        if (!event) {
            return;
        }
        pageTab.onTab();
        let tabs = $(".layui-tab[lay-filter='" + this.filter + "'] li");
        let foundCurrent = false;

        switch (event) {
            case "refreshThis":
                // 刷新当前标签页
                let currentTab = $(`.layui-tab-item[lay-id="${this.currentActiveTabID}"]`);
                if (currentTab.length) {
                    $('[lay-header-event="refreshTab"]').trigger('click');
                }
                break;

            case "closeThis":

                element.tabDelete(this.filter, this.currentActiveTabID);
                let nextTab = tabs.not(`[lay-id="${this.currentActiveTabID}"]`).first();
                if (nextTab.length) {
                    element.tabChange(this.filter, nextTab.attr("lay-id"));
                }

                break;
            case 'toggleFullScreen':
                this.toggleFullScreen();
                break;
            case "closeAll":
                $.each(tabs, (index, tab) => {
                    let id = $(tab).attr("lay-id");
                    element.tabDelete(this.filter, id);
                });
                break;

            case "closeOther":
                $.each(tabs, (index, tab) => {
                    let id = $(tab).attr("lay-id");
                    if (id === this.currentActiveTabID) {
                        return;
                    }
                    element.tabDelete(this.filter, id);
                });
                break;

            case "closeLeft":
                $.each(tabs, (index, tab) => {

                    let id = $(tab).attr("lay-id");
                    if (id === this.currentActiveTabID) {
                        foundCurrent = true;
                        return;
                    }

                    if (foundCurrent) {
                        return;
                    }
                    element.tabDelete(this.filter, id);
                });
                break;

            case "closeRight":
                foundCurrent = false;
                $.each(tabs, (index, tab) => {
                    let id = $(tab).attr("lay-id");
                    if (id === this.currentActiveTabID) {
                        foundCurrent = true;
                        return;
                    }

                    if (foundCurrent) {
                        setTimeout(() => {
                            element.tabDelete(this.filter, id);
                        }, 0);
                    }
                });
                break;

            default:
                break;
        }

        this.hideMenu();
    };

// 切换全屏状态
    RightMenu.prototype.toggleFullScreen = function () {
        if (!this.fullScreenTarget) {
            console.error("[ERROR] 未找到符合 'filter' 的全屏目标元素！");
            return;
        }

        if (!document.fullscreenElement) {
            // 请求特定区域全屏
            try {
                pageTab.requestFullscreen(this.fullScreenTarget).then(() => {
                    this.updateFullScreenMenuItem();
                    this.updateMenuParent();  // 更新右键菜单的父元素
                }).catch(err => {
                    layer.msg("无法进入全屏模式,请手动操作");
                });
            } catch (err) {
                layer.msg("无法进入全屏模式,请手动操作");
            }
        } else {
            // 退出全屏
            try {
                pageTab.exitFullscreen().then(() => {
                    this.updateFullScreenMenuItem();
                    this.updateMenuParent();  // 更新右键菜单的父元素
                }).catch(err => {
                    layer.msg("无法退出全屏模式,请手动操作");
                });
            } catch (err) {
                layer.msg("无法退出全屏模式,请手动操作");
            }
        }
    };

    // 自动滚动到激活的tab
    function autoScrollToActiveTab($container, $activeTab) {
        let containerScrollLeft = $container.scrollLeft();
        let activeTabOffsetLeft = $activeTab.offset().left - $container.offset().left + $container.scrollLeft();
        let activeTabWidth = $activeTab.outerWidth();

        $container.animate({
            scrollLeft: activeTabOffsetLeft - ($container.width() - activeTabWidth) / 2
        }, 300);
    }


    // 定义 pageTab 模块
    let pageTab = {

        config: {
            tabFilter: 'layout-filter-tab',//tab选择器
            tabsContent: '#happy-content > .layui-body-tabs'
        },

        // 显示加载进度条
        showLoadingBar: function () {
            $('#loading-bar').css('width', '0%').show();
            setTimeout(() => {
                $('#loading-bar').css('width', '100%');
            }, 0);
        },

        // 隐藏加载进度条
        hideLoadingBar: function () {
            setTimeout(() => {
                $('#loading-bar').css('width', '0%').hide();
            }, 2000); // 模拟加载时间
        },

        // 获取当前激活的标签页 ID
        getActiveTabId: function () {
            return $(this.config.tabsContent).find(`.layui-tab-title li[lay-id].layui-this`).attr('lay-id');
        },

        // 刷新当前激活的标签页
        refreshTab: function () {
            let that = this,
                activeId = this.getActiveTabId();

            if (!activeId) return; // 如果没有激活的标签页，直接返回

            element.tabChange(that.config.tabFilter, activeId);
        },

        // 添加新标签页
        addTab: function (opt) {
            let that = this,
                id = String(opt.id),
                url = opt.url,
                change = opt.change ?? false,
                allowClose = opt.allowClose ?? true,
                title = opt.title;

            if (!that.tabIsExist(id)) { // 检查是否存在 tab
                // 新增一个Tab项
                element.tabAdd(that.config.tabFilter, {
                    id: id,
                    title: title,
                    url: url,
                    change: change,
                    allowClose: allowClose,
                });
            } else {
                $(`[lay-filter="${that.config.tabFilter}"]`).find('[data-page-id="' + id + '"]').attr('data-src', url)
                if (change) {
                    element.tabChange(that.config.tabFilter, id);
                }
            }
        },
        updateTabData: function (tabId, newOpt) {
            let tabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
            let tabsId = String(tabId);
            // 找到需要更新的Tab
            let index = tabs.findIndex(tab => tab.id === tabsId);

            if (index === -1) {
                // 如果未找到Tab，则直接新增到最后
                tabs.push({id: tabsId, ...newOpt});
            }
            // 更新 sessionStorage
            sessionStorage.setItem('tabsList', JSON.stringify(tabs));
            sessionStorage.setItem('tabsActiveId', tabsId);

        },
        delTabData: function (tabId) {
            let that = this;
            let tabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
            let activeId = sessionStorage.getItem('tabsActiveId');

            // 找到需要删除的Tab，并移除它
            let index = tabs.findIndex(tab => tab.id === tabId);

            if (index !== -1) {
                // 如果找到Tab，则从数组中移除
                tabs.splice(index, 1);
                // 如果删除的是当前激活的Tab，选择一个新的激活Tab
                if (tabId === activeId) {
                    if (tabs.length > 0) {
                        // 选择第一个Tab作为新的激活Tab
                        activeId = tabs[0].id;
                        element.tabChange(that.config.tabFilter, activeId);
                    } else {
                        // 如果没有其他Tab，清除激活Tab ID
                        activeId = null;
                    }
                }
                // 更新 sessionStorage
                sessionStorage.setItem('tabsList', JSON.stringify(tabs));
                sessionStorage.setItem('tabsActiveId', activeId);
            } else {
                // 如果未找到Tab，但仍需检查是否是当前激活的Tab
                if (tabId === activeId) {
                    if (tabs.length > 0) {
                        // 选择第一个Tab作为新的激活Tab
                        activeId = tabs[0].id;
                    } else {
                        // 如果没有其他Tab，清除激活Tab ID
                        activeId = null;
                    }
                    sessionStorage.setItem('tabsActiveId', activeId);
                }
            }
        },
        // 检查标签页是否存在
        tabIsExist: function (id) {
            let isExist = false;
            $(this.config.tabsContent).find('.layui-tab-title li').each(function () {
                if ($(this).attr("lay-id") === id) {
                    isExist = true;
                    return false;
                }
            });
            return isExist;
        },

        // 清空其他标签页的内容
        clearOtherTabsContent: function (activeId) {
            $(this.config.tabsContent).find('.layui-tab-item').each(function () {
                let tabId = $(this).attr("lay-id");
                if (tabId !== activeId) {
                    $(this).find(".happy-tab-content").empty(); // 清空内容
                }
            });
        },
        // 监听标签页切换事件
        onTab: function () {
            let that = this;
            //切换标签页时，自动滚动到当前标签页
            element.on('tab(' + this.config.tabFilter + ')', function (data) {
                let $this = $(data.elem);
                let $activeTab = $this.find('.layui-this');
                autoScrollToActiveTab($this, $activeTab);
                let newId = data.id;

                // 获取目标标签页的信息
                let $targetTabTitle = $this.find(`.layui-tab-title li[lay-id="${newId}"]`);
                let url = $targetTabTitle.attr('lay-url');
                let allowClose = $targetTabTitle.attr('lay-allowclose');
                // 检查目标标签页是否已经加载过内容
                let $targetTabContent = $this.find(`.layui-tab-item[lay-id="${newId}"]`);
                let contentUrl = $targetTabContent.find(".happy-tab-content").attr('data-src');
                if (contentUrl) {
                    url = contentUrl;
                }
                that.updateTabData(newId, {
                    id: newId,
                    title: $targetTabTitle.text(),
                    url: url,
                    allowClose: allowClose
                });
                // 如果未加载过或内容不可见，则根据 lay-url 重新加载内容
                if (url) {
                    // 显示加载进度条
                    pageTab.showLoadingBar();

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'html',
                        // async: false,
                        success: function (res) {
                            //检查返回如果是json数据则使用layer.msg提示
                            if (res.startsWith('{') || res.startsWith('[')) {
                                res = JSON.parse(res);
                                if (res.info) {
                                    layer.msg(res.info);
                                }
                                if (res.url) {
                                    setTimeout(function () {
                                        window.location.href = res.url;
                                    }, 1500)
                                }
                                return;
                            }
                            let contentWidth = $targetTabContent.width();
                            // 更新内容，并为 .happy-tab-content 添加 page-id 和 src 属性
                            $targetTabContent.html(`<div class="happy-tab-content" 
                                 style="display:block; width: ${contentWidth}" 
                                 data-page-id="${newId}" 
                                 data-src="${url}">
                                ${res}
                            </div>`);
                            element.init();
                            // 应用动画并显示内容
                            setTimeout(() => {
                                $targetTabContent.find('.happy-tab-content').addClass('animated slideInFromBottom'); // 使用 animate.css 动画库
                            }, 200);
                            // 关闭加载进度条
                            pageTab.hideLoadingBar();
                        },
                        error: function () {
                            layer.msg('加载失败，请重试！');
                            pageTab.hideLoadingBar();
                        }
                    });
                }
                // 确保在切换标签页后，其他标签页的内容被清空
                pageTab.clearOtherTabsContent(newId);
                // 激活菜单 选中效果
                that.activeTabMenu(data.id)
                //滚动到激活的标签页并居中显示
                that.autoScrollToActiveTab($this, $activeTab);
            });
            element.on('tabBeforeDelete(' + this.config.tabFilter + ')', function (data) {
                let $this = $(`.layui-tab-title li[lay-id="${data.id}"]`);
                let title = $this.text();
                let delStatus = $this.attr('lay-allowclose');
                // 检查是否禁止删除
                if (delStatus === 'false') {
                    layer.msg(title + ' 标签禁止删除');
                    return false; // 确保函数提前返回
                } else {
                    that.delTabData(data.id);
                }
            });
        },
        rightMenu: function (config) {
            return new RightMenu(config);
        },
        // 辅助函数：滚动到激活的标签页并居中显示
        autoScrollToActiveTab: function ($tabContainer, $activeTab) {
            var $tabTitle = $tabContainer.find('.layui-tab-title');

            if ($activeTab.length) {
                // 计算容器实际可用宽度（需减去左右 margin）
                var containerWidth = $tabTitle.width() - 160; // 80px * 2

                // 获取标签左侧到滚动容器边缘的距离
                var tabOffset = $activeTab[0].offsetLeft - $tabTitle[0].scrollLeft;

                // 计算目标滚动位置（考虑 margin 的影响）
                var scrollTo = $activeTab[0].offsetLeft - (containerWidth / 2) + ($activeTab.outerWidth() / 2);

                // 限制滚动范围
                var maxScroll = $tabTitle[0].scrollWidth - containerWidth - 160;
                scrollTo = Math.max(0, Math.min(scrollTo, maxScroll));

                // 执行滚动
                $tabTitle.stop().animate({scrollLeft: scrollTo}, 200);
            }
        },
        moveTabs: function (direction) {
            let $container = $(this.config.tabsContent).find('.layui-tab-title');
            let $activeTab = $container.find('.layui-this');
            let $tabs = $container.children('li');
            let currentIndex = $tabs.index($activeTab);
            let newIndex;

            if (direction === 'prev' && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else if (direction === 'next' && currentIndex < $tabs.length - 1) {
                newIndex = currentIndex + 1;
            }

            if (typeof newIndex !== 'undefined') {
                let $newActiveTab = $tabs.eq(newIndex);
                $newActiveTab.trigger('click'); // 模拟点击以激活新tab
                autoScrollToActiveTab($container, $newActiveTab);
            }
        },
        activeTabMenu: function (tabId) {
            // 为当前id选中菜单
            let $menuContainer = $('#menu-container');

            // 使用 filter 方法查找匹配的元素
            let $menuItem = $menuContainer.find('[lay-id]').filter(function () {
                return $(this).attr('lay-id') === tabId;
            });

            $menuContainer.find('.layui-nav-item').removeClass('layui-this');

            if ($menuItem.length > 0) {
                $menuContainer.find('.side-menu-container').hide();
                let pid = $menuItem.parents('.side-menu-container').show().attr('data-tab-id');
                $menuItem.parent('.layui-nav-item').addClass('layui-this');

                let pItem = $menuItem.parents('.side-menu-container > .layui-nav-item');
                if (!pItem.hasClass('layui-nav-itemed')) {
                    pItem.addClass('layui-nav-itemed');
                }
                if (pid) {
                    let topNav = $('#topNav');
                    topNav.find('.layui-nav-item').removeClass('layui-this');
                    topNav.find('.layui-nav-item[data-tab-id="' + pid + '"]').addClass('layui-this');
                }
            }
        },
        requestFullscreen: function (element) {
            return new Promise((resolve, reject) => {
                if (element.requestFullscreen) {
                    element.requestFullscreen().then(resolve).catch(reject);
                } else if (element.mozRequestFullScreen) { // Firefox
                    element.mozRequestFullScreen().then(resolve).catch(reject);
                } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    element.webkitRequestFullscreen().then(resolve).catch(reject);
                } else if (element.msRequestFullscreen) { // IE/Edge
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
                } else if (document.mozCancelFullScreen) { // Firefox
                    document.mozCancelFullScreen().then(resolve).catch(reject);
                } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                    document.webkitExitFullscreen().then(resolve).catch(reject);
                } else if (document.msExitFullscreen) { // IE/Edge
                    document.msExitFullscreen().then(resolve).catch(reject);
                } else {
                    reject(new Error("浏览器不支持退出全屏"));
                }
            });
        },
    };
    // 导出模块
    exports("pageTab", pageTab);
});
