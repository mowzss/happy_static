layui.define([],function(t){t("fieldHandler",{init:function(t){Array.isArray(t.cols)&&t.cols.length||(t.cols=[[]]),Array.isArray(t.cols[0])||(t.cols[0]=[]),t.cols[0].some(t=>t&&"checkbox"===t.type)||t.cols[0].unshift({type:"checkbox",fixed:"left"}),t.cols[0].some(t=>t&&"right"===t.fixed&&"操作"===t.title)||t.cols[0].push({title:"操作",toolbar:t.elem+"-tool",fixed:"right",align:"left",width:160}),t.cols[0].forEach(function(t){if(t){var n=t;switch(n.templet){case"link":n.templet=function(t){return`<a href="${t[n.field]}" target="_blank" style="color: blue;">${t[n.field]}</a>`};break;case"switch":if(n.switch&&"object"==typeof n.switch){var e=n.switch.name||"正常|隐藏",s=n.switch.value||"1|0";let[i,l]=e.split("|"),[c,t]=s.split("|");c=String(c).trim(),t=String(t).trim(),n.templet=function(t){var t=String(t[n.field]).trim(),e=t===c;return`<input type="checkbox" 
                                       name="status" 
                                       value="${t}" 
                                       lay-skin="switch" 
                                       lay-text="${i}|${l}" 
                                       ${e?"checked":""}>`}}else n.templet=function(t){return`<input type="checkbox" name="status" value="${t[n.field]}" lay-skin="switch" lay-text="正常|隐藏" ${1===t[n.field]?"checked":""}>`};break;case"icon":n.templet=function(t){return`<em class="${t[n.field]}"></em>`};break;default:n?.templet?.startsWith("#")||(n.templet="")}"list"!==t.field||t.width||(t.width=120),t.align||(t.align="center"),"title"!==t.field||t.width||(t.width=280),"icon"!==t.icon||t.width||(t.width=50),"switch"!==t.icon||t.width||(t.width=70)}})}})});