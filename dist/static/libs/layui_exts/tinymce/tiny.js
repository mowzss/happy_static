layui.define(["jquery","tinymce","admin"],function(e){var s=layui.$,a=layui.tinymce,t={file_field:"file",selector:"",license_key:"gpl",height:600,branding:!1,promotion:!1,paste_data_images:!0,language:"zh_CN",plugins:"code kityformula-editor quickbars print preview searchreplace autolink fullscreen image link media codesample table charmap hr advlist lists wordcount imagetools indent2em",toolbar:"code image | kityformula-editor forecolor backcolor bold italic underline strikethrough | indent2em alignleft aligncenter alignright alignjustify outdent indent | link bullist numlist table codesample | formatselect fontselect fontsizeselect",menubar:"file edit insert format table",menu:{file:{title:"文件",items:"newdocument | print preview fullscreen | wordcount"},edit:{title:"编辑",items:"undo redo | cut copy paste pastetext selectall | searchreplace"},format:{title:"格式",items:"bold italic underline strikethrough superscript subscript | formats | forecolor backcolor | removeformat"},table:{title:"表格",items:"inserttable tableprops deletetable | cell row column"}},images_upload_url:"/index.php?s=/index/Upload/save",images_upload_base_path:"",setup:function(e){e.on("init",function(){e.save()}),e.on("change keyup blur",function(){e.save()})}};e("tiny",{render:function(e){var t=this.initConfig(e),e=this.get(e.selector);return e&&e.destroy(),a.init(t)},get:function(e){var t;return!!e&&(0===(t=s(e)).length?(console.warn("元素未找到：",e),!1):(t=t.first().attr("id"))?a.get(t)||!1:(console.warn("元素没有 ID 属性：",e),!1))},initConfig:function(e){var l=s.extend(!0,{},t,e);return l.images_upload_handler=function(r,n,o){return new Promise((t,i)=>{if(l.images_upload_url){var e=new FormData;if(e.append(l.file_field||"file",r.blob(),r.filename()),l.form_data&&"object"==typeof l.form_data)for(var a in l.form_data)e.append(a,l.form_data[a]);s.ajax({url:l.images_upload_url,dataType:"json",type:"POST",data:e,processData:!1,contentType:!1,success:function(e){try{e&&0===e.code&&e.data&&e.data.url?(n(e.data.url),t(e.data.url)):(o(e.msg||"上传失败，服务器响应异常"),i(e.msg||"上传失败，服务器响应异常"))}catch(e){o("解析服务器响应时出错："+e.message),i("解析服务器响应时出错："+e.message)}},error:function(e,t,a){e="网络错误："+e.status+" "+(e.responseText?JSON.parse(e.responseText).msg||"未知错误":a);o(e),i(e)}})}else o("上传接口未配置"),console.error("images_upload_url未配置"),i("上传接口未配置")})},l}})});