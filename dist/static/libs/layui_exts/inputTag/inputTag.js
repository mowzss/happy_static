layui.define(["jquery"],function(e){let h=layui.jquery;document.getElementById("inputTagtyle")||((a=document.createElement("style")).id="inputTagtyle",a.textContent=`
      .layui-input-tag {
        position: relative;
        height: auto;
        min-height: 38px;
        max-height: 38px;
        border: 1px solid #e6e6e6;
        border-radius: 2px;
        padding: 5px 30px 5px 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        background: #fff;
        cursor: text;
        overflow: hidden;
        box-sizing: border-box;
        transition: none;
        /* 【新增】定义默认标签颜色变量 */
        --tag-bg-color: #16B777+;
      }
      .layui-input-tag.multiline {
        max-height: 76px !important;
      }
      .layui-input-tag.expanded {
        max-height: 9999px !important;
      }
      .layui-input-tag .tag-item {
        height: 28px;
        line-height: 28px;
        padding: 0 10px;
        /* 【改动】使用 CSS 变量替代硬编码颜色 */
        background: var(--tag-bg-color);
        color: #fff;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        white-space: nowrap;
      }
      .layui-input-tag .tag-item .del {
        margin-left: 8px;
        color: #fff;
        opacity: 0.8;
        cursor: pointer;
        font-size: 16px;
      }
      .layui-input-tag input {
        border: none; outline: none;
        flex: 1; min-width: 100px;
        height: 28px; line-height: 28px;
        padding: 0; font-size: 13px;
      }
      .tag-expand-btn, .tag-clear-btn {
        position: absolute;
        width: 24px; height: 24px;
        line-height: 24px; text-align: center;
        z-index: 10;
        cursor: pointer;
      }
      .tag-clear-btn {
        right: 6px; top: 6px;
        font-size: 16px; color: #999;
        display: none;
      }
      .tag-clear-btn:hover { color: #ff5722; }
      .tag-expand-btn {
        right: 6px; bottom: 6px;
        background: #f5f5f5;
        border-radius: 3px;
        font-size: 14px;
        display: none;
      }
    `,document.head.appendChild(a));var a={render:function(e){let a=h(e.elem);var t=e.width||"100%",i=!1!==e.enterAdd;let l=!1!==e.splitByComma;var n=e.tagColor||"#16B777";let o=e.onDelete||function(){},r=e.onClear||function(){},p=[],u=(p=e.value&&Array.isArray(e.value)?JSON.parse(JSON.stringify(e.value)):(a.val()||e.value||"").split(",").filter(Boolean).map(e=>({label:e,value:e})),h("<div>",{class:"layui-input-tag",css:{width:t,"--tag-bg-color":n}})),s=h("<input>",{type:"text",readonly:!i||void 0,placeholder:i?l?"输入后按回车添加标签，多个用逗号分隔":"输入后按回车添加标签":""}),d=h('<div class="tag-clear-btn"><i class="layui-icon layui-icon-clear"></i></div>'),c=h('<div class="tag-expand-btn"><i class="layui-icon layui-icon-more"></i></div>');function g(){setTimeout(()=>{u.removeClass("multiline"),40<u[0].scrollHeight?(u.addClass("multiline"),c.show()):c.hide(),d.toggle(0<p.length)},20)}function f(){a.val(p.map(e=>e.value).join(",")).trigger("change")}function x(a){var e;if((a=(a||"").trim())&&!p.some(e=>e.value===a))return e={label:a,value:a},p.push(e),h(`<span class="tag-item" data-value="${e.value}">${e.label}<i class="del">×</i></span>`).insertBefore(s),1}return u.append(s,d,c),a.after(u).hide(),p.forEach(e=>{h(`<span class="tag-item" data-value="${e.value}">${e.label}<i class="del">×</i></span>`).insertBefore(s)}),c.on("click",e=>{e.stopPropagation(),u.toggleClass("expanded"),c.html(u.hasClass("expanded")?'<i class="layui-icon layui-icon-up"></i>':'<i class="layui-icon layui-icon-more"></i> ')}),d.on("click",e=>{e.stopPropagation(),p=[],u.find(".tag-item").remove(),f(),g(),r()}),i&&s.on("keydown",t=>{if(13===t.keyCode){t.preventDefault();t=s.val();if(t&&t.trim()){let e,a=(e=l?t.split(/[,，]/).map(e=>e.trim()).filter(Boolean):[t.trim()],!1);e.forEach(e=>{x(e)&&(a=!0)}),a&&(s.val(""),f(),g())}}}),u.on("click",".del",function(e){e.stopPropagation();e=h(this).closest(".tag-item");let a=e.attr("data-value");var t=p.find(e=>e.value===a),i=p.findIndex(e=>e.value===a);-1<i&&(p.splice(i,1),e.remove(),f(),g(),o(t))}),u.on("click",()=>s.focus()),f(),g(),{addTag(e){if(e){let a="string"==typeof e?{label:e,value:e}:{label:e.label||"",value:e.value||""};x(a.value)&&(a.label&&a.label!==a.value&&(u.find(".tag-item").last().contents().first().replaceWith(document.createTextNode(a.label)),e=p.find(e=>e.value===a.value))&&(e.label=a.label),f(),g())}},getValue:()=>[...p],clear(){p=[],u.find(".tag-item").remove(),f(),g()}}}};e("inputTag",a)});