// admin.js
layui.define(['util', 'element', 'layer', 'jquery', 'pageTab'], function (exports) {
    "use strict";
    let util = layui.util,
        layer = layui.layer,
        $ = layui.jquery,
        pageTab = layui.pageTab,
        element = layui.element;

    let admin = {
        config: {
            tabFilter: 'layout-filter-tab',//tab选择器
            tabsContent: '#happy-content > .layui-body-tabs',
            recordTabs: true,//是否记录tab信息
            tabsList: []//tab列表
        },

        // 初始化
        render: function () {
            this.renderTabs();//渲染tabs
            this.events();
            this.onMenu();
            pageTab.rightMenu({filter: this.config.tabFilter}); // 渲染右键菜单
            pageTab.changeTab(); // 监听标签页切换事件
            this.closeLoading()
        },
        // 动态渲染layui-body-tabs
        renderTabs: function () {
            let tabsHtml = `
        <div class="layui-body-tabs layui-tab-rollTool layui-tab" lay-unauto lay-filter="${admin.config.tabFilter}" lay-allowclose="true">
            <ul class="layui-tab-title"></ul>
            <div class="layui-tab-content"></div>
            <div class="layui-tab-subsidiary">
                <span class="layui-tab-subsidiary-refresh">
                    <em class="layui-icon layui-icon-refresh" lay-header-event="refreshTab"></em>
                </span>
                <span class="layui-tab-subsidiary-prev" lay-header-event="moveTabs" data-value="prev"><em class="layui-icon layui-icon-prev"></em></span>
                <span class="layui-tab-subsidiary-next" lay-header-event="moveTabs" data-value="next"><em class="layui-icon layui-icon-next"></em></span>
            </div>
        </div>
    `;
            // 插入到#happy-content中
            $(admin.config.tabsContent).html(tabsHtml);
            // 初始化element模块，确保新添加的元素可以正常工作
            element.init();
        },
        //关闭遮罩层
        closeLoading: function () {
            $('.loading-mask').addClass('hidden');
        },
        // 事件监听
        events: function () {
            util.event('lay-header-event', {
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
                refreshTab: function () {
                    pageTab.refreshTab();
                },
                moveTabs: function (othis) {
                    let value = othis.data('value');
                    pageTab.moveTabs(value);
                }
            });
        },

        // 菜单点击事件
        onMenu: function () {
            let that = this;
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
                        url: url
                    });
                }
            });
        },
        // 构建菜单
        buildMenu: function (url) {
            // 生成时间戳或随机数作为动态参数
            var timestamp = Date.now(); // 使用时间戳
            // 将时间戳作为查询参数附加到 URL 上
            var fullUrl = url + (url.includes('?') ? '&' : '?') + 'ts=' + timestamp;

            // 发送 AJAX 请求获取菜单数据
            $.ajax({
                url: fullUrl,
                method: 'GET',
                success: function (response) {
                    // 确保返回的数据是 JSON 格式
                    if (response && response.length > 0) {
                        // 调用函数生成菜单 HTML
                        var menuHtml = generateMenuHtml(response);
                        // 将生成的 HTML 插入到 #menu-container 中
                        $('#menu-container ul').html(menuHtml);

                        // 初始化 Layui 的 element 模块，确保菜单可以正常使用
                        layui.element.init();

                        // 找到第一个叶子节点菜单项
                        var firstMenuItem = findFirstLeafMenuItem(response);
                        if (firstMenuItem) {
                            // 添加默认打开的标签页
                            pageTab.addTab({
                                id: firstMenuItem.id,
                                title: firstMenuItem.title,
                                url: firstMenuItem.href,
                                active: true, // 设置为激活状态
                                allowClose: false // 首页不允许关闭
                            });
                        }
                    } else {
                        console.error('菜单数据为空');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('获取菜单数据失败:', error);
                }
            });
        }
    }

// 查找第一个叶子节点菜单项
    function findFirstLeafMenuItem(menuData) {
        for (let item of menuData) {
            if (item.type === 1) { // 叶子节点菜单
                return item;
            } else if (item.children && item.children.length > 0) {
                let result = findFirstLeafMenuItem(item.children);
                if (result) return result; // 如果找到就立即返回
            }
        }
        return null;
    }

    // 递归生成菜单 HTML 的函数
    function generateMenuHtml(menuData) {
        var html = '';

        // 遍历每个菜单项
        menuData.forEach(function (item) {
            if (item.type === 0) { // 父级菜单
                html += '<li class="layui-nav-item">';
                html += '<a>';
                html += '<i class="' + item.icon + '"></i><span class="happy-nav-title">' + item.title + '</span>';
                html += '</a>';

                if (item.children && item.children.length > 0) {
                    html += '<dl class="layui-nav-child">';
                    html += generateMenuHtml(item.children); // 递归生成子菜单
                    html += '</dl>';
                }

                html += '</li>';
            } else if (item.type === 1) { // 叶子节点菜单
                html += '<li class="layui-nav-item">';
                html += '<a lay-url="' + item.href + '" lay-id="' + item.id + '">';
                html += '<span class="happy-nav-title">' + item.title + '</span>';
                html += '</a>';
                html += '</li>';
            }
        });

        return html;
    }

    exports('admin', admin);
})
;
