layui.define(["element", 'util', "layer"], function (exports) {
    let element = layui.element,
        $ = layui.jquery,
        util = layui.util,
        layer = layui.layer;

    // 定义 rightMenu 类
    var RightMenu = function (config) {
        // 默认配置
        const defaultConfig = {
            filter: pageTab.config.tabFilter,  // 必须指定
            pintabIDs: ['home'], // 不允许关闭的标签页 ID 数组
            navArr: [      // 默认菜单项
                {eventName: "closeThis", title: "关闭", icon: "iconfont icon-cuowuguanbiquxiao"},
                {eventName: "refreshThis", title: "刷新标签", icon: "iconfont icon-shuaxin"},
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

        // 初始化属性
        this.pintabIDs = this.config.pintabIDs;
        this.menuElement = null;
        this.currentActiveTabID = null;

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
        this.pintabIDs = config.pintabIDs || [];
        this.navArr = config.navArr || defaultConfig.navArr;

        if (!this.menuElement) {
            this.menuElement = $("<ul class='right-menu'></ul>").appendTo("body");
        }

        this.renderMenuItems();
        this.bindEvents();
    };

    // 渲染菜单项
    RightMenu.prototype.renderMenuItems = function () {
        var li = this.navArr.map(conf => {
            if (conf.eventName === "line") {
                return "<hr/>";  // 渲染分割线
            } else {
                return `<li data-type="${conf.eventName}"><i class="${conf.icon || ''}"></i>${conf.title}</li>`;
            }
        }).join("");

        this.menuElement.html(li);
    };

    // 绑定事件
    RightMenu.prototype.bindEvents = function () {
        var self = this;

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

        // 菜单项点击事件
        this.menuElement.on("click", "li[data-type]", (e) => {
            e.stopPropagation();
            var event = $(e.currentTarget).attr("data-type");
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
        var menu = this.menuElement;
        var offset = $(document).width() - e.clientX < menu.width() ? e.clientX - menu.width() : e.clientX;
        var topOffset = $(document).height() - e.clientY < menu.height() ? e.clientY - menu.height() : e.clientY;

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

        var tabs = $(".layui-tab[lay-filter='" + this.filter + "'] li");
        let foundCurrent = false;

        switch (event) {
            case "refreshThis":
                // 刷新当前标签页
                var currentTab = $(`.layui-tab-item[lay-id="${this.currentActiveTabID}"]`);
                if (currentTab.length) {
                    currentTab.load();  // 假设有一个 load 方法可以刷新内容
                    // 或者使用其他方式刷新页面，例如重新加载 iframe 内容
                    // 或者触发某个自定义的刷新事件
                }
                break;

            case "closeThis":
                if (this.isAllowClose(this.currentActiveTabID)) {
                    element.tabDelete(this.filter, this.currentActiveTabID);
                    var nextTab = tabs.not(`[lay-id="${this.currentActiveTabID}"]`).first();
                    if (nextTab.length) {
                        element.tabChange(this.filter, nextTab.attr("lay-id"));
                    }
                } else {
                    layer.msg("此页不允许关闭");
                }
                break;

            case "closeAll":
                $.each(tabs, (index, tab) => {
                    var id = $(tab).attr("lay-id");
                    if (this.isAllowClose(id)) {
                        element.tabDelete(this.filter, id);
                    }
                });
                break;

            case "closeOther":
                $.each(tabs, (index, tab) => {
                    var id = $(tab).attr("lay-id");
                    if (this.isAllowClose(id) && id !== this.currentActiveTabID) {
                        element.tabDelete(this.filter, id);
                    }
                });
                break;

            case "closeLeft":
                $.each(tabs, (index, tab) => {
                    var id = $(tab).attr("lay-id");
                    if (id === this.currentActiveTabID) {
                        foundCurrent = true;
                        return;
                    }

                    if (foundCurrent) {
                        return;
                    }

                    if (this.isAllowClose(id)) {
                        element.tabDelete(this.filter, id);
                    }
                });
                break;

            case "closeRight":
                foundCurrent = false;
                $.each(tabs, (index, tab) => {
                    var id = $(tab).attr("lay-id");
                    if (id === this.currentActiveTabID) {
                        foundCurrent = true;
                        return;
                    }

                    if (foundCurrent && this.isAllowClose(id)) {
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

    // 判断是否允许关闭
    RightMenu.prototype.isAllowClose = function (id) {
        return !(this.pintabIDs.includes(id) || id === undefined);
    };

    // 自动滚动到激活的tab
    function autoScrollToActiveTab($container, $activeTab) {
        var containerScrollLeft = $container.scrollLeft();
        var activeTabOffsetLeft = $activeTab.offset().left - $container.offset().left + $container.scrollLeft();
        var activeTabWidth = $activeTab.outerWidth();

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

            let $activeTabTitle = $(this.config.tabsContent).find(`.layui-tab-title li[lay-id="${activeId}"]`);
            let url = $activeTabTitle.attr('lay-url');

            if (!url) {
                layer.msg('该标签页没有关联的URL，无法刷新！');
                return;
            }
            let $targetTabContent = $(this.config.tabsContent).find(`.layui-tab-item[lay-id="${activeId}"] .happy-tab-content`);
            let load = layer.load();
            $targetTabContent.empty();
            // 显示加载进度条
            this.showLoadingBar();

            // 发起 AJAX 请求，重新加载内容
            $.ajax({
                url: url,
                type: 'GET',
                success: function (res) {
                    // 更新内容
                    $targetTabContent.html(res);
                    layer.close(load)
                    // 应用动画并显示内容
                    setTimeout(() => {
                        $targetTabContent
                            .show()
                            .addClass('animated slideInFromBottom'); // 使用 animate.css 动画库
                    }, 100);

                    // 关闭加载进度条
                    that.hideLoadingBar();
                },
                error: function () {
                    layer.msg('刷新失败，请重试！');
                    that.hideLoadingBar();
                }
            });
        },

        // 添加新标签页
        addTab: function (opt) {
            let that = this,
                id = opt.id,
                url = opt.url,
                title = opt.title;

            if (!that.tabIsExist(id)) { // 检查是否存在 tab
                // 新增一个Tab项
                element.tabAdd(that.config.tabFilter, {
                    id: id,
                    title: title,
                    url: url,
                    change: true,
                    allowClose: true,
                });
            } else {
                // 如果标签页已经存在，则直接切换到该标签页
                element.tabChange(that.config.tabFilter, id);
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
                    $(this).empty(); // 清空内容
                }
            });
        },

        // 监听标签页切换事件
        changeTab: function () {
            element.on('tab(' + this.config.tabFilter + ')', function (data) {
                var $this = $(data.elem);
                var $activeTab = $this.find('.layui-this');
                autoScrollToActiveTab($this, $activeTab);

                let newId = data.id;

                // 获取目标标签页的URL
                let $targetTabTitle = $(`.layui-tab-title li[lay-id="${newId}"]`);
                let url = $targetTabTitle.attr('lay-url');

                // 检查目标标签页是否已经加载过内容
                let $targetTabContent = $(`.layui-tab-item[lay-id="${newId}"]`);

                if ($targetTabContent.find('.happy-tab-content').length === 0 || !$targetTabContent.find('.happy-tab-content').is(':visible')) {
                    // 如果未加载过或内容不可见，则根据 lay-url 重新加载内容
                    if (url) {
                        // 显示加载进度条
                        pageTab.showLoadingBar();

                        $.ajax({
                            url: url,
                            type: 'GET',
                            success: function (res) {
                                // 更新内容，并为 .happy-tab-content 添加 page-id 和 src 属性
                                $targetTabContent.html(`
                            <div class="happy-tab-content" 
                                 style="display:none;" 
                                 data-page-id="${newId}" 
                                 data-src="${url}">
                                ${res}
                            </div>
                        `);
                                // 应用动画并显示内容
                                setTimeout(() => {
                                    $targetTabContent.find('.happy-tab-content')
                                        .show()
                                        .addClass('animated slideInFromBottom'); // 使用 animate.css 动画库
                                }, 100);

                                // 关闭加载进度条
                                pageTab.hideLoadingBar();
                            },
                            error: function () {
                                layer.msg('加载失败，请重试！');
                                pageTab.hideLoadingBar();
                            }
                        });
                    }
                } else {
                    // 如果内容已经加载过且可见，则直接应用动画
                    setTimeout(() => {
                        $targetTabContent.find('.happy-tab-content')
                            .show()
                            .addClass('animated slideInFromBottom'); // 使用 animate.css 动画库
                    }, 100);
                }

                // 确保在切换标签页后，其他标签页的内容被清空
                pageTab.clearOtherTabsContent(newId);
            });
        },
        rightMenu: function (config) {
            return new RightMenu(config);
        },
        // 关闭标签页
        close: function (index) {
            element.tabDelete(this.config.tabFilter, index);
        },

        // 关闭其他标签页
        closeOther: function (index) {
            $(this.config.tabsContent).find('.layui-tab-title li').each(function (i) {
                if (i !== index) {
                    element.tabDelete(pageTab.config.tabFilter, i);
                }
            });
        },
        moveTabs: function (direction) {
            var $container = $(this.config.tabsContent).find('.layui-tab-title');
            var $activeTab = $container.find('.layui-this');
            var $tabs = $container.children('li');
            var currentIndex = $tabs.index($activeTab);
            var newIndex;

            if (direction === 'prev' && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else if (direction === 'next' && currentIndex < $tabs.length - 1) {
                newIndex = currentIndex + 1;
            }

            if (typeof newIndex !== 'undefined') {
                var $newActiveTab = $tabs.eq(newIndex);
                $newActiveTab.trigger('click'); // 模拟点击以激活新tab
                autoScrollToActiveTab($container, $newActiveTab);
            }
        }
    };
    // 导出模块
    exports("pageTab", pageTab);
});
