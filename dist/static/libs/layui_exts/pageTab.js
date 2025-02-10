layui.define(["element","util","layer"],function(e){function t(e){var t={filter:h.config.tabFilter,naletr:[{eventName:"closeThis",title:"关闭",icon:"iconfont icon-cuowuguanbiquxiao"},{eventName:"refreshThis",title:"刷新标签",icon:"iconfont icon-shuaxin"},{eventName:"toggleFullScreen",title:"全屏显示",icon:"layui-icon layui-icon-screen-full"},{eventName:"line",title:""},{eventName:"closeLeft",title:"关闭左侧标签页",icon:"iconfont icon-diyiye"},{eventName:"closeRight",title:"关闭右侧标签页",icon:"iconfont icon-zuihouye"},{eventName:"line",title:""},{eventName:"closeOther",title:"关闭其它标签页",icon:"iconfont icon-hengxiangshouqi"},{eventName:"closeAll",title:"关闭所有标签页",icon:"iconfont icon-guanbiquanbu"}]};this.config={...t,...e},this.config&&this.render(this.config)}let s=layui.element,c=layui.jquery,o=layui.layer;function u(e,t){e.scrollLeft();var n=t.offset().left-e.offset().left+e.scrollLeft(),t=t.outerWidth();e.animate({scrollLeft:n-(e.width()-t)/2},300)}t.prototype.render=function(e){e.filter?(this.filter=e.filter,this.naletr=e.naletr,document.fullscreenElement===this.fullScreenTarget?this.menuElement||(this.menuElement=c("<ul class='right-menu'></ul>").appendTo(this.fullScreenTarget)):this.menuElement||(this.menuElement=c("<ul class='right-menu'></ul>").appendTo("body")),this.renderMenuItems(),this.bindEvents(),this.fullScreenTarget=document.querySelector('[lay-filter="'+this.filter+'"]'),this.fullScreenTarget?this.fullScreenTarget.addEventListener("fullscreenchange",()=>{this.updateFullScreenMenuItem(),this.updateMenuParent()}):console.error("[ERROR] 未找到符合 'filter' 的全屏目标元素！")):console.error("[ERROR] 使用 tabRightMenu 组件需要指定 'filter' 属性！")},t.prototype.updateMenuParent=function(){document.fullscreenElement===this.fullScreenTarget?this.menuElement.appendTo(this.fullScreenTarget):this.menuElement.appendTo("body")},t.prototype.renderMenuItems=function(){this.menuElement.empty(),this.naletr.forEach(e=>{("line"===e.eventName?c("<hr>"):c("<li class='right-menu-item'  data-event='"+e.eventName+"'><i class='"+e.icon+"'></i> "+e.title+"</li>")).appendTo(this.menuElement)}),this.updateFullScreenMenuItem()},t.prototype.updateFullScreenMenuItem=function(){var e=this.menuElement.find("[data-event='toggleFullScreen']"),t=c('[lay-header-event="tabFullScreen"]');document.fullscreenElement===this.fullScreenTarget?(e.html("<i class='layui-icon layui-icon-screen-restore'></i> 退出全屏"),t.html("<em class='layui-icon layui-icon-screen-restore'></em>")):(e.html("<i class='layui-icon layui-icon-screen-full'></i> 全屏显示"),t.html("<em class='layui-icon layui-icon-screen-full'></em>"))},t.prototype.bindEvents=function(){let t=this;c("#happy-content .layui-body-tabs").on("contextmenu",".layui-tab-title > li",e=>{e.preventDefault(),t.showMenu(e,c(e.currentTarget).attr("lay-id"))}),c(document).off("click.rightMenu"),c(document).on("click.rightMenu",e=>{t.menuElement.is(e.target)||0!==t.menuElement.has(e.target).length||t.hideMenu()}),t.menuElement.off("click.rightMenuItem"),t.menuElement.on("click.rightMenuItem","li[data-event]",e=>{e.stopPropagation();e=c(e.currentTarget).attr("data-event");e&&t.handleMenuItemClick(e)})},t.prototype.showMenu=function(n,i){if(i){this.currentActiveTabID=i;i=this.menuElement;let e=c(document).width()-n.clientX<i.width()?n.clientX-i.width():n.clientX,t=c(document).height()-n.clientY<i.height()?n.clientY-i.height():n.clientY;document.fullscreenElement===this.fullScreenTarget&&(n=c(this.fullScreenTarget).offset(),e-=n.left,t-=n.top),i.css({left:e,top:t}).show()}},t.prototype.hideMenu=function(){this.menuElement.hide()},t.prototype.handleMenuItemClick=function(e){if(e){h.onTab();var t=c(".layui-tab[lay-filter='"+this.filter+"'] li");let i=!1;switch(e){case"refreshThis":c(`.layui-tab-item[lay-id="${this.currentActiveTabID}"]`).length&&c('[lay-header-event="refreshTab"]').trigger("click");break;case"closeThis":s.tabDelete(this.filter,this.currentActiveTabID);var n=t.not(`[lay-id="${this.currentActiveTabID}"]`).first();n.length&&s.tabChange(this.filter,n.attr("lay-id"));break;case"toggleFullScreen":this.toggleFullScreen();break;case"closeAll":c.each(t,(e,t)=>{t=c(t).attr("lay-id");s.tabDelete(this.filter,t)});break;case"closeOther":c.each(t,(e,t)=>{t=c(t).attr("lay-id");s.tabDelete(this.filter,t)});break;case"closeLeft":c.each(t,(e,t)=>{t=c(t).attr("lay-id");t===this.currentActiveTabID?i=!0:i||s.tabDelete(this.filter,t)});break;case"closeRight":i=!1,c.each(t,(e,t)=>{let n=c(t).attr("lay-id");n===this.currentActiveTabID?i=!0:i&&setTimeout(()=>{s.tabDelete(this.filter,n)},0)})}this.hideMenu()}},t.prototype.toggleFullScreen=function(){if(this.fullScreenTarget)if(document.fullscreenElement)try{h.exitFullscreen().then(()=>{this.updateFullScreenMenuItem(),this.updateMenuParent()}).catch(e=>{o.msg("无法退出全屏模式,请手动操作")})}catch(e){o.msg("无法退出全屏模式,请手动操作")}else try{h.requestFullscreen(this.fullScreenTarget).then(()=>{this.updateFullScreenMenuItem(),this.updateMenuParent()}).catch(e=>{o.msg("无法进入全屏模式,请手动操作")})}catch(e){o.msg("无法进入全屏模式,请手动操作")}else console.error("[ERROR] 未找到符合 'filter' 的全屏目标元素！")};let h={config:{tabFilter:"layout-filter-tab",tabsContent:"#happy-content > .layui-body-tabs"},showLoadingBar:function(){c("#loading-bar").css("width","0%").show(),setTimeout(()=>{c("#loading-bar").css("width","100%")},0)},hideLoadingBar:function(){setTimeout(()=>{c("#loading-bar").css("width","0%").hide()},2e3)},getActiveTabId:function(){return c(this.config.tabsContent).find(".layui-tab-title li[lay-id].layui-this").attr("lay-id")},refreshTab:function(){var e=this.getActiveTabId();e&&s.tabChange(this.config.tabFilter,e)},addTab:function(e){var t=String(e.id),n=e.url,i=e.change??!1,l=e.allowClose??!0,e=e.title;this.tabIsExist(t)?(c(`[lay-filter="${this.config.tabFilter}"]`).find('[data-page-id="'+t+'"]').attr("data-src",n),i&&s.tabChange(this.config.tabFilter,t)):s.tabAdd(this.config.tabFilter,{id:t,title:e,url:n,change:i,allowClose:l})},updateTabData:function(e,t){var n=JSON.parse(sessionStorage.getItem("tabsList"))||[];let i=String(e);-1===n.findIndex(e=>e.id===i)&&n.push({id:i,...t}),sessionStorage.setItem("tabsList",JSON.stringify(n)),sessionStorage.setItem("tabsActiveId",i)},delTabData:function(t){var e=JSON.parse(sessionStorage.getItem("tabsList"))||[];let n=sessionStorage.getItem("tabsActiveId");var i=e.findIndex(e=>e.id===t);-1!==i?(e.splice(i,1),t===n&&(0<e.length?(n=e[0].id,s.tabChange(this.config.tabFilter,n)):n=null),sessionStorage.setItem("tabsList",JSON.stringify(e)),sessionStorage.setItem("tabsActiveId",n)):t===n&&(n=0<e.length?e[0].id:null,sessionStorage.setItem("tabsActiveId",n))},tabIsExist:function(e){let t=!1;return c(this.config.tabsContent).find(".layui-tab-title li").each(function(){if(c(this).attr("lay-id")===e)return!(t=!0)}),t},clearOtherTabsContent:function(e){c(this.config.tabsContent).find(".layui-tab-item").each(function(){c(this).attr("lay-id")!==e&&c(this).find(".happy-tab-content").empty()})},onTab:function(){let r=this;s.on("tab("+this.config.tabFilter+")",function(e){var t=c(e.elem),n=t.find(".layui-this");u(t,n);let i=e.id;n=t.find(`.layui-tab-title li[lay-id="${i}"]`);let l=n.attr("lay-url");e=n.attr("lay-allowclose");let a=t.find(`.layui-tab-item[lay-id="${i}"]`);t=a.find(".happy-tab-content").attr("data-src");t&&(l=t),r.updateTabData(i,{id:i,title:n.text(),url:l,allowClose:e}),l&&(h.showLoadingBar(),c.ajax({url:l,type:"GET",dataType:"html",async:!1,success:function(e){e.startsWith("{")||e.startsWith("[")?((e=JSON.parse(e)).info&&o.msg(e.info),e.url&&setTimeout(function(){window.location.href=e.url},1500)):(a.html(`
                            <div class="happy-tab-content" 
                                 style="display:none;" 
                                 data-page-id="${i}" 
                                 data-src="${l}">
                                ${e}
                            </div>
                        `),s.init(),setTimeout(()=>{a.find(".happy-tab-content").show().addClass("animated slideInFromBottom")},100),h.hideLoadingBar())},error:function(){o.msg("加载失败，请重试！"),h.hideLoadingBar()}})),h.clearOtherTabsContent(i)}),s.on("tabBeforeDelete("+this.config.tabFilter+")",function(e){var t=c(`.layui-tab-title li[lay-id="${e.id}"]`),n=t.text();if("false"===t.attr("lay-allowclose"))return o.msg(n+" 标签禁止删除"),!1;r.delTabData(e.id)})},rightMenu:function(e){return new t(e)},moveTabs:function(e){var t=c(this.config.tabsContent).find(".layui-tab-title"),n=t.find(".layui-this"),i=t.children("li"),n=i.index(n);let l;"prev"===e&&0<n?l=n-1:"next"===e&&n<i.length-1&&(l=n+1),void 0!==l&&((e=i.eq(l)).trigger("click"),u(t,e))},requestFullscreen:function(n){return new Promise((e,t)=>{n.requestFullscreen?n.requestFullscreen().then(e).catch(t):n.mozRequestFullScreen?n.mozRequestFullScreen().then(e).catch(t):n.webkitRequestFullscreen?n.webkitRequestFullscreen().then(e).catch(t):n.msRequestFullscreen?n.msRequestFullscreen().then(e).catch(t):t(new Error("浏览器不支持全屏"))})},exitFullscreen:function(){return new Promise((e,t)=>{document.exitFullscreen?document.exitFullscreen().then(e).catch(t):document.mozCancelFullScreen?document.mozCancelFullScreen().then(e).catch(t):document.webkitExitFullscreen?document.webkitExitFullscreen().then(e).catch(t):document.msExitFullscreen?document.msExitFullscreen().then(e).catch(t):t(new Error("浏览器不支持退出全屏"))})}};e("pageTab",h)});