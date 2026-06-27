layui.define(["jquery"],function(e){let g=layui.jquery;document.getElementById("inputTagtyle")||((a=document.createElement("style")).id="inputTagtyle",a.textContent=`
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
        background: #16baaa;
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
    `,document.head.appendChild(a));var a={render:function(e){let a=g(e.elem);var i=e.width||"100%",t=!1!==e.enterAdd;let l=e.onDelete||function(){},n=e.onClear||function(){},o=[],p=(o=e.value&&Array.isArray(e.value)?JSON.parse(JSON.stringify(e.value)):(a.val()||e.value||"").split(",").filter(Boolean).map(e=>({label:e,value:e})),g("<div>",{class:"layui-input-tag",css:{width:i}})),r=g("<input>",{type:"text",readonly:!t||void 0,placeholder:t?"输入后按回车添加标签":""}),s=g('<div class="tag-clear-btn"><i class="layui-icon layui-icon-clear"></i></div>'),u=g('<div class="tag-expand-btn"><i class="layui-icon layui-icon-more"></i></div>');function d(){setTimeout(()=>{p.removeClass("multiline"),40<p[0].scrollHeight?(p.addClass("multiline"),u.show()):u.hide(),s.toggle(0<o.length)},20)}function c(){a.val(o.map(e=>e.value).join(",")).trigger("change")}return p.append(r,s,u),a.after(p).hide(),o.forEach(e=>{g(`<span class="tag-item" data-value="${e.value}">${e.label}<i class="del">×</i></span>`).insertBefore(r)}),u.on("click",e=>{e.stopPropagation(),p.toggleClass("expanded"),u.html(p.hasClass("expanded")?'<i class="layui-icon layui-icon-up"></i>':'<i class="layui-icon layui-icon-more"></i> ')}),s.on("click",e=>{e.stopPropagation(),o=[],p.find(".tag-item").remove(),c(),d(),n()}),t&&r.on("keydown",e=>{if(13===e.keyCode){e.preventDefault();let a=r.val().trim();a&&!o.some(e=>e.value===a)&&(e={label:a,value:a},o.push(e),g(`<span class="tag-item" data-value="${e.value}">${e.label}<i class="del">×</i></span>`).insertBefore(r),r.val(""),c(),d())}}),p.on("click",".del",function(e){e.stopPropagation();e=g(this).closest(".tag-item");let a=e.attr("data-value");var i=o.find(e=>e.value===a),t=o.findIndex(e=>e.value===a);-1<t&&(o.splice(t,1),e.remove(),c(),d(),l(i))}),p.on("click",()=>r.focus()),c(),d(),{addTag(e){if(e){let a="string"==typeof e?{label:e,value:e}:{label:e.label||"",value:e.value||""};a.label&&a.value&&!o.some(e=>e.value===a.value)&&(o.push(a),g(`<span class="tag-item" data-value="${a.value}">${a.label}<i class="del">×</i></span>`).insertBefore(r),c(),d())}},getValue:()=>[...o],clear(){o=[],p.find(".tag-item").remove(),c(),d()}}}};e("inputTag",a)});