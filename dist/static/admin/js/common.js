let srcs=document.scripts[document.scripts.length-1].src.split("/");window.appRoot=srcs.slice(0,-3).join("/")+"/",window.baseRoot=srcs.slice(0,-2).join("/")+"/",window.$=window.jQuery=window.jQuery||layui.$||layui.jquery,layui.config({base:"/static/libs/layui_exts/",version:"2.10.0"}).extend({admin:"admin",pageTab:"pageTab",menu:"menu",tiny:"tinymce/tiny",tinymce:"tinymce/tinymce.min",wangEdit:"wangEditor/wangEdit",wangEditor:"wangEditor/index",ueditor:"ueditor/ueditor",UE:"ueditor/ueditor.all.min",UECONFING:"ueditor/ueditor.config",laytable:"laytable",fieldHandler:"fieldHandler",cron:"cron/cron",xmSelect:"xm-select",popup:"extends/popup",count:"extends/count",toast:"extends/toast",nprogress:"extends/nprogress",echarts:"extends/echarts.min",echartsTheme:"extends/echartsTheme",yaml:"extends/yaml",uploads:"{/}//"+window.location.hostname+"/index/upload/index?",formsbuild:"app/formsbuild",app:"app/app"}).use(["layer","jquery","popup","util"],function(){let d=layui.layer,c=layui.jquery,t=c("body");function u(t,e){var i=c(window).width(),o=c(window).height(),a=e.outerWidth(),n=e.outerHeight();let r=t.pageY+20,s=t.pageX-20;s+a>i&&(s=i-a-10),r+n>o&&(r=o-n-10),s<0&&(s=10),r<0&&(r=10),e.css({top:r,left:s})}t.on("click",'[data-image="click"]',function(t){t.preventDefault();t=c(this).attr("src")||c(this).find("img").attr("src");t&&d.photos({photos:{data:[{alt:"点击查看大图",pid:1,src:t,thumb:t}]},anim:5})}),t.on("mouseenter",'[data-image="hover"]',function(r){let s=c(this),l=s.find("img").attr("src")||s.attr("src");if(l){console.log("Image src:",l);let n=new Image;n.src=l,n.onload=function(){var t=n.width,e=n.height,i=Math.min(260/t,260/e,1),t=t*i,e=e*i;let o=d.tips('<img src="'+l+'" style="max-width:100%; max-height:100%; display:block; object-fit:contain;">',this,{anim:5,tips:3,time:0,skin:"layui-layer-image",isOutAnim:!1,scrollbar:!1,area:[t+"px",e+"px"]}),a=(s.data("layidx",o),c("#layui-layer"+o));u(r,a),s.off("mouseleave").on("mouseleave",function(){d.close(o),s.off("mousemove.tooltip")}),s.on("mousemove.tooltip",function(t){u(t,a)})},n.onerror=function(){console.error("Failed to load image:",l)}}}),t.on("click","[data-modal]",function(e){e.preventDefault();let t=this.dataset.modal,i=c(this).text(),o=this.dataset.width||"800px",a=this.dataset.height||"auto",n=c(window).width(),r=o?o:1400<=n?"800px":"80%";c.ajax({url:t,method:"GET",success:function(t){if(t.code)return d.msg(t.msg);d.open({type:1,title:i,content:t,maxmin:!0,area:[r,a]}),c(e.target).data("removeAfterClick")&&c(e.target).remove()},error:function(t,e,i){console.error("Error:",e,i),d.msg("请求失败: "+e+", "+i,{icon:5})}})})});