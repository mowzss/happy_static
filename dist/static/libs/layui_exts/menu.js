layui.define(["jquery","element","pageTab"],function(e){let t=layui.jquery,i=layui.pageTab,n={render:function(e){this.loadAllMenuData(e)},loadAllMenuData:function(e){var a=Date.now(),e=e+(e.includes("?")?"&":"?")+"ts="+a;t.ajax({url:e,method:"GET",success:function(e){var a;e&&0<e.length?(n.allMenuData=e,a=n.separateMenuData(e),n.topNavItems=a.topNavItems,n.sideNavItems=a.sideNavItems,n.initTopNav(),t("#topNav .layui-nav-item:first-child a").trigger("click"),a=n.findFirstLeafMenuItem(e),e=JSON.parse(sessionStorage.getItem("tabsList"))||[],a={id:String(a.id),title:a.title,url:a.href,allowClose:!1},0===e.length&&(a.change=!0),i.addTab(a)):console.error("菜单数据为空")},error:function(e,a,t){console.error("获取菜单数据失败:",t)}})},separateMenuData:function(e){let t=[],i={};return function a(e){e.forEach(function(e){e.isParent?((0===e.pid?t:(i[e.pid]||(i[e.pid]=[]),i[e.pid])).push(e),e.children&&0<e.children.length&&a(e.children)):(i[e.pid]||(i[e.pid]=[]),i[e.pid].push(e))})}(e),{topNavItems:t,sideNavItems:i}},initTopNav:function(){var e=n.topNavItems.map(function(e){return`<li class="layui-nav-item">
                            <a href="javascript:;" data-tab-id="${e.id}">
                              ${e.title}
                            </a>
                        </li>`}).join("");t("#topNav").html(e),t("#topNav .layui-nav-item a").on("click",function(){t(this).text();var e=t(this).attr("data-tab-id");t(this).parent().addClass("layui-this").siblings().removeClass("layui-this"),n.loadSideNav(e)})},loadSideNav:function(e){e=n.sideNavItems[e]||[],e=n.generateMenuHtml(e);t("#menu-container ul").html(e),layui.element.init()},findFirstLeafMenuItem:function(e){for(var a of e){if(1===a.type)return a;if(a.children&&0<a.children.length){a=n.findFirstLeafMenuItem(a.children);if(a)return a}}return null},generateMenuHtml:function(e){let a="";return e.forEach(function(e){0===e.type?(a=(a+='<li class="layui-nav-item layui-nav-itemed"><a href="javascript:">')+'<i class="'+e.icon+'"></i><span class="happy-nav-title">'+e.title+"</span></a>",e.children&&0<e.children.length&&(a=(a+='<dl class="layui-nav-child">')+n.generateMenuHtml(e.children)+"</dl>"),a+="</li>"):1===e.type&&(a=(a=(a=(a+='<li class="layui-nav-item">')+'<a lay-url="'+e.href+'" lay-id="'+e.id+'">')+'<span class="happy-nav-title">'+e.title+"</span>")+"</a></li>")}),a}};e("menu",n)});