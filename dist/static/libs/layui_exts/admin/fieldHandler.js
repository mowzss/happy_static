layui.define([],function(t){t("fieldHandler",{init:function(e){Array.isArray(e.cols)&&e.cols.length||(e.cols=[[]]),Array.isArray(e.cols[0])||(e.cols[0]=[]),e.cols[0].some(t=>t&&"checkbox"===t.type)||e.cols[0].unshift({type:"checkbox",fixed:"left"}),e.cols[0].some(t=>t&&"right"===t.fixed&&"操作"===t.title&&!0===e.rightEdit)||e.cols[0].push({title:"操作",toolbar:e.elem+"Tool",fixed:"right",align:"left",maxWidth:320,minWidth:120}),e.cols[0].forEach(function(t){if(t){var c=t;switch(c.templet){case"link":c.templet=function(t){return`<a href="${t[c.field]}" target="_blank" style="color: blue;">${t[c.field]}</a>`};break;case"switch":if(c.switch&&"object"==typeof c.switch){var e=c.switch.name||"正常|隐藏",r=c.switch.value||"1|0";let[i,l]=e.split("|"),[a,t]=r.split("|");a=String(a).trim(),t=String(t).trim(),c.templet=function(t){var t=String(t[c.field]).trim(),e=t===a;return`<input type="checkbox" 
                               name="${c.field}" 
                               lay-filter="form-switch-edit"
                               value="${t}" 
                               lay-skin="switch" 
                               lay-text="${i}|${l}" 
                               ${e?"checked":""}>`}}else c.templet=function(t){return`<input type="checkbox" name="status" value="${t[c.field]}" lay-filter="form-switch-edit" lay-skin="switch" lay-text="正常|隐藏" ${1===t[c.field]?"checked":""}>`};c.width||(c.width=100);break;case"icon":c.width||(c.width=80),c.templet=function(t){return`<em class="${t[c.field]}"></em>`};break;case"image":c.templet=function(t){var t=t[c.field];return(t=t&&(0<(t=t.split(",").filter(t=>""!==t.trim())).length?t[0].trim():""))?`<img data-image="hover" src="${t}" alt="Image" style="max-width: 80px; max-height: 100%;">`:""},c.width||(c.width=100);break;default:c?.templet?.startsWith("#")||(c.templet="")}"list"!==t.field||t.width||(t.width=120),"title"!==t.field||t.width||(t.width=280),"title"!==t.field||t.align||(t.align="left"),"icon"!==t.field||t.width||(t.width=50),"status"!==t.field||t.width||(t.width=90),t.align||(t.align="center")}})}})});