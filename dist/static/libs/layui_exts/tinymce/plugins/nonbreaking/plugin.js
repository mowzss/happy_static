(()=>{var e=tinymce.util.Tools.resolve("tinymce.PluginManager"),n=n=>e=>typeof e===n;let t=n("boolean"),i=n("number"),r=(n=n=>e=>e.options.get(n))("nonbreaking_force_tab"),o=n("nonbreaking_wrap"),s=(n,a)=>{let o="";for(let e=0;e<a;e++)o+=n;return o},l=e=>!!e.plugins.visualchars&&e.plugins.visualchars.isEnabled(),b=(e,n)=>{let a=o(e)||e.plugins.visualchars?`<span class="${l(e)?"mce-nbsp-wrap mce-nbsp":"mce-nbsp-wrap"}" contenteditable="false">${s("&nbsp;",n)}</span>`:s("&nbsp;",n);e.undoManager.transact(()=>e.insertContent(a))};var u=tinymce.util.Tools.resolve("tinymce.util.VK");let c=a=>e=>{let n=()=>{e.setEnabled(a.selection.isEditable())};return a.on("NodeChange",n),n(),()=>{a.off("NodeChange",n)}};e.add("nonbreaking",e=>{var n,a,o;(e=>{e=e.options.register;e("nonbreaking_force_tab",{processor:e=>t(e)?{value:e?3:0,valid:!0}:i(e)?{value:e,valid:!0}:{valid:!1,message:"Must be a boolean or number."},default:!1}),e("nonbreaking_wrap",{processor:"boolean",default:!0})})(e),(n=e).addCommand("mceNonBreaking",()=>{b(n,1)}),o=()=>a.execCommand("mceNonBreaking"),(a=e).ui.registry.addButton("nonbreaking",{icon:"non-breaking",tooltip:"Nonbreaking space",onAction:o,onSetup:c(a)}),a.ui.registry.addMenuItem("nonbreaking",{icon:"non-breaking",text:"Nonbreaking space",onAction:o,onSetup:c(a)}),(n=>{let a=r(n);0<a&&n.on("keydown",e=>{e.keyCode!==u.TAB||e.isDefaultPrevented()||e.shiftKey||(e.preventDefault(),e.stopImmediatePropagation(),b(n,a))})})(e)})})();