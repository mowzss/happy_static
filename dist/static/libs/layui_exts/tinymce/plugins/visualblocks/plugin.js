(()=>{var t,e=tinymce.util.Tools.resolve("tinymce.PluginManager");let s=(e,t)=>{e.dispatch("VisualBlocks",{state:t})},d=(e,t,o)=>{e.dom.toggleClass(e.getBody(),"mce-visualblocks"),o.set(!o.get()),s(e,o.get())},v=(t="visualblocks_default_state",e=>e.options.get(t)),k=(o,s)=>t=>{t.setActive(s.get());let e=e=>t.setActive(e.state);return o.on("VisualBlocks",e),()=>o.off("VisualBlocks",e)};e.add("visualblocks",(e,t)=>{(0,e.options.register)("visualblocks_default_state",{processor:"boolean",default:!1});var o,s,l,a,i,c,n,u,r,g=(e=>{let t=e;return{get:()=>t,set:e=>{t=e}}})(!1);s=t,l=g,(o=e).addCommand("mceVisualBlocks",()=>{d(o,s,l)}),i=g,c=()=>a.execCommand("mceVisualBlocks"),(a=e).ui.registry.addToggleButton("visualblocks",{icon:"visualblocks",tooltip:"Show blocks",onAction:c,onSetup:k(a,i),context:"any"}),a.ui.registry.addToggleMenuItem("visualblocks",{text:"Show blocks",icon:"visualblocks",onAction:c,onSetup:k(a,i),context:"any"}),u=t,r=g,(n=e).on("PreviewFormats AfterPreviewFormats",e=>{r.get()&&n.dom.toggleClass(n.getBody(),"mce-visualblocks","afterpreviewformats"===e.type)}),n.on("init",()=>{v(n)&&d(n,u,r)})})})();