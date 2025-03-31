// admin.js
layui.define(['util', 'element', 'layer', 'jquery', 'layTabs', 'layMenu'], function (exports) {
    "use strict";
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
        // 初始化
        render: function (options) {
            this.config = $.extend({}, this.config, options);
            this.renderTabs();//渲染tab容器
            layMenu.render(this.config.menuUrl);
            this.events();//全部监听
            this.initTabs();//渲染tab记录
            this.closeLoading()

        },
        //初始化记录的标签
        initTabs: function () {
            let tabsList = JSON.parse(sessionStorage.getItem('tabsList')) || [];
            let activeId = String(sessionStorage.getItem('tabsActiveId'));

            // 重新添加所有保存的Tab
            tabsList.forEach((tab) => {
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
        <div class="layui-body-tabs layui-tab-rollTool layui-tabs layui-hide-v" id="${layTabs.config.elem}" lay-options="{headerMode:'scroll',closable:true}">
            <ul class="layui-tabs-header"></ul>
            <div class="layui-tabs-body"></div>        
        </div>
    `;
            // 插入到#happy-content中
            $("#happy-content").html(tabsHtml);
            tabs.render();
        },
        //关闭遮罩层
        closeLoading: function () {
            $('.loading-mask').addClass('hidden');
        },
        showLoading: function () {
            $('.loading-mask').removeClass('hidden');
        },
        // 事件监听
        events: function () {
            layTabs.on(); // 监听标签页切换事件
            util.event('lay-header-event', {
                home: function () {
                    tabs.change(layTabs.config.elem, 'home');
                },
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
                            layTabs.requestFullscreen(document.documentElement).then(() => {
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
                            layTabs.exitFullscreen().then(() => {
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
                logout: function (othis) {
                    let url = othis.data('href');
                    if (url) {
                        layer.confirm('确认退出系统？', function () {
                            $.ajax({
                                url: url,
                                type: 'GET',
                                success: function (res) {
                                    layer.msg(res.msg);
                                    if (res.code === 0) {
                                        setTimeout(function () {
                                            sessionStorage.clear();
                                            localStorage.clear();
                                            location.href = res.url;
                                        }, 1000);
                                    }
                                }
                            })
                        })
                    }
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
                    layTabs.add({
                        id: id,
                        title: title,
                        url: url,
                        closable: true,
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
                layTabs.add({
                    id: id,
                    title: title,
                    url: url,
                    closable: true,
                    change: true,
                });
            });
            $body.on('click', '[data-win-open]', function (e) {
                let url = $(e.target).data('winOpen');
                window.open(url, '_blank');
            })
            $body.on('click', '[data-ajax]', function (e) {
                let index = layer.load(1);
                e.preventDefault();
                let url = this.dataset.ajax;
                let type = this.dataset.type || 'GET';
                let value = this.dataset.value || {};
                $.ajax({
                    url: url,
                    type: type,
                    data: value,
                    success: function (res) {
                        layer.close(index); // 关闭 loading
                        if (res.code === 0) {
                            layer.msg(res.msg);
                        } else {
                            layer.msg(res.msg);
                        }
                    },
                    error: function () {
                        layer.close(index); // 关闭 loading
                        layer.msg('网络错误')
                    }

                })
            })
        },

    }


    exports(MODULE_NAME, admin);
});
