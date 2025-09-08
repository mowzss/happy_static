layui.define(["tabs", "layer", "jquery", 'dropdown'], function (exports) {
    const MODULE_NAME = "layTabs";
    let pageTabs = {}
        , $ = layui.jquery
        , tabs = layui.tabs
        , dropdown = layui.dropdown
        , layer = layui.layer;

    pageTabs = {
        config: {
            elem: "layTabs",
        },
        rightMenu: function (opt) {
            let that = this;
            // 为标签头添加上下文菜单
            let rightMenu = dropdown.render({
                elem: '#' + that.config.elem + ' .layui-tabs-header>li',
                trigger: 'contextmenu',
                data: [
                    {
                        title: '关闭',
                        icon: 'iconfont icon-cuowuguanbiquxiao',
                        action: 'close',
                        mode: 'this',
                    }, {
                        title: '刷新',
                        icon: "iconfont icon-shuaxin",
                        action: 'refresh',
                        mode: 'this',
                    },
                    {
                        type: '-'
                    },
                    {
                        title: '关闭右侧', icon: "iconfont icon-zuihouye",
                        action: 'close',
                        mode: 'right'
                    }, {
                        title: '关闭其它', icon: "iconfont icon-hengxiangshouqi",
                        action: 'close',
                        mode: 'other'
                    }, {
                        type: '-'
                    }, {
                        title: '关闭所有', icon: "iconfont icon-guanbiquanbu",
                        action: 'close',
                        mode: 'all'
                    }],
                click: function (data, othis, event) {
                    let index = this.elem.index(); // 获取活动标签索引
                    if (data.action === 'close') { // 关闭标签操作
                        if (data.mode === 'this') {
                            tabs.close(that.config.elem, index); // 关闭当前标签
                        } else {
                            tabs.closeMult(that.config.elem, data.mode, index); // 批量关闭标签
                        }
                    } else if (data.action === 'refresh') {
                        if (data.mode === 'this') {
                            tabs.change(that.config.elem, index);
                        }
                    }
                }, templet: function (d) {
                    return '<i class="' + d.icon + '" style="font-size: 14px"></> ' + d.title;
                }
            });
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
        on: function () {
            let that = this;
            //tabs切换前
            tabs.on('beforeChange(' + that.config.elem + ')', function (data) {
                $('#' + that.config.elem).find('.layui-tabs-body > .layui-tabs-item').empty();
            })
            // tabs切换后
            tabs.on('afterChange(' + that.config.elem + ')', function (data) {
                let $thisHeaderItem = $(data.thisHeaderItem);
                let id = $thisHeaderItem.attr('lay-id');
                let url = $thisHeaderItem.attr('lay-url');
                if (url) {
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
                            $(data.thisBodyItem).html(`<div class="happy-tab-content" style="display: block"
                                        data-page-id="${id}"
                                        data-src="${url}">
                                       ${res}
                                   </div>`);
                            // 应用动画并显示内容
                            setTimeout(() => {
                                $(data.thisBodyItem).find('.happy-tab-content').addClass('animated slideInFromBottom'); // 使用 animate.css 动画库
                            }, 200);
                        },
                        error: function () {
                            layer.msg('加载失败，请重试！');
                        }
                    });
                }
                sessionStorage.setItem('tabsActiveId', id);
                that.activeTabMenu(id);
            });
            // tabs 关闭前的事件
            tabs.on('beforeClose(' + that.config.elem + ')', function (data) {
                let index = data.index;
                let id = $(data.container.header.items).eq(index).attr('lay-id');
                that.delSessionTabs(id)
            });
        },
        add: function (opt) {
            let that = this,
                id = String(opt.id),
                config = $.extend({
                    id: String(opt.id),
                    done: function (data) {
                        that.rightMenu();
                        data.headerItem.attr('lay-url', opt.url);
                    }
                }, opt), PageUrl = config.url;

            that.showLoadingBar();
            if (!that.tabIsExist(id)) { // 检查是否存在 tab
                if (PageUrl) {
                    $.ajax({
                        url: PageUrl,
                        type: 'GET',
                        dataType: 'html',
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
                            config = $.extend(config, {
                                content: `<div class="happy-tab-content" style="display: block"
                                    data-page-id="${id}"
                                    data-src="${PageUrl}">
                                   ${res}
                               </div>`,
                                // content: PageUrl
                            })
                            tabs.add(that.config.elem, config)
                        },
                        error: function () {
                            layer.msg('加载失败，请重试！');
                        }
                    })
                }
                // tabs.add(that.config.elem, config);
            } else {
                tabs.change(that.config.elem, id)
            }

            that.updataSessionTabs(id, config);
            that.hideLoadingBar();
        },
        // 检查标签页是否存在
        tabIsExist: function (id) {
            let isExist = false;
            $("#" + this.config.elem).find('.layui-tabs-header li').each(function () {
                if ($(this).attr("lay-id") === id) {
                    isExist = true;
                    return false;
                }
            });
            return isExist;
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
        updataSessionTabs: function (tabId, newOpt) {
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
        delSessionTabs: function (tabId) {
            let tabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
            // 找到需要删除的Tab，并移除它
            let index = tabs.findIndex(tab => tab.id === tabId);

            if (index !== -1) {
                // 如果找到Tab，则从数组中移除
                tabs.splice(index, 1);
                // 更新 sessionStorage
                sessionStorage.setItem('tabsList', JSON.stringify(tabs));
            }
        },
        delSessionTabsAll: function () {
            sessionStorage.removeItem('tabsList');
        },
        /**
         * 进入全屏
         * @param element
         * @returns {Promise<unknown>}
         */
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
        /**
         * 退出全屏
         * @returns {Promise<unknown>}
         */
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
    }
    exports(MODULE_NAME, pageTabs)
})
