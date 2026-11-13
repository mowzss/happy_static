layui.define(['jquery', 'element', 'layTabs', 'encrypt'], function (exports) {
    const MODULE_NAME = 'layMenu';
    let $ = layui.jquery,
        layTabs = layui.layTabs,
        encrypt = layui.encrypt,
        element = layui.element;

    let layMenu = {
        render: function (url, homeUrl) {
            this.homeUrl = homeUrl || '';
            this.loadAllMenuData(url);
            this.on();
        },
        // 应用菜单折叠状态（唯一入口，图标位置由 .mini-nav 样式控制）
        applyMenuState: function () {
            const isMini = sessionStorage.getItem('mimiMenu') === 'true';
            $(".happy-admin-layout").find('.layui-layout-admin').toggleClass('mini-nav', isMini);
        },
        on: function () {
            //导航事件
            element.on('nav(lay-nav)', function (elem) {
                let $this = $(elem);
                let url = $this.attr('lay-url');
                // 父级菜单没有链接，不打开页签
                if (!url) {
                    return;
                }
                let title = $this.find(".happy-nav-title").text();
                let id = $this.attr("lay-id");

                // 收缩导航下，点击浮层内的子项后移除悬停类（让浮层收起）
                if ($(".happy-admin-layout").find('.layui-layout-admin').hasClass('mini-nav')) {
                    $this.closest('.admin-nav-hover').removeClass('admin-nav-hover');
                }

                // 添加新标签页
                layTabs.add({
                    id: id,
                    title: title,
                    url: url,
                    closable: true,
                });
            });

            // 收缩导航：悬停根级菜单项弹出子菜单浮层
            this.initMiniNavHover();
        },
        // 收缩导航悬停弹出：绑定一次事件，mini-nav 状态下生效
        initMiniNavHover: function () {
            let LAYOUT = '.happy-admin-layout .layui-layout-admin';
            let ROOT_ITEM = '#menu-container .side-menu-container > li';
            let CHILDREN = '#menu-container .side-menu-container .layui-nav-child';

            // 清理所有根级项的内联 style（收缩/展开切换时 DOM 上会残留 top 等）
            function cleanupInlineStyles() {
                $(CHILDREN).each(function () {
                    let $c = $(this);
                    if ($c.attr('style')) {
                        // 只移除我们自己写的 top / left / position，其他不动
                        let style = $c.attr('style')
                            .replace(/\btop\s*:[^;]+;?/gi, '')
                            .replace(/\bleft\s*:[^;]+;?/gi, '')
                            .replace(/\bposition\s*:[^;]+;?/gi, '');
                        style = style.trim().replace(/;+$/, '');
                        if (style) {
                            $c.attr('style', style);
                        } else {
                            $c.removeAttr('style');
                        }
                    }
                });
            }

            $(document).on('mouseenter', ROOT_ITEM, function () {
                let $layout = $(LAYOUT);
                if (!$layout.hasClass('mini-nav')) return;

                $(ROOT_ITEM).removeClass('admin-nav-hover');
                cleanupInlineStyles();

                let $li = $(this);
                let $child = $li.children('.layui-nav-child').first();
                if (!$child.length) return;

                $li.addClass('admin-nav-hover');

                // 视口坐标：offset() 文档坐标 - scrollTop() 滚动量 → top
                let top = Math.max(0, $li.offset().top - $(window).scrollTop() - 2);
                let sideH = $('.layui-side').outerHeight() || 600;
                let childH = $child.outerHeight() || 200;
                // 超出底部就贴底，避免被裁掉
                let maxTop = Math.max(0, $(window).innerHeight() - childH - 8);
                $child.css('top', Math.min(top, maxTop) + 'px');
            });

            $(document).on('mouseleave', ROOT_ITEM, function () {
                let $layout = $(LAYOUT);
                if (!$layout.hasClass('mini-nav')) return;

                let $li = $(this);
                setTimeout(function () {
                    if ($(':hover').closest('.admin-nav-hover').length === 0) {
                        $li.removeClass('admin-nav-hover');
                        // 收起时同步清掉 top 内联
                        let $child = $li.children('.layui-nav-child').first();
                        if ($child.length) $child.css('top', '');
                    }
                }, 120);
            });

            // 浮层内子项点击后关闭浮层
            $(document).on('click', '#menu-container .admin-nav-hover .layui-nav-child a', function () {
                setTimeout(function () {
                    $('#menu-container .admin-nav-hover').removeClass('admin-nav-hover');
                    cleanupInlineStyles();
                }, 0);
            });

            // 用 MutationObserver 监测 mini-nav class 切换，可靠清理残留内联 style
            let _observer = new MutationObserver(function () {
                let $layout = $(LAYOUT);
                if (!$layout.hasClass('mini-nav')) {
                    cleanupInlineStyles();
                }
            });
            $(function () {
                let target = document.querySelector(LAYOUT);
                if (target) {
                    _observer.observe(target, {attributes: true, attributeFilter: ['class']});
                }
            });

            // 菜单数据加载后（DOM 重建），也清理一次
            // （layMenu.renderAllSideNavs → element.init 后 DOM 可能换了节点）
            let _origRender = layMenu.renderAllSideNavs;
            layMenu.renderAllSideNavs = function () {
                _origRender.apply(this, arguments);
                // 菜单 DOM 构建完，清理下可能的残留
                setTimeout(cleanupInlineStyles, 50);
            };
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
                    if (response && response.data.length > 0) {
                        // 缓存所有菜单数据
                        layMenu.allMenuData = response.data;
                        // 分离顶级导航和子导航
                        let separatedData = layMenu.separateMenuData(response.data);
                        layMenu.topNavItems = separatedData.topNavItems;
                        layMenu.sideNavItems = separatedData.sideNavItems;

                        // 初始化顶部导航和左侧菜单
                        layMenu.initTopNav();
                        layMenu.renderAllSideNavs();
                        // 菜单 DOM 渲染完成后再应用折叠状态
                        layMenu.applyMenuState();

                        // 默认加载第一个顶级导航对应的左侧导航
                        let defaultTopNav = $('#topNav .layui-nav-item:first-child a');
                        defaultTopNav.trigger('click');

                        let sessionTabs = JSON.parse(sessionStorage.getItem('tabsList')) || [];
                        if (sessionTabs.length === 0) {
                            let opt = {
                                id: "home",
                                // 优先使用后端 aurl() 生成的地址，避免丢失后台入口
                                url: layMenu.homeUrl || (getBaseURL() + '/index/index/main'),
                                title: "首页",
                                closable: false,
                            };
                            layTabs.add(opt);
                        }
                        //菜单加载后 激活tab 关联的菜单
                        let activeId = String(sessionStorage.getItem('tabsActiveId'));
                        if (activeId) {
                            layTabs.activeTabMenu(activeId);
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
            let topNavHtml = layMenu.topNavItems.map(function (item) {
                return `<li class="layui-nav-item" data-tab-id="${escapeHtml(item.id)}">
                            <a href="javascript:;">
                              ${escapeHtml(item.title)}
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
            layMenu.topNavItems.forEach(function (item) {
                let sideNavData = layMenu.sideNavItems[item.id] || [];
                let sideNavHtml = layMenu.generateMenuHtml(sideNavData);

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
                    let result = layMenu.findFirstLeafMenuItem(item.children);
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
                    html += '<i class="' + escapeHtml(item.icon) + '"></i><span class="happy-nav-title">' + escapeHtml(item.title) + '</span>';
                    html += '</a>';

                    if (item.children && item.children.length > 0) {
                        html += '<dl class="layui-nav-child">';
                        html += layMenu.generateMenuHtml(item.children); // 递归生成子菜单
                        html += '</dl>';
                    }

                    html += '</li>';
                } else if (item.type === 1) { // 叶子节点菜单
                    html += '<li class="layui-nav-item">';
                    html += '<a href="javascript:" lay-url="' + escapeHtml(item.href) + '" lay-id="' + encrypt.md5(escapeHtml(item.href)) + '">';
                    html += '<span class="happy-nav-title">' + escapeHtml(item.title) + '</span>';
                    html += '</a>';
                    html += '</li>';
                }
            });

            return html;
        }
    };

    // 转义菜单数据，避免后台可配置的标题/图标/链接注入 HTML
    function escapeHtml(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getBaseURL() {
        // 兜底：从当前后台页面地址中取入口（如 http://host/admin.php）
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

    exports(MODULE_NAME, layMenu);
});
