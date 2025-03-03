layui.define(['jquery', 'element', 'pageTab'], function (exports) {
    let $ = layui.jquery,
        pageTab = layui.pageTab,
        element = layui.element;

    let menu = {
        render: function (url) {
            this.loadAllMenuData(url);
        },
        // 加载所有菜单数据
        loadAllMenuData: function (url) {
            // 生成时间戳或随机数作为动态参数
            let timestamp = Date.now(); // 使用时间戳
            // 将时间戳作为查询参数附加到 URL 上
            let fullUrl = url + (url.includes('?') ? '&' : '?') + 'ts=' + timestamp;

            // 发送 AJAX 请求获取所有菜单数据
            $.ajax({
                url: fullUrl,
                method: 'GET',
                success: function (response) {
                    if (response && response.length > 0) {
                        // 缓存所有菜单数据
                        menu.allMenuData = response;
                        // 分离顶级导航和子导航
                        let separatedData = menu.separateMenuData(response);
                        menu.topNavItems = separatedData.topNavItems;
                        menu.sideNavItems = separatedData.sideNavItems;

                        // 初始化顶部导航和左侧菜单
                        menu.initTopNav();
                        menu.renderAllSideNavs();

                        // 默认加载第一个顶级导航对应的左侧导航
                        let defaultTopNav = $('#topNav .layui-nav-item:first-child a');
                        defaultTopNav.trigger('click');

                        let tabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
                        let opt = {
                            id: "home",
                            title: "首页",
                            url: getBaseURL() + '/index/index/main',
                            allowClose: false
                        };

                        if (tabs.length === 0) {
                            opt.change = true;
                        }
                        pageTab.addTab(opt);
                        //菜单加载后 激活tab 关联的菜单
                        let activeId = String(sessionStorage.getItem('tabsActiveId'));
                        if (activeId) {
                            pageTab.activeTabMenu(activeId);
                        }
                    } else {
                        console.error('菜单数据为空');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('获取菜单数据失败:', error);
                }
            });
        },

        // 分离顶级导航和子导航
        separateMenuData: function (menuData) {
            let topNavItems = [];
            let sideNavItems = {};

            // 递归函数，用于处理多层嵌套的子菜单
            function processChildren(items, parentId) {
                items.forEach(function (item) {
                    if (item.isParent) {  // 父级菜单
                        if (item.pid === 0) {
                            // 顶级导航项
                            topNavItems.push(item);
                        } else {
                            // 子导航项，按 pid 分组
                            if (!sideNavItems[item.pid]) {
                                sideNavItems[item.pid] = [];
                            }
                            sideNavItems[item.pid].push(item);
                        }

                        // 递归处理子菜单
                        if (item.children && item.children.length > 0) {
                            processChildren(item.children, item.id);
                        }
                    } else {  // 叶子节点菜单
                        // 叶子节点菜单也按 pid 分组
                        if (!sideNavItems[item.pid]) {
                            sideNavItems[item.pid] = [];
                        }
                        sideNavItems[item.pid].push(item);
                    }
                });
            }

            // 开始处理根级别的菜单项
            processChildren(menuData, 0);

            return {
                topNavItems: topNavItems,
                sideNavItems: sideNavItems
            };
        },

        // 初始化顶部导航
        initTopNav: function () {
            // 渲染顶部导航
            let topNavHtml = menu.topNavItems.map(function (item) {
                return `<li class="layui-nav-item" data-tab-id="${item.id}">
                            <a href="javascript:;">
                              ${item.title}
                            </a>
                        </li>`;
            }).join('');
            $('#topNav').html(topNavHtml);

            // 绑定顶部导航点击事件
            $('#topNav .layui-nav-item a').on('click', function () {
                let tabId = $(this).parent().attr('data-tab-id'); // 获取顶级导航项的 ID

                // 切换顶部导航的激活状态
                $(this).parent().addClass('layui-this').siblings().removeClass('layui-this');

                // 切换左侧菜单的显示
                $('.side-menu-container[data-tab-id]').hide(); // 隐藏其他菜单
                $(`.side-menu-container[data-tab-id="${tabId}"]`).show(); // 显示当前菜单
            });
        },

        // 一次性渲染所有左侧菜单
        renderAllSideNavs: function () {
            let menuContainer = $('#menu-container ul');

            // 遍历每个顶级导航项
            menu.topNavItems.forEach(function (item) {
                let sideNavData = menu.sideNavItems[item.id] || [];
                let sideNavHtml = menu.generateMenuHtml(sideNavData);

                // 创建一个容器来保存该顶级导航对应的左侧菜单
                let sideMenuContainer = `
                    <div class="side-menu-container" data-tab-id="${item.id}" style="display:none;">
                        ${sideNavHtml}
                    </div>
                `;
                menuContainer.append(sideMenuContainer);
            });

            // 初始化 Layui 的 element 模块，确保菜单可以正常使用
            layui.element.init();
        },

        // 查找第一个叶子节点菜单项
        findFirstLeafMenuItem: function (menuData) {
            for (let item of menuData) {
                if (item.type === 1) { // 叶子节点菜单
                    return item;
                } else if (item.children && item.children.length > 0) {
                    let result = menu.findFirstLeafMenuItem(item.children);
                    if (result) return result; // 如果找到就立即返回
                }
            }
            return null;
        },

        // 递归生成菜单 HTML 的函数
        generateMenuHtml: function (menuData) {
            let html = '';

            // 遍历每个菜单项
            menuData.forEach(function (item) {
                if (item.type === 0) { // 父级菜单
                    html += '<li class="layui-nav-item layui-nav-itemed">';
                    html += '<a href="javascript:">';
                    html += '<i class="' + item.icon + '"></i><span class="happy-nav-title">' + item.title + '</span>';
                    html += '</a>';

                    if (item.children && item.children.length > 0) {
                        html += '<dl class="layui-nav-child">';
                        html += menu.generateMenuHtml(item.children); // 递归生成子菜单
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
    };

    function getBaseURL() {
        // 获取当前页面完整的URL
        let fullURL = window.location.href;

        // 使用正则表达式匹配需要的部分
        let matches = fullURL.match(/(https?:\/\/[^\/]+\/[^\/?#]+)/);

        if (matches && matches[1]) {
            return matches[1];
        } else {
            console.error("未能正确解析URL");
            return null;
        }
    }

    exports('menu', menu);
});
