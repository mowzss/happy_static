/*! UEditorPlus v2.0.0*/
!function(){function initTabs(){for(var e=$G("tabhead").children,t=0;t<e.length;t++)domUtils.on(e[t],"click",function(e){setTabFocus((e.target||e.srcElement).getAttribute("data-content-id"))});editorOpt.disableUpload||($G("tabhead").querySelector('[data-content-id="upload"]').style.display="inline-block"),editorOpt.disableOnline||($G("tabhead").querySelector('[data-content-id="online"]').style.display="inline-block"),editorOpt.selectCallback&&($G("imageSelect").style.display="inline-block",domUtils.on($G("imageSelect"),"click",function(e){editorOpt.selectCallback(editor,function(e){var t;e&&($G("url").value=e.path,$G("title").value=e.name,(t=new Image).onload=function(){$G("width").value=t.width,$G("height").value=t.height,remoteImage.setPreview()},t.onerror=function(){remoteImage.setPreview()},t.src=e.path)})}));var i=editor.selection.getRange().getClosedNode();setTabFocus((i&&i.tagName&&i.tagName.toLowerCase(),"remote"))}function setTabFocus(e){if(e){for(var t,i=$G("tabhead").children,a=0;a<i.length;a++)(t=i[a].getAttribute("data-content-id"))==e?(domUtils.addClass(i[a],"focus"),domUtils.addClass($G(t),"focus")):(domUtils.removeClasses(i[a],"focus"),domUtils.removeClasses($G(t),"focus"));switch(e){case"remote":remoteImage=remoteImage||new RemoteImage;break;case"upload":setAlign(editor.getOpt("imageInsertAlign")),uploadImage=uploadImage||new UploadImage("queueList");break;case"online":setAlign(editor.getOpt("imageManagerInsertAlign")),(onlineImage=onlineImage||new OnlineImage("imageList")).reset()}}}function initButtons(){dialog.onok=function(){for(var e,t=[],i=$G("tabhead").children,a=0;a<i.length;a++)if(domUtils.hasClass(i[a],"focus")){e=i[a].getAttribute("data-content-id");break}switch(e){case"remote":t=remoteImage.getInsertList();break;case"upload":var t=uploadImage.getInsertList(),s=uploadImage.getQueueCount();if(s)return $(".info","#queueList").html('<span style="color:red;">'+"还有2个未上传文件".replace(/[\d]/,s)+"</span>"),!1;break;case"online":t=onlineImage.getInsertList()}t&&editor.execCommand("insertimage",t)}}function initAlign(){domUtils.on($G("alignIcon"),"click",function(e){e=e.target||e.srcElement;e.className&&-1!=e.className.indexOf("-align")&&setAlign(e.getAttribute("data-align"))})}function setAlign(e){e=e||"none";var t=$G("alignIcon").children;for(i=0;i<t.length;i++)t[i].getAttribute("data-align")==e?(domUtils.addClass(t[i],"focus"),$G("align").value=t[i].getAttribute("data-align")):domUtils.removeClasses(t[i],"focus")}function getAlign(){var e=$G("align").value||"none";return"none"==e?"":e}function RemoteImage(e){this.container=utils.isString(e)?document.getElementById(e):e,this.init()}function UploadImage(e){this.$wrap=e.constructor==String?$("#"+e):$(e),this.init()}function OnlineImage(e){this.container=utils.isString(e)?document.getElementById(e):e,this.init()}var remoteImage,uploadImage,onlineImage,editorOpt={};window.onload=function(){editorOpt=editor.getOpt("imageConfig"),initTabs(),initAlign(),initButtons()},RemoteImage.prototype={init:function(){this.initContainer(),this.initEvents()},initContainer:function(){this.dom={url:$G("url"),width:$G("width"),height:$G("height"),border:$G("border"),vhSpace:$G("vhSpace"),title:$G("title"),align:$G("align")};var e=editor.selection.getRange().getClosedNode();e&&this.setImage(e)},initEvents:function(){function t(){i.setPreview()}var i=this,a=$G("lock");domUtils.on($G("url"),"keyup",t),domUtils.on($G("border"),"keyup",t),domUtils.on($G("title"),"keyup",t),domUtils.on($G("width"),"keyup",function(){var e;a.checked?(e=a.getAttribute("data-proportion"),$G("height").value=Math.round(this.value/e)):i.updateLocker(),t()}),domUtils.on($G("height"),"keyup",function(){var e;a.checked?(e=a.getAttribute("data-proportion"),$G("width").value=Math.round(this.value*e)):i.updateLocker(),t()}),domUtils.on($G("lock"),"change",function(){var e=parseInt($G("width").value)/parseInt($G("height").value);a.setAttribute("data-proportion",e)})},updateLocker:function(){var e=$G("width").value,t=$G("height").value,i=$G("lock");e&&t&&e==parseInt(e)&&t==parseInt(t)?(i.disabled=!1,i.title=""):(i.checked=!1,i.disabled="disabled",i.title=lang.remoteLockError)},setImage:function(e){var t,i;e.tagName&&("img"==e.tagName.toLowerCase()||e.getAttribute("src"))&&e.src&&(t=(t=e.getAttribute("data-word-image"))?t.replace("&amp;","&"):e.getAttribute("_src")||e.getAttribute("src",2).replace("&amp;","&"),i=editor.queryCommandValue("imageFloat"),t!==$G("url").value&&($G("url").value=t),t)&&($G("width").value=e.width||"",$G("height").value=e.height||"",$G("border").value=e.getAttribute("border")||"0",$G("vhSpace").value=e.getAttribute("vspace")||"0",$G("title").value=e.title||e.alt||"",setAlign(i),this.setPreview(),this.updateLocker())},getData:function(){var e,t={};for(e in this.dom)t[e]=this.dom[e].value;return t},setPreview:function(){var e=$G("url").value,t=$G("width").value,i=$G("height").value,a=$G("border").value,s=$G("title").value,n=$G("preview"),r=t&&i?Math.min(t,n.offsetWidth):n.offsetWidth;r=r+2*a>n.offsetWidth?r:n.offsetWidth-2*a,e&&(n.innerHTML='<img src="'+e+'" width="'+r+'" height="'+(t&&i?r*i/t:"")+'" border="'+a+'px solid #000" title="'+s+'" />')},getInsertList:function(){var e,t=this.getData();return t.url?(e={src:t.url,_src:t.url,_propertyDelete:[],style:[]},t.width?(e.width=t.width,e.style.push("width:"+t.width+"px")):e._propertyDelete.push("width"),t.height?(e.height=t.height,e.style.push("height:"+t.height+"px")):e._propertyDelete.push("height"),t.border?e.border=t.border:e._propertyDelete.push("border"),t.align?e.floatStyle=t.align:e._propertyDelete.push("floatStyle"),t.vhSpace?e.vspace=t.vhSpace:e._propertyDelete.push("vspace"),t.title?e.alt=t.title:e._propertyDelete.push("alt"),0<e.style.length?e.style=e.style.join(";"):e._propertyDelete.push("style"),[e]):[]}},UploadImage.prototype={init:function(){this.imageList=[],this.initContainer(),this.initUploader()},initContainer:function(){this.$queue=this.$wrap.find(".filelist")},initUploader:function(){function t(i){function a(e){switch(e){case"exceed_size":text=lang.errorExceedSize;break;case"interrupt":text=lang.errorInterrupt;break;case"http":text=lang.errorHttp;break;case"not_allow_type":text=lang.errorFileType;break;default:text=lang.errorUploadRetry}l.text(text).show()}var s=u('<li id="'+i.id+'"><p class="title">'+i.name+'</p><p class="imgWrap"></p><p class="progress"><span></span></p></li>'),n=u('<div class="file-panel"><span class="cancel">'+lang.uploadDelete+'</span><span class="rotateRight">'+lang.uploadTurnRight+'</span><span class="rotateLeft">'+lang.uploadTurnLeft+"</span></div>").appendTo(s),r=s.find("p.progress span"),o=s.find("p.imgWrap"),l=u('<p class="error"></p>').hide().appendTo(s);"invalid"===i.getStatus()?a(i.statusText):(o.text(lang.uploadPreview),browser.ie&&browser.version<=7?o.text(lang.uploadNoPreview):d.makeThumb(i,function(e,t){e||!t?o.text(lang.uploadNoPreview):(e=u('<img src="'+t+'">'),o.empty().append(e),e.on("error",function(){o.text(lang.uploadNoPreview)}))},v,b),C[i.id]=[i.size,0],i.rotation=0,i.ext&&-1!=I.indexOf(i.ext.toLowerCase())||(a("not_allow_type"),d.removeFile(i))),i.on("statuschange",function(e,t){"progress"===t?r.hide().width(0):"queued"===t&&(s.off("mouseenter mouseleave"),n.remove()),"error"===e||"invalid"===e?(a(i.statusText),C[i.id][1]=1):"interrupt"===e?a("interrupt"):"queued"===e?C[i.id][1]=0:"progress"===e&&(l.hide(),r.css("display","block")),s.removeClass("state-"+t).addClass("state-"+e)}),s.on("mouseenter",function(){n.stop().animate({height:30})}),s.on("mouseleave",function(){n.stop().animate({height:0})}),n.on("click","span",function(){var e;switch(u(this).index()){case 0:return void d.removeFile(i);case 1:i.rotation+=90;break;case 2:i.rotation-=90}y?(e="rotate("+i.rotation+"deg)",o.css({"-webkit-transform":e,"-mos-transform":e,"-o-transform":e,transform:e})):o.css("filter","progid:DXImageTransform.Microsoft.BasicImage(rotation="+~~(i.rotation/90%4+4)%4+")")}),s.insertBefore(p)}function i(){var e,i=0,a=0,t=h.children();u.each(C,function(e,t){a+=t[0],i+=t[0]*t[1]}),e=a?i/a:0,t.eq(0).text(Math.round(100*e)+"%"),t.eq(1).css("width",Math.round(100*e)+"%"),s()}function a(e){if(e!==w){var t=d.getStats();switch(c.removeClass("state-"+w),c.addClass("state-"+e),e){case"pedding":r.addClass("element-invisible"),o.addClass("element-invisible"),g.removeClass("element-invisible"),h.hide(),l.hide(),d.refresh();break;case"ready":g.addClass("element-invisible"),r.removeClass("element-invisible"),o.removeClass("element-invisible"),h.hide(),l.show(),c.text(lang.uploadStart),d.refresh();break;case"uploading":h.show(),l.hide(),c.text(lang.uploadPause);break;case"paused":h.show(),l.hide(),c.text(lang.uploadContinue);break;case"confirm":if(h.show(),l.hide(),c.text(lang.uploadStart),(t=d.getStats()).successNum&&!t.uploadFailNum)return void a("finish");break;case"finish":h.hide(),l.show(),t.uploadFailNum?c.text(lang.uploadRetry):c.text(lang.uploadStart)}w=e,s()}n.getQueueCount()?c.removeClass("disabled"):c.addClass("disabled")}function s(){var e,t="";"ready"===w?t=lang.updateStatusReady.replace("_",m).replace("_KB",WebUploader.formatSize(f)):"confirm"===w?(e=d.getStats()).uploadFailNum&&(t=lang.updateStatusConfirm.replace("_",e.successNum).replace("_",e.successNum)):(e=d.getStats(),t=lang.updateStatusFinish.replace("_",m).replace("_KB",WebUploader.formatSize(f)).replace("_",e.successNum),e.uploadFailNum&&(t+=lang.updateStatusError.replace("_",e.uploadFailNum))),l.html(t)}var d,n=this,u=jQuery,e=n.$wrap,r=e.find(".filelist"),o=e.find(".statusBar"),l=o.find(".info"),c=e.find(".uploadBtn"),p=(e.find(".filePickerBtn"),e.find(".filePickerBlock")),g=e.find(".placeholder"),h=o.find(".progress").hide(),m=0,f=0,e=window.devicePixelRatio||1,v=113*e,b=113*e,w="",C={},y=e="transition"in(e=document.createElement("p").style)||"WebkitTransition"in e||"MozTransition"in e||"msTransition"in e||"OTransition"in e,x=editor.getActionUrl(editor.getOpt("imageActionName")),I=(editor.getOpt("imageAllowFiles")||[]).join("").replace(/\./g,",").replace(/^[,]/,""),$=editor.getOpt("imageMaxSize"),e=editor.getOpt("imageCompressBorder");WebUploader.Uploader.support()?editor.getOpt("imageActionName")?(e={pick:{id:"#filePickerReady",label:lang.uploadSelectFile},accept:{title:"Images",extensions:I,mimeTypes:"image/*"},swf:"../../third-party/webuploader/Uploader.swf",server:x,fileVal:editor.getOpt("imageFieldName"),duplicate:!0,fileSingleSizeLimit:$,threads:1,headers:editor.getOpt("serverHeaders")||{},compress:!!editor.getOpt("imageCompressEnable")&&{enable:editor.getOpt("imageCompressEnable"),maxWidthOrHeight:e,maxSize:$}},editor.getOpt("uploadServiceEnable")&&(e.customUpload=function(t,i){editor.getOpt("uploadServiceUpload")("image",t,{success:function(e){i.onSuccess(t,{_raw:JSON.stringify(e)})},error:function(e){i.onError(t,e)},progress:function(e){i.onProgress(t,e)}},{from:"image"})}),(d=n.uploader=WebUploader.create(e)).addButton({id:"#filePickerBlock"}),d.addButton({id:"#filePickerBtn",label:lang.uploadAddFile}),a("pedding"),d.on("fileQueued",function(e){m++,f+=e.size,1===m&&(g.addClass("element-invisible"),o.show()),t(e)}),d.on("fileDequeued",function(e){var t;e.ext&&-1!=I.indexOf(e.ext.toLowerCase())&&e.size<=$&&(m--,f-=e.size),t=u("#"+(e=e).id),delete C[e.id],i(),t.off().find(".file-panel").off().end().remove(),i()}),d.on("filesQueued",function(e){d.isInProgress()||"pedding"!=w&&"finish"!=w&&"confirm"!=w&&"ready"!=w||a("ready"),i()}),d.on("all",function(e,t){switch(e){case"uploadFinished":a("confirm");break;case"startUpload":var i=utils.serializeParam(editor.queryCommandValue("serverparam"))||"",i=utils.formatUrl(x+(-1==x.indexOf("?")?"?":"&")+"encode=utf-8&"+i);d.option("server",i),a("uploading");break;case"stopUpload":a("paused")}}),d.on("uploadBeforeSend",function(e,t,i){-1!=x.toLowerCase().indexOf("jsp")&&(i["X-Requested-With"]="XMLHttpRequest")}),d.on("uploadProgress",function(e,t){u("#"+e.id).find(".progress span").css("width",100*t+"%"),C[e.id][1]=t,i()}),d.on("uploadSuccess",function(t,e){t=u("#"+t.id);try{var i=e._raw||e,a=utils.str2json(i);"SUCCESS"==(a=editor.options.serverResponsePrepare(a)).state?(n.imageList.push(a),t.append('<span class="success"></span>'),editor.fireEvent("uploadsuccess",{res:a,type:"image"})):t.find(".error").text(a.state).show()}catch(e){t.find(".error").text(lang.errorServerUpload).show()}}),d.on("uploadError",function(e,t){}),d.on("error",function(e,t,i){"F_EXCEED_SIZE"===e?editor.getOpt("tipError")(lang.errorExceedSize+" "+(t/1024/1024).toFixed(1)+"MB"):console.log("error",e,t,i)}),d.on("uploadComplete",function(e,t){}),c.on("click",function(){return!u(this).hasClass("disabled")&&void("ready"===w||"paused"===w?d.upload():"uploading"===w&&d.stop())}),c.addClass("state-"+w),i()):u("#filePickerReady").after(u("<div>").html(lang.errorLoadConfig)).hide():u("#filePickerReady").after(u("<div>").html(lang.errorNotSupport)).hide()},getQueueCount:function(){for(var e,t=0,i=this.uploader.getFiles(),a=0;e=i[a++];)"queued"!=(e=e.getStatus())&&"uploading"!=e&&"progress"!=e||t++;return t},destroy:function(){this.$wrap.remove()},getInsertList:function(){for(var e,t=[],i=getAlign(),a=editor.getOpt("imageUrlPrefix"),s=0;s<this.imageList.length;s++)e=this.imageList[s],t.push({src:a+e.url,_src:a+e.url,alt:e.original,floatStyle:i});return t}},OnlineImage.prototype={init:function(){this.reset(),this.initEvents()},initContainer:function(){this.container.innerHTML="",this.list=document.createElement("ul"),this.clearFloat=document.createElement("li"),domUtils.addClass(this.list,"list"),domUtils.addClass(this.clearFloat,"clearFloat"),this.list.appendChild(this.clearFloat),this.container.appendChild(this.list)},initEvents:function(){var t=this;domUtils.on($G("imageList"),"scroll",function(e){this.scrollHeight-(this.offsetHeight+this.scrollTop)<10&&t.getImageData()}),domUtils.on(this.container,"click",function(e){e=(e.target||e.srcElement).parentNode;"li"==e.tagName.toLowerCase()&&(domUtils.hasClass(e,"selected")?domUtils.removeClasses(e,"selected"):domUtils.addClass(e,"selected"))})},initData:function(){this.state=0,this.listSize=editor.getOpt("imageManagerListSize"),this.listIndex=0,this.listEnd=!1,this.getImageData()},reset:function(){this.initContainer(),this.initData()},getImageData:function(){var _this=this,url,isJsonp;_this.listEnd||this.isLoadingData||(this.isLoadingData=!0,url=editor.getActionUrl(editor.getOpt("imageManagerActionName")),isJsonp=utils.isCrossDomainUrl(url),ajax.request(url,{timeout:1e5,dataType:isJsonp?"jsonp":"",headers:editor.options.serverHeaders||{},data:utils.extend({start:this.listIndex,size:this.listSize},editor.queryCommandValue("serverparam")),method:"get",onsuccess:function(r){try{var json=isJsonp?r:eval("("+r.responseText+")"),json=editor.options.serverResponsePrepare(json);"SUCCESS"===json.state&&(_this.pushData(json.list),_this.listIndex=parseInt(json.start)+parseInt(json.list.length),_this.listIndex>=json.total&&(_this.listEnd=!0),_this.isLoadingData=!1)}catch(e){var list;-1!=r.responseText.indexOf("ue_separate_ue")&&(list=r.responseText.split(r.responseText),_this.pushData(list),_this.listIndex=parseInt(list.length),_this.listEnd=!0,_this.isLoadingData=!1)}},onerror:function(){_this.isLoadingData=!1}}))},pushData:function(e){for(var t,i,a,s=this,n=editor.getOpt("imageManagerUrlPrefix"),r=0;r<e.length;r++)e[r]&&e[r].url&&(t=document.createElement("li"),i=document.createElement("img"),a=document.createElement("span"),domUtils.on(i,"load",(e=>function(){s.scale(e,e.parentNode.offsetWidth,e.parentNode.offsetHeight)})(i)),i.width=113,i.setAttribute("src",n+e[r].url+(-1==e[r].url.indexOf("?")?"?noCache=":"&noCache=")+(+new Date).toString(36)),i.setAttribute("_src",n+e[r].url),domUtils.addClass(a,"icon"),t.appendChild(i),t.appendChild(a),this.list.insertBefore(t,this.clearFloat))},scale:function(e,t,i,a){var s=e.width,n=e.height;"justify"==a?n<=s?(e.width=t,e.height=i*n/s,e.style.marginLeft="-"+parseInt((e.width-t)/2)+"px"):(e.width=t*s/n,e.height=i,e.style.marginTop="-"+parseInt((e.height-i)/2)+"px"):n<=s?(e.width=t*s/n,e.height=i,e.style.marginLeft="-"+parseInt((e.width-t)/2)+"px"):(e.width=t,e.height=i*n/s,e.style.marginTop="-"+parseInt((e.height-i)/2)+"px")},getInsertList:function(){for(var e,t=this.list.children,i=[],a=getAlign(),s=0;s<t.length;s++)domUtils.hasClass(t[s],"selected")&&(e=t[s].firstChild.getAttribute("_src"),i.push({src:e,_src:e,alt:e.substr(e.lastIndexOf("/")+1),floatStyle:a}));return i}}}();