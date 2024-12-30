// admin.js
layui.define(['util', 'element', 'layer', 'jquery', 'pageTab', 'menu'], function (exports) {
    "use strict";
    let util = layui.util,
        layer = layui.layer,
        $ = layui.jquery,
        pageTab = layui.pageTab,
        menu = layui.menu,
        element = layui.element;

    let admin = {
        config: {
            tabFilter: 'layout-filter-tab',//tab选择器
            tabsContent: '#happy-content > .layui-body-tabs',
            menuUrl: '',
        },
        // 初始化
        render: function (options) {
            this.config = $.extend({}, this.config, options);
            this.renderTabs();//渲染tab容器
            menu.render(this.config.menuUrl);
            this.events();//全部监听
            this.initTabs();//渲染tab记录
            pageTab.rightMenu({filter: this.config.tabFilter}); // 渲染右键菜单
            this.closeLoading()
        },
        //初始化记录的标签
        initTabs: function () {
            let that = this;
            let tabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
            let activeId = String(sessionStorage.getItem('tabsActiveId'));

            // 重新添加所有保存的Tab
            tabs.forEach((tab) => {
                pageTab.addTab(tab);
            });
            // 设置激活的Tab
            if (activeId && tabs.some(tab => tab.id === activeId)) {
                element.tabChange(that.config.tabFilter, activeId);
            } else if (tabs.length > 0) {
                // 如果没有保存的激活Tab，选择第一个Tab作为默认激活
                element.tabChange(that.config.tabFilter, tabs[0].id);
            }
            element.init();
        },
        // 动态渲染layui-body-tabs
        renderTabs: function () {
            let tabsHtml = `
        <div class="layui-body-tabs layui-tab-rollTool layui-tab" lay-allowclose="true" lay-unauto lay-filter="${admin.config.tabFilter}">
            <ul class="layui-tab-title"></ul>
            <div class="layui-tab-content"></div>
            <div class="layui-tab-subsidiary">
                <span class="layui-tab-subsidiary-refresh" lay-header-event="refreshTab">
                    <em class="layui-icon layui-icon-refresh"></em>
                </span>
                <span class="layui-tab-subsidiary-screen-full" lay-header-event="tabFullScreen">
                    <em class="layui-icon layui-icon-screen-full"></em>
                </span>
                <span class="layui-tab-subsidiary-prev" lay-header-event="moveTabs" data-value="prev"><em class="layui-icon layui-icon-prev"></em></span>
                <span class="layui-tab-subsidiary-next" lay-header-event="moveTabs" data-value="next"><em class="layui-icon layui-icon-next"></em></span>
                 
            </div>
        </div>
    `;
            // 插入到#happy-content中
            $("#happy-content").html(tabsHtml);
            // 初始化element模块，确保新添加的元素可以正常工作
            element.render('tab', admin.config.tabFilter);
        },
        //关闭遮罩层
        closeLoading: function () {
            $('.loading-mask').addClass('hidden');
        },
        // 事件监听
        events: function () {
            pageTab.onTab(); // 监听标签页切换事件
            util.event('lay-header-event', {
                //清理缓存
                cleanCache: function (othis) {
                    let url = othis.data('url')
                    layer.confirm('确认清理缓存？', function () {
                        sessionStorage.clear();
                        if (url) {
                            $.ajax({
                                url: url,
                                type: 'GET',
                                success: function (res) {
                                    layer.msg(res.msg);
                                }
                            })
                        } else {
                            layer.msg('本地缓存已清空')
                        }
                    })
                },
                // 网页全屏
                fullScreen: function (othis) {
                    // 使用 othis.find() 获取图标元素
                    let iconElement = othis.find('em');
                    // 检查当前是否处于全屏模式
                    if (!document.fullscreenElement) {
                        // 请求全屏
                        try {
                            pageTab.requestFullscreen(document.documentElement).then(() => {
                                // 更新图标为退出全屏图标
                                iconElement.removeClass('layui-icon-screen-full').addClass('layui-icon-screen-restore');
                                othis.attr('title', "退出全屏");
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
                                // 更新图标为进入全屏图标
                                iconElement.removeClass('layui-icon-screen-restore').addClass('layui-icon-screen-full');
                                othis.attr('title', "全屏");
                            }).catch(err => {
                                layer.msg("无法退出全屏模式,请手动操作");
                            });
                        } catch (err) {
                            layer.msg("无法退出全屏模式,请手动操作");
                        }
                    }
                },
                //tab全屏
                tabFullScreen: function (othis) {
                    $('.right-menu').find('[data-event="toggleFullScreen"]').trigger('click');
                },
                //菜单切换
                menuSwitch: function (othis) { // 左侧菜单事件
                    var elem = $(".happy-admin-layout").find('.layui-layout-admin');
                    var flag = elem.hasClass("mini-nav");
                    if (flag) {
                        $(".layui-nav-item i").css("left", 25);
                        elem.removeClass("mini-nav");
                        localStorage.setItem('mimiMenu', 'false');
                    } else {
                        $(".layui-nav-item i").css("left", 20);
                        elem.addClass("mini-nav");
                        localStorage.setItem('mimiMenu', 'true');
                    }
                },
                //刷新tab
                refreshTab: function () {
                    pageTab.refreshTab();
                },
                //移动标签
                moveTabs: function (othis) {
                    let value = othis.data('value');
                    pageTab.moveTabs(value);
                },

            });
            //lay-on 监听事件
            util.event('lay-on', {
                open: function () {

                }
            });
            //导航事件
            element.on('nav(lay-nav)', function (elem) {
                let $this = $(elem);
                if ($this.parents('.mini-nav').length === 1) {
                    $('[lay-header-event="menuSwitch"]').trigger('click');
                }
                if ($this.find('.layui-nav-more').length === 0) {
                    var obj = $(this);
                    var title = obj.find(".happy-nav-title").html();
                    var id = obj.attr("lay-id");
                    var url = obj.attr("lay-url");
                    // 添加新标签页
                    pageTab.addTab({
                        id: id,
                        title: title,
                        url: url,
                        change: true,
                    });
                }
            });
            // 原生事件监听
            this.onBody();
        },
        // 原生事件监听
        onBody: function () {
            let $body = $('body');
            $body.on('click', '[data-open]', function (e) {
                let url = $(e.target).data('open'),
                    id = url.split('?')[0],
                    title = $(e.target).text();
                // 添加新标签页
                pageTab.addTab({
                    id: id,
                    title: title,
                    url: url,
                    allowClose: true,
                    change: true,
                });
            })
        },

    }


    exports('admin', admin);
});
