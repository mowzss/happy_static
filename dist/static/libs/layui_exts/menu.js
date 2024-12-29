layui.define(["jquery","element","pageTab"],function(a){let t=layui.jquery,i=layui.pageTab,n={render:function(a){this.loadAllMenuData(a)},loadAllMenuData:function(a){var e=Date.now(),a=a+(a.includes("?")?"&":"?")+"ts="+e;t.ajax({url:a,method:"GET",success:function(a){var e;a&&0<a.length?(n.allMenuData=a,e=n.separateMenuData(a),n.topNavItems=e.topNavItems,n.sideNavItems=e.sideNavItems,n.initTopNav(),t("#topNav .layui-nav-item:first-child a").trigger("click"),e=n.findFirstLeafMenuItem(a),i.addTab({id:String(e.id),title:e.title,url:e.href,allowClose:!1})):console.error("菜单数据为空")},error:function(a,e,t){console.error("获取菜单数据失败:",t)}})},separateMenuData:function(a){var t=[],i={};return function e(a){a.forEach(function(a){0===a.type?((0===a.pid?t:(i[a.pid]||(i[a.pid]=[]),i[a.pid])).push(a),a.children&&0<a.children.length&&e(a.children)):1===a.type&&(i[a.pid]||(i[a.pid]=[]),i[a.pid].push(a))})}(a),{topNavItems:t,sideNavItems:i}},initTopNav:function(){var a=n.topNavItems.map(function(a){return`<li class="layui-nav-item">
                            <a href="javascript:;" data-tab-id="${a.id}">
                              ${a.title}
                            </a>
                        </li>`}).join("");t("#topNav").html(a),t("#topNav .layui-nav-item a").on("click",function(){t(this).text();var a=t(this).attr("data-tab-id");t(this).parent().addClass("layui-this").siblings().removeClass("layui-this"),n.loadSideNav(a)})},loadSideNav:function(a){a=n.sideNavItems[a]||[],a=n.generateMenuHtml(a);t("#menu-container ul").html(a),layui.element.init()},findFirstLeafMenuItem:function(a){for(var e of a){if(1===e.type)return e;if(e.children&&0<e.children.length){e=n.findFirstLeafMenuItem(e.children);if(e)return e}}return null},generateMenuHtml:function(a){var e="";return a.forEach(function(a){0===a.type?(e=(e+='<li class="layui-nav-item"><a>')+'<i class="'+a.icon+'"></i><span class="happy-nav-title">'+a.title+"</span></a>",a.children&&0<a.children.length&&(e=(e+='<dl class="layui-nav-child">')+n.generateMenuHtml(a.children)+"</dl>"),e+="</li>"):1===a.type&&(e=(e=(e+='<li class="layui-nav-item">')+'<a lay-url="'+a.href+'" lay-id="'+a.id+'">')+'<span class="happy-nav-title">'+a.title+"</span></a></li>")}),e}};a("menu",n)});