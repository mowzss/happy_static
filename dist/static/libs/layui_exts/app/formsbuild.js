layui.define(["form","layer","jquery"],function(t){var r=layui.form,i=layui.layer,o=layui.jquery,a={render:function(t){var e=o((t=t||{}).formSelector||"#form"),i=t.triggers||[];return this.form(t),this.icon(),o("[data-file]").each(function(){var a=this;layui.use(["uploads"],function(){var t=layui.uploads,e="true"===a.dataset.multiple,i=a.dataset.file;new t({elem:"#"+o(a).attr("id"),type:i,multiple:e,sort:e})})}),this.inputDate(),this.color(),this.triggers(i,e),this.editor(),a},form:function(t){r.render(),r.on("submit("+(t.layFilter||"")+")",function(t){var e=t.field,t=t.form.action;return o.ajax({type:"POST",url:t,data:e,dataType:"json",success:function(t){0===t.code?i.msg(t.msg,function(){i.closeAll(),void 0!==layui.laytable&&layui.laytable.reload()}):i.alert(t.msg)}}),!1})},inputDate:function(){o("[data-input-date]").each(function(){var t=this,e=this.dataset.inputDate||"date";layui.use(["laydate"],function(){layui.laydate.render({elem:t,type:e})})})},color:function(){o("[data-input-color]").each(function(){let t=this.dataset.inputColor,e=o("[name="+t+"]"),i=e.val()||"#1c97f5";layui.use(["colorpicker"],function(){layui.colorpicker.render({elem:this,color:i,done:function(t){e.val(t)}})})})},icon:function(){o("[data-icon]").on("click",function(){var t=this.dataset.icon;i.open({type:2,content:t,title:"图标选择",area:["800px","80%"]})}),o("[data-input-icon]").on("change",function(){o(this).next().find("i").get(0).className=this.value}).each(function(){o(this).trigger("change")})},editor:function(){o("[data-input-editor]").each(function(){var t=this.dataset.type,e=(this.dataset.inputEditor,o(this).attr("id"));switch(t){case"tinymce":layui.use(["tiny"],function(){layui.tiny.render({selector:"#"+e})});break;case"wangeditor":layui.use(["wangEdit"],function(){layui.wangEdit.render({elem:"#"+e})});break;case"ueditor":layui.use(["ueditor"],function(){layui.ueditor.render("#"+e)})}})},triggers:function(t,e){function a(t){return t.replace(/\[|\]/g,function(t){return"\\"+t})}function n(t,i){if(Array.isArray(t.values)){let e=new Set;t.values.forEach(function(t){Array.isArray(t.field)&&t.field.forEach(function(t){e.add(t)})}),e.forEach(function(t){t=a(t);o("#item-"+t).hide()});t.values.forEach(function(t){if(i.value===t.value)return Array.isArray(t.field)&&t.field.forEach(function(t){t=a(t);o("#item-"+t).show()}),!1})}}function i(i){Array.isArray(t)&&0!==t.length&&o.each(t,function(t,e){i.elem.getAttribute("name")===e.name&&n(e,i)})}Array.isArray(t)&&0<t.length&&(e.find("input").on("change",function(){i({elem:this,value:o(this).val()})}),r.on("radio",function(t){i(t)}),r.on("select",function(t){i(t)}),Array.isArray(t))&&0!==t.length&&o.each(t,function(t,e){var i=a(e.name),i=o('[name="'+i+'"]');n(e,{elem:null,value:(e=i).is(":radio")?e.filter(":checked").val():e.is(":checkbox")?e.is(":checked")?e.val():null:(e.is("select"),e.val())})})}};t("formsbuild",a)});