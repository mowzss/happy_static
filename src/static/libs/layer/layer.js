var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(y){function t(e){function t(){i.creat()}var i=this;i.index=++h.index,i.config.maxWidth=m(d).width()-30,i.config=m.extend({},i.config,u.config,e),document.body?t():setTimeout(function(){t()},30)}function p(e){return n.skin?" "+n.skin+" "+n.skin+"-"+e:""}var m,d,e,i=y.layui&&layui.define,u={getPath:(e=document.currentScript?document.currentScript.src:function(){for(var e,t=document.scripts,i=t.length-1,n=i;0<n;n--)if("interactive"===t[n].readyState){e=t[n].src;break}return e||t[i].src}(),(y.LAYUI_GLOBAL||{}).layer_dir||e.substring(0,e.lastIndexOf("/")+1)),config:{removeFocus:!0},end:{},events:{resize:{}},minStackIndex:0,minStackArr:[],btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],type:["dialog","page","iframe","loading","tips"],getStyle:function(e,t){e=e.currentStyle||y.getComputedStyle(e,null);return e[e.getPropertyValue?"getPropertyValue":"getAttribute"](t)},link:function(e,n,t){var i,a,o,s,l;h.path&&(i=document.getElementsByTagName("head")[0],a=document.createElement("link"),o=((t="string"==typeof n?n:t)||e).replace(/\.|\//g,""),s="layuicss-"+o,l=0,a.rel="stylesheet",a.href=h.path+e,a.id=s,document.getElementById(s)||i.appendChild(a),"function"==typeof n)&&function e(t){var i=document.getElementById(s);return 100<++l?y.console&&console.error(o+".css: Invalid"):void(1989===parseInt(u.getStyle(i,"width"))?("creating"===t&&i.removeAttribute("lay-status"),"creating"===i.getAttribute("lay-status")?setTimeout(e,100):n()):(i.setAttribute("lay-status","creating"),setTimeout(function(){e("creating")},100)))}()}},h={v:"2.8.12",ie:(e=navigator.userAgent.toLowerCase(),!!(y.ActiveXObject||"ActiveXObject"in y)&&((e.match(/msie\s(\d+)/)||[])[1]||"11")),index:y.layer&&y.layer.v?1e5:0,path:u.getPath,config:function(e,t){return h.cache=u.config=m.extend({},u.config,e=e||{}),h.path=u.config.path||h.path,"string"==typeof e.extend&&(e.extend=[e.extend]),u.config.path&&h.ready(),e.extend&&(i?layui.addcss("modules/layer/"+e.extend):u.link("css/"+e.extend)),this},ready:function(e){var t=(i?"modules/":"css/")+"layer.css?v="+h.v;return i?layui["layui.all"]?"function"==typeof e&&e():layui.addcss(t,e,"layer"):u.link(t,e,"layer"),this},alert:function(e,t,i){var n="function"==typeof t;return h.open(m.extend({content:e,yes:i=n?t:i},n?{}:t))},confirm:function(e,t,i,n){var a="function"==typeof t;return a&&(n=i,i=t),h.open(m.extend({content:e,btn:u.btn,yes:i,btn2:n},a?{}:t))},msg:function(e,t,i){var n="function"==typeof t,a=u.config.skin,a=(a?a+" "+a+"-msg":"")||"layui-layer-msg",o=g.anim.length-1;return n&&(i=t),h.open(m.extend({content:e,time:3e3,shade:!1,skin:a,title:!1,closeBtn:!1,btn:!1,resize:!1,end:i,removeFocus:!1},n&&!u.config.skin?{skin:a+" layui-layer-hui",anim:o}:(-1!==(t=t||{}).icon&&(void 0!==t.icon||u.config.skin)||(t.skin=a+" "+(t.skin||"layui-layer-hui")),t)))},load:function(e,t){return h.open(m.extend({type:3,icon:e||0,resize:!1,shade:.01,removeFocus:!1},t))},tips:function(e,t,i){return h.open(m.extend({type:4,content:[e,t],closeBtn:!1,time:3e3,shade:!1,resize:!1,fixed:!1,maxWidth:260,removeFocus:!1},i))}},g=(t.pt=t.prototype,["layui-layer",".layui-layer-title",".layui-layer-main",".layui-layer-dialog","layui-layer-iframe","layui-layer-content","layui-layer-btn","layui-layer-close"]),n=(g.anim={0:"layer-anim-00",1:"layer-anim-01",2:"layer-anim-02",3:"layer-anim-03",4:"layer-anim-04",5:"layer-anim-05",6:"layer-anim-06",slideDown:"layer-anim-slide-down",slideLeft:"layer-anim-slide-left",slideUp:"layer-anim-slide-up",slideRight:"layer-anim-slide-right"},g.SHADE="layui-layer-shade",g.MOVE="layui-layer-move",t.pt.config={type:0,shade:.3,fixed:!0,move:g[1],title:"&#x4FE1;&#x606F;",offset:"auto",area:"auto",closeBtn:1,icon:-1,time:0,zIndex:19891014,maxWidth:360,anim:0,isOutAnim:!0,minStack:!0,moveType:1,resize:!0,scrollbar:!0,tips:2},t.pt.vessel=function(e,t){var i,n=this.index,a=this.config,o=a.zIndex+n,s="object"===_typeof(a.title),l=a.maxmin&&(1===a.type||2===a.type),s=a.title?'<div class="layui-layer-title" style="'+(s?a.title[1]:"")+'">'+(s?a.title[0]:a.title)+"</div>":"";return a.zIndex=o,t([a.shade?'<div class="'+g.SHADE+'" id="'+g.SHADE+n+'" times="'+n+'" style="z-index:'+(o-1)+'; "></div>':"",'<div class="'+g[0]+" layui-layer-"+u.type[a.type]+(0!=a.type&&2!=a.type||a.shade?"":" layui-layer-border")+" "+(a.skin||"")+'" id="'+g[0]+n+'" type="'+u.type[a.type]+'" times="'+n+'" showtime="'+a.time+'" conType="'+(e?"object":"string")+'" style="z-index: '+o+"; width:"+a.area[0]+";height:"+a.area[1]+";position:"+(a.fixed?"fixed;":"absolute;")+'">'+(e&&2!=a.type?"":s)+"<div"+(a.id?' id="'+a.id+'"':"")+' class="layui-layer-content'+(0==a.type&&-1!==a.icon?" layui-layer-padding":"")+(3==a.type?" layui-layer-loading"+a.icon:"")+'">'+(t=["layui-icon-tips","layui-icon-success","layui-icon-error","layui-icon-question","layui-icon-lock","layui-icon-face-cry","layui-icon-face-smile"],n="layui-anim layui-anim-rotate layui-anim-loop",0==a.type&&-1!==a.icon?'<i class="layui-layer-face layui-icon '+((i=16==a.icon?"layui-icon layui-icon-loading "+n:i)||t[a.icon]||t[0])+'"></i>':3==a.type?(i=["layui-icon-loading","layui-icon-loading-1"],2==a.icon?'<div class="layui-layer-loading-2 '+n+'"></div>':'<i class="layui-layer-loading-icon layui-icon '+(i[a.icon]||i[0])+" "+n+'"></i>'):"")+((1!=a.type||!e)&&a.content||"")+'</div><div class="layui-layer-setwin">'+(o=[],l&&(o.push('<span class="layui-layer-min"></span>'),o.push('<span class="layui-layer-max"></span>')),a.closeBtn&&o.push('<span class="layui-icon layui-icon-close '+[g[7],g[7]+(a.title?a.closeBtn:4==a.type?"1":"2")].join(" ")+'"></span>'),o.join(""))+"</div>"+(a.btn?function(){var e="";"string"==typeof a.btn&&(a.btn=[a.btn]);for(var t=0,i=a.btn.length;t<i;t++)e+='<a class="'+g[6]+t+'">'+a.btn[t]+"</a>";return'<div class="'+g[6]+" layui-layer-btn-"+(a.btnAlign||"")+'">'+e+"</div>"}():"")+(a.resize?'<span class="layui-layer-resize"></span>':"")+"</div>"],s,m('<div class="'+g.MOVE+'" id="'+g.MOVE+'"></div>')),this},t.pt.creat=function(){var e,t,i,n,a,o=this,s=o.config,l=o.index,r="object"===(void 0===(f=s.content)?"undefined":_typeof(f)),c=m("body");if(s.id&&m("."+g[0]).find("#"+s.id)[0])e=m("#"+s.id).closest("."+g[0]),t=e.attr("times"),i=e.data("config"),n=m("#"+g.SHADE+t),"min"===(e.data("maxminStatus")||{})?h.restore(t):i.hideOnClose&&(n.show(),e.show());else{switch(s.removeFocus&&document.activeElement.blur(),"string"==typeof s.area&&(s.area="auto"===s.area?["",""]:[s.area,""]),s.shift&&(s.anim=s.shift),6==h.ie&&(s.fixed=!1),s.type){case 0:s.btn="btn"in s?s.btn:u.btn[0],h.closeAll("dialog");break;case 2:var f=s.content=r?s.content:[s.content||"","auto"];s.content='<iframe scrolling="'+(s.content[1]||"auto")+'" allowtransparency="true" id="'+g[4]+l+'" name="'+g[4]+l+'" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="'+s.content[0]+'"></iframe>';break;case 3:delete s.title,delete s.closeBtn,-1===s.icon&&s.icon,h.closeAll("loading");break;case 4:r||(s.content=[s.content,"body"]),s.follow=s.content[1],s.content=s.content[0]+'<i class="layui-layer-TipsG"></i>',delete s.title,s.tips="object"===_typeof(s.tips)?s.tips:[s.tips,!0],s.tipsMore||h.closeAll("tips")}o.vessel(r,function(e,t,i){c.append(e[0]),r?2==s.type||4==s.type?m("body").append(e[1]):f.parents("."+g[0])[0]||(f.data("display",f.css("display")).show().addClass("layui-layer-wrap").wrap(e[1]),m("#"+g[0]+l).find("."+g[5]).before(t)):c.append(e[1]),m("#"+g.MOVE)[0]||c.append(u.moveElem=i),o.layero=m("#"+g[0]+l),o.shadeo=m("#"+g.SHADE+l),s.scrollbar||u.setScrollbar(l)}).auto(l),o.shadeo.css({"background-color":s.shade[1]||"#000",opacity:s.shade[0]||s.shade}),2==s.type&&6==h.ie&&o.layero.find("iframe").attr("src",f[0]),4==s.type?o.tips():(o.offset(),parseInt(u.getStyle(document.getElementById(g.MOVE),"z-index"))||(o.layero.css("visibility","hidden"),h.ready(function(){o.offset(),o.layero.css("visibility","visible")}))),s.fixed&&!u.events.resize[o.index]&&(u.events.resize[o.index]=function(){o.resize()},d.on("resize",u.events.resize[o.index])),s.time<=0||setTimeout(function(){h.close(o.index)},s.time),o.move().callback(),g.anim[s.anim]&&(a="layer-anim "+g.anim[s.anim],o.layero.addClass(a).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){m(this).removeClass(a)})),o.layero.data("config",s)}},t.pt.resize=function(){var e=this,t=e.config;e.offset(),(/^\d+%$/.test(t.area[0])||/^\d+%$/.test(t.area[1]))&&e.auto(e.index),4==t.type&&e.tips()},t.pt.auto=function(e){function t(e){(e=n.find(e)).height(a[1]-o-s-2*(0|parseFloat(e.css("padding-top"))))}var i=this.config,n=m("#"+g[0]+e),a=(""===i.area[0]&&0<i.maxWidth&&(h.ie&&h.ie<8&&i.btn&&n.width(n.innerWidth()),n.outerWidth()>i.maxWidth)&&n.width(i.maxWidth),[n.innerWidth(),n.innerHeight()]),o=n.find(g[1]).outerHeight()||0,s=n.find("."+g[6]).outerHeight()||0;return 2===i.type?t("iframe"):""===i.area[1]?0<i.maxHeight&&n.outerHeight()>i.maxHeight?(a[1]=i.maxHeight,t("."+g[5])):i.fixed&&a[1]>=d.height()&&(a[1]=d.height(),t("."+g[5])):t("."+g[5]),this},t.pt.offset=function(){var e=this,t=e.config,i=e.layero,n=[i.outerWidth(),i.outerHeight()],a="object"===_typeof(t.offset);e.offsetTop=(d.height()-n[1])/2,e.offsetLeft=(d.width()-n[0])/2,a?(e.offsetTop=t.offset[0],e.offsetLeft=t.offset[1]||e.offsetLeft):"auto"!==t.offset&&("t"===t.offset?e.offsetTop=0:"r"===t.offset?e.offsetLeft=d.width()-n[0]:"b"===t.offset?e.offsetTop=d.height()-n[1]:"l"===t.offset?e.offsetLeft=0:"lt"===t.offset?(e.offsetTop=0,e.offsetLeft=0):"lb"===t.offset?(e.offsetTop=d.height()-n[1],e.offsetLeft=0):"rt"===t.offset?(e.offsetTop=0,e.offsetLeft=d.width()-n[0]):"rb"===t.offset?(e.offsetTop=d.height()-n[1],e.offsetLeft=d.width()-n[0]):e.offsetTop=t.offset),t.fixed||(e.offsetTop=/%$/.test(e.offsetTop)?d.height()*parseFloat(e.offsetTop)/100:parseFloat(e.offsetTop),e.offsetLeft=/%$/.test(e.offsetLeft)?d.width()*parseFloat(e.offsetLeft)/100:parseFloat(e.offsetLeft),e.offsetTop+=d.scrollTop(),e.offsetLeft+=d.scrollLeft()),"min"===i.data("maxminStatus")&&(e.offsetTop=d.height()-(i.find(g[1]).outerHeight()||0),e.offsetLeft=i.css("left")),i.css({top:e.offsetTop,left:e.offsetLeft})},t.pt.tips=function(){var e=this.config,t=this.layero,i=[t.outerWidth(),t.outerHeight()],n=m(e.follow),a={width:(n=n[0]?n:m("body")).outerWidth(),height:n.outerHeight(),top:n.offset().top,left:n.offset().left},o=t.find(".layui-layer-TipsG"),n=e.tips[0];e.tips[1]||o.remove(),a.autoLeft=function(){0<a.left+i[0]-d.width()?(a.tipLeft=a.left+a.width-i[0],o.css({right:12,left:"auto"})):a.tipLeft=a.left},a.where=[function(){a.autoLeft(),a.tipTop=a.top-i[1]-10,o.removeClass("layui-layer-TipsB").addClass("layui-layer-TipsT").css("border-right-color",e.tips[1])},function(){a.tipLeft=a.left+a.width+10,a.tipTop=a.top,o.removeClass("layui-layer-TipsL").addClass("layui-layer-TipsR").css("border-bottom-color",e.tips[1])},function(){a.autoLeft(),a.tipTop=a.top+a.height+10,o.removeClass("layui-layer-TipsT").addClass("layui-layer-TipsB").css("border-right-color",e.tips[1])},function(){a.tipLeft=a.left-i[0]-10,a.tipTop=a.top,o.removeClass("layui-layer-TipsR").addClass("layui-layer-TipsL").css("border-bottom-color",e.tips[1])}],a.where[n-1](),1===n?a.top-(d.scrollTop()+i[1]+16)<0&&a.where[2]():2===n?0<d.width()-(a.left+a.width+i[0]+16)||a.where[3]():3===n?0<a.top-d.scrollTop()+a.height+i[1]+16-d.height()&&a.where[0]():4===n&&0<i[0]+16-a.left&&a.where[1](),t.find("."+g[5]).css({"background-color":e.tips[1],"padding-right":e.closeBtn?"30px":""}),t.css({left:a.tipLeft-(e.fixed?d.scrollLeft():0),top:a.tipTop-(e.fixed?d.scrollTop():0)})},t.pt.move=function(){var n=this,a=n.config,e=m(document),o=n.layero,r=["LAY_MOVE_DICT","LAY_RESIZE_DICT"],t=o.find(a.move),i=o.find(".layui-layer-resize");return a.move&&t.css("cursor","move"),t.on("mousedown",function(e){var t,i;e.button||(t=m(this),i={},a.move&&(i.layero=o,i.config=a,i.offset=[e.clientX-parseFloat(o.css("left")),e.clientY-parseFloat(o.css("top"))],t.data(r[0],i),u.eventMoveElem=t,u.moveElem.css("cursor","move").show()),e.preventDefault())}),i.on("mousedown",function(e){var t=m(this),i={};a.resize&&(i.layero=o,i.config=a,i.offset=[e.clientX,e.clientY],i.index=n.index,i.area=[o.outerWidth(),o.outerHeight()],t.data(r[1],i),u.eventResizeElem=t,u.moveElem.css("cursor","se-resize").show()),e.preventDefault()}),u.docEvent||(e.on("mousemove",function(e){var t,i,n,a,o,s,l;u.eventMoveElem&&(t=(a=u.eventMoveElem.data(r[0])||{}).layero,o=a.config,s=e.clientX-a.offset[0],l=e.clientY-a.offset[1],i="fixed"===t.css("position"),e.preventDefault(),a.stX=i?0:d.scrollLeft(),a.stY=i?0:d.scrollTop(),o.moveOut||(i=d.width()-t.outerWidth()+a.stX,n=d.height()-t.outerHeight()+a.stY,i<(s=s<a.stX?a.stX:s)&&(s=i),n<(l=l<a.stY?a.stY:l)&&(l=n)),t.css({left:s,top:l})),u.eventResizeElem&&(o=(a=u.eventResizeElem.data(r[1])||{}).config,s=e.clientX-a.offset[0],l=e.clientY-a.offset[1],e.preventDefault(),h.style(a.index,{width:a.area[0]+s,height:a.area[1]+l}),o.resizing)&&o.resizing(a.layero)}).on("mouseup",function(e){var t,i;u.eventMoveElem&&(i=(t=u.eventMoveElem.data(r[0])||{}).config,u.eventMoveElem.removeData(r[0]),delete u.eventMoveElem,u.moveElem.hide(),i.moveEnd)&&i.moveEnd(t.layero),u.eventResizeElem&&(u.eventResizeElem.removeData(r[1]),delete u.eventResizeElem,u.moveElem.hide())}),u.docEvent=!0),n},t.pt.callback=function(){var t=this,i=t.layero,n=t.config;t.openLayer(),n.success&&(2==n.type?i.find("iframe").on("load",function(){n.success(i,t.index,t)}):n.success(i,t.index,t)),6==h.ie&&t.IE6(i),i.find("."+g[6]).children("a").on("click",function(){var e=m(this).index();0===e?n.yes?n.yes(t.index,i,t):n.btn1?n.btn1(t.index,i,t):h.close(t.index):!1!==(n["btn"+(e+1)]&&n["btn"+(e+1)](t.index,i,t))&&h.close(t.index)}),i.find("."+g[7]).on("click",function(){!1!==(n.cancel&&n.cancel(t.index,i,t))&&h.close(t.index)}),n.shadeClose&&t.shadeo.on("click",function(){h.close(t.index)}),i.find(".layui-layer-min").on("click",function(){!1!==(n.min&&n.min(i,t.index,t))&&h.min(t.index,n)}),i.find(".layui-layer-max").on("click",function(){m(this).hasClass("layui-layer-maxmin")?(h.restore(t.index),n.restore&&n.restore(i,t.index,t)):(h.full(t.index,n),setTimeout(function(){n.full&&n.full(i,t.index,t)},100))}),n.end&&(u.end[t.index]=n.end)},u.reselect=function(){m.each(m("select"),function(e,t){var i=m(this);i.parents("."+g[0])[0]||1==i.attr("layer")&&m("."+g[0]).length<1&&i.removeAttr("layer").show()})},t.pt.IE6=function(e){m("select").each(function(e,t){var i=m(this);i.parents("."+g[0])[0]||"none"===i.css("display")||i.attr({layer:"1"}).hide()})},t.pt.openLayer=function(){h.zIndex=this.config.zIndex,h.setTop=function(e){return h.zIndex=parseInt(e[0].style.zIndex),e.on("mousedown",function(){h.zIndex++,e.css("z-index",h.zIndex+1)}),h.zIndex}},u.record=function(e){if(!e[0])return y.console&&console.error("index error");var t=[e[0].style.width||e.width(),e[0].style.height||e.height(),e.position().top,e.position().left+parseFloat(e.css("margin-left"))];e.find(".layui-layer-max").addClass("layui-layer-maxmin"),e.attr({area:t})},u.setScrollbar=function(e){g.html.css("overflow","hidden").attr("layer-full",e)},u.restScrollbar=function(e){g.html.attr("layer-full")==e&&(g.html[0].style[g.html[0].style.removeProperty?"removeProperty":"removeAttribute"]("overflow"),g.html.removeAttr("layer-full"))},(y.layer=h).getChildFrame=function(e,t){return t=t||m("."+g[4]).attr("times"),m("#"+g[0]+t).find("iframe").contents().find(e)},h.getFrameIndex=function(e){return m("#"+e).parents("."+g[4]).attr("times")},h.iframeAuto=function(e){var t,i,n;e&&(t=h.getChildFrame("html",e).outerHeight(),i=(e=m("#"+g[0]+e)).find(g[1]).outerHeight()||0,n=e.find("."+g[6]).outerHeight()||0,e.css({height:t+i+n}),e.find("iframe").css({height:t}))},h.iframeSrc=function(e,t){m("#"+g[0]+e).find("iframe").attr("src",t)},h.style=function(e,t,i){var e=m("#"+g[0]+e),n=e.find(".layui-layer-content"),a=e.attr("type"),o=e.find(g[1]).outerHeight()||0,s=e.find("."+g[6]).outerHeight()||0;e.attr("minLeft"),a!==u.type[3]&&a!==u.type[4]&&(i||(parseFloat(t.width)<=260&&(t.width=260),parseFloat(t.height)-o-s<=64&&(t.height=64+o+s)),e.css(t),s=e.find("."+g[6]).outerHeight()||0,a===u.type[2]?e.find("iframe").css({height:("number"==typeof t.height?t.height:e.height())-o-s}):n.css({height:("number"==typeof t.height?t.height:e.height())-o-s-parseFloat(n.css("padding-top"))-parseFloat(n.css("padding-bottom"))}))},h.min=function(e,t){var i,n,a,o,s,l,r=m("#"+g[0]+e),c=r.data("maxminStatus");"min"!==c&&("max"===c&&h.restore(e),r.data("maxminStatus","min"),t=t||r.data("config")||{},c=m("#"+g.SHADE+e),i=r.find(".layui-layer-min"),n=r.find(g[1]).outerHeight()||0,o=(a="string"==typeof(o=r.attr("minLeft")))?o:181*u.minStackIndex+"px",s=r.css("position"),l={width:180,height:n,position:"fixed",overflow:"hidden"},u.record(r),0<u.minStackArr.length&&(o=u.minStackArr[0],u.minStackArr.shift()),parseFloat(o)+180>d.width()&&(o=d.width()-180-(u.minStackArr.edgeIndex=u.minStackArr.edgeIndex||0,u.minStackArr.edgeIndex+=3))<0&&(o=0),t.minStack&&(l.left=o,l.top=d.height()-n,a||u.minStackIndex++,r.attr("minLeft",o)),r.attr("position",s),h.style(e,l,!0),i.hide(),"page"===r.attr("type")&&r.find(g[4]).hide(),u.restScrollbar(e),c.hide())},h.restore=function(e){var t=m("#"+g[0]+e),i=m("#"+g.SHADE+e),n=t.attr("area").split(","),a=t.attr("type"),o=t.data("config")||{};t.removeData("maxminStatus"),h.style(e,{width:n[0],height:n[1],top:parseFloat(n[2]),left:parseFloat(n[3]),position:t.attr("position"),overflow:"visible"},!0),t.find(".layui-layer-max").removeClass("layui-layer-maxmin"),t.find(".layui-layer-min").show(),"page"===a&&t.find(g[4]).show(),o.scrollbar?u.restScrollbar(e):u.setScrollbar(e),i.show()},h.full=function(t){var i=m("#"+g[0]+t),e=i.data("maxminStatus");"max"!==e&&("min"===e&&h.restore(t),i.data("maxminStatus","max"),u.record(i),g.html.attr("layer-full")||u.setScrollbar(t),setTimeout(function(){var e="fixed"===i.css("position");h.style(t,{top:e?0:d.scrollTop(),left:e?0:d.scrollLeft(),width:"100%",height:"100%"},!0),i.find(".layui-layer-min").hide()},100))},h.title=function(e,t){m("#"+g[0]+(t||h.index)).find(g[1]).html(e)},h.close=function(a,o){var s,e,l=(t=m("."+g[0]).children("#"+a).closest("."+g[0]))[0]?(a=t.attr("times"),t):m("#"+g[0]+a),r=l.attr("type"),t=l.data("config")||{},c=t.id&&t.hideOnClose;l[0]&&(s={slideDown:"layer-anim-slide-down-out",slideLeft:"layer-anim-slide-left-out",slideUp:"layer-anim-slide-up-out",slideRight:"layer-anim-slide-right-out"}[t.anim]||"layer-anim-close",e=function(){var e="layui-layer-wrap";if(c)return l.removeClass("layer-anim "+s),l.hide();if(r===u.type[1]&&"object"===l.attr("conType")){l.children(":not(."+g[5]+")").remove();for(var t=l.find("."+e),i=0;i<2;i++)t.unwrap();t.css("display",t.data("display")).removeClass(e)}else{if(r===u.type[2])try{var n=m("#"+g[4]+a)[0];n.contentWindow.document.write(""),n.contentWindow.close(),l.find("."+g[5])[0].removeChild(n)}catch(e){}l[0].innerHTML="",l.remove()}"function"==typeof u.end[a]&&u.end[a](),delete u.end[a],"function"==typeof o&&o(),u.events.resize[a]&&(d.off("resize",u.events.resize[a]),delete u.events.resize[a])},m("#"+g.SHADE+a)[c?"hide":"remove"](),t.isOutAnim&&l.addClass("layer-anim "+s),6==h.ie&&u.reselect(),u.restScrollbar(a),"string"==typeof l.attr("minLeft")&&(u.minStackIndex--,u.minStackArr.push(l.attr("minLeft"))),h.ie&&h.ie<10||!t.isOutAnim?e():setTimeout(function(){e()},200))},h.closeAll=function(n,a){"function"==typeof n&&(a=n,n=null);var o=m("."+g[0]);m.each(o,function(e){var t=m(this),i=n?t.attr("type")===n:1;i&&h.close(t.attr("times"),e===o.length-1?a:null)}),0===o.length&&"function"==typeof a&&a()},h.closeLast=function(e){h.close(m(".layui-layer-"+(e=e||"page")+":last").attr("times"))},h.cache||{});h.prompt=function(i,n){var e="",t="";"function"==typeof(i=i||{})&&(n=i),i.area&&(e='style="width: '+(o=i.area)[0]+"; height: "+o[1]+';"',delete i.area),i.placeholder&&(t=' placeholder="'+i.placeholder+'"');var a,o=2==i.formType?'<textarea class="layui-layer-input"'+e+t+"></textarea>":'<input type="'+(1==i.formType?"password":"text")+'" class="layui-layer-input"'+t+">",s=i.success;return delete i.success,h.open(m.extend({type:1,btn:["&#x786E;&#x5B9A;","&#x53D6;&#x6D88;"],content:o,skin:"layui-layer-prompt"+p("prompt"),maxWidth:d.width(),success:function(e){(a=e.find(".layui-layer-input")).val(i.value||"").focus(),"function"==typeof s&&s(e)},resize:!1,yes:function(e){var t=a.val();t.length>(i.maxlength||500)?h.tips("&#x6700;&#x591A;&#x8F93;&#x5165;"+(i.maxlength||500)+"&#x4E2A;&#x5B57;&#x6570;",a,{tips:1}):n&&n(t,e,a)}},i))},h.tab=function(n){var a=(n=n||{}).tab||{},o="layui-this",s=n.success;return delete n.success,h.open(m.extend({type:1,skin:"layui-layer-tab"+p("tab"),resize:!1,title:function(){var e=a.length,t=1,i="";if(0<e)for(i='<span class="'+o+'">'+a[0].title+"</span>";t<e;t++)i+="<span>"+a[t].title+"</span>";return i}(),content:'<ul class="layui-layer-tabmain">'+function(){var e=a.length,t=1,i="";if(0<e)for(i='<li class="layui-layer-tabli '+o+'">'+(a[0].content||"no content")+"</li>";t<e;t++)i+='<li class="layui-layer-tabli">'+(a[t].content||"no  content")+"</li>";return i}()+"</ul>",success:function(e){var t=e.find(".layui-layer-title").children(),i=e.find(".layui-layer-tabmain").children();t.on("mousedown",function(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0;var e=m(this),t=e.index();e.addClass(o).siblings().removeClass(o),i.eq(t).show().siblings().hide(),"function"==typeof n.change&&n.change(t)}),"function"==typeof s&&s(e)}},n))},h.photos=function(n,e,a){var t,i,o={};if((n=n||{}).photos){var s=!("string"==typeof n.photos||n.photos instanceof m),l=s?n.photos:{},r=l.data||[],c=l.start||0,f=(o.imgIndex=1+(0|c),n.img=n.img||"img",n.success);if(delete n.success,s){if(0===r.length)return h.msg("&#x6CA1;&#x6709;&#x56FE;&#x7247;")}else{var d=m(n.photos),u=function(){r=[],d.find(n.img).each(function(e){var t=m(this);t.attr("layer-index",e),r.push({alt:t.attr("alt"),pid:t.attr("layer-pid"),src:t.attr("lay-src")||t.attr("layer-src")||t.attr("src"),thumb:t.attr("src")})})};if(u(),0===r.length)return;if(e||d.on("click",n.img,function(){u();var e=m(this).attr("layer-index");h.photos(m.extend(n,{photos:{start:e,data:r,tab:n.tab},full:n.full}),!0)}),!e)return}o.imgprev=function(e){o.imgIndex--,o.imgIndex<1&&(o.imgIndex=r.length),o.tabimg(e)},o.imgnext=function(e,t){++o.imgIndex>r.length&&(o.imgIndex=1,t)||o.tabimg(e)},o.keyup=function(e){var t;o.end||(t=e.keyCode,e.preventDefault(),37===t?o.imgprev(!0):39===t?o.imgnext(!0):27===t&&h.close(o.index))},o.tabimg=function(e){if(!(r.length<=1))return l.start=o.imgIndex-1,h.close(o.index),h.photos(n,!0,e)},o.event=function(){o.bigimg.find(".layui-layer-imgprev").on("click",function(e){e.preventDefault(),o.imgprev(!0)}),o.bigimg.find(".layui-layer-imgnext").on("click",function(e){e.preventDefault(),o.imgnext(!0)}),m(document).on("keyup",o.keyup)},o.loadi=h.load(1,{shade:!("shade"in n)&&.9,scrollbar:!1}),s=r[c].src,t=function(e){h.close(o.loadi);var t,i=r[c].alt||"";a&&(n.anim=-1),o.index=h.open(m.extend({type:1,id:"layui-layer-photos",area:(e=[e.width,e.height],t=[m(y).width()-100,m(y).height()-100],!n.full&&(t[0]<e[0]||t[1]<e[1])&&((t=[e[0]/t[0],e[1]/t[1]])[1]<t[0]?(e[0]=e[0]/t[0],e[1]=e[1]/t[0]):t[0]<t[1]&&(e[0]=e[0]/t[1],e[1]=e[1]/t[1])),[e[0]+"px",e[1]+"px"]),title:!1,shade:.9,shadeClose:!0,closeBtn:!1,move:".layui-layer-phimg img",moveType:1,scrollbar:!1,moveOut:!0,anim:5,isOutAnim:!1,skin:"layui-layer-photos"+p("photos"),content:'<div class="layui-layer-phimg"><img src="'+r[c].src+'" alt="'+i+'" layer-pid="'+r[c].pid+'">'+(t=['<div class="layui-layer-imgsee">'],1<r.length&&t.push(['<div class="layui-layer-imguide">','<span class="layui-icon layui-icon-left layui-layer-iconext layui-layer-imgprev"></span>','<span class="layui-icon layui-icon-right layui-layer-iconext layui-layer-imgnext"></span>',"</div>"].join("")),n.hideFooter||t.push(['<div class="layui-layer-imgbar">','<div class="layui-layer-imgtit">',"<h3>"+i+"</h3>","<em>"+o.imgIndex+" / "+r.length+"</em>",'<a href="'+r[c].src+'" target="_blank">查看原图</a>',"</div>","</div>"].join("")),t.push("</div>"),t.join(""))+"</div>",success:function(e,t){o.bigimg=e.find(".layui-layer-phimg"),o.imgsee=e.find(".layui-layer-imgbar"),o.event(e),n.tab&&n.tab(r[c],e),"function"==typeof f&&f(e)},end:function(){o.end=!0,m(document).off("keyup",o.keyup)}},n))},(i=new Image).src=s,i.complete?t(i):(i.onload=function(){i.onload=null,t(i)},i.onerror=function(e){i.onerror=null,h.close(o.loadi),h.msg("&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;",{time:3e4,btn:["&#x4E0B;&#x4E00;&#x5F20;","&#x4E0D;&#x770B;&#x4E86;"],yes:function(){1<r.length&&o.imgnext(!0,!0)}})})}},u.run=function(e){d=(m=e)(y),g.html=m("html"),h.open=function(e){return new t(e).index}},y.layui&&layui.define?(h.ready(),layui.define("jquery",function(e){h.path=layui.cache.dir,u.run(layui.$),e("layer",y.layer=h)})):"function"==typeof define&&define.amd?define(["jquery"],function(){return u.run(y.jQuery),h}):(h.ready(),u.run(y.jQuery))}(window);