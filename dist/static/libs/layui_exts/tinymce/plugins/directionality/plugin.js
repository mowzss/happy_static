(()=>{var e=tinymce.util.Tools.resolve("tinymce.PluginManager");let r=(e,t,r)=>!!r(e,t.prototype)||(null==(r=e.constructor)?void 0:r.name)===t.name;var o,t,n,i=t=>e=>typeof e===t;let l=e=>{return t=typeof(e=e),(null===e?"null":"object"==t&&Array.isArray(e)?"array":"object"==t&&r(e,String,(e,t)=>t.isPrototypeOf(e))?"string":t)===o;var t},a=i("boolean"),s=e=>null==e,u=e=>!s(e),d=i("function"),m=i("number"),c=(t,r)=>e=>t(r(e)),h=(t=!(o="string"),()=>t);class g{constructor(e,t){this.tag=e,this.value=t}static some(e){return new g(!0,e)}static none(){return g.singletonNone}fold(e,t){return this.tag?t(this.value):e()}isSome(){return this.tag}isNone(){return!this.tag}map(e){return this.tag?g.some(e(this.value)):g.none()}bind(e){return this.tag?e(this.value):g.none()}exists(e){return this.tag&&e(this.value)}forall(e){return!this.tag||e(this.value)}filter(e){return!this.tag||e(this.value)?this:g.none()}getOr(e){return this.tag?this.value:e}or(e){return this.tag?this:e}getOrThunk(e){return this.tag?this.value:e()}orThunk(e){return this.tag?this:e()}getOrDie(e){if(this.tag)return this.value;throw new Error(null!=e?e:"Called getOrDie on None")}static from(e){return u(e)?g.some(e):g.none()}getOrNull(){return this.tag?this.value:null}getOrUndefined(){return this.value}each(e){this.tag&&e(this.value)}toArray(){return this.tag?[this.value]:[]}toString(){return this.tag?`some(${this.value})`:"none()"}}g.singletonNone=new g(!1);let f=(t,r)=>{var o=t.length,n=new Array(o);for(let e=0;e<o;e++){var i=t[e];n[e]=r(i,e)}return n},v=(r,o)=>{for(let e=0,t=r.length;e<t;e++)o(r[e],e)},y=(r,o)=>{var n=[];for(let e=0,t=r.length;e<t;e++){var i=r[e];o(i,e)&&n.push(i)}return n},p=1,w=e=>{if(null==e)throw new Error("Node cannot be null or undefined");return{dom:e}},b={fromHtml:(e,t)=>{var r,t=(t||document).createElement("div");if(t.innerHTML=e,!t.hasChildNodes()||1<t.childNodes.length)throw r="HTML does not have a single root node",console.error(r,e),new Error(r);return w(t.childNodes[0])},fromTag:(e,t)=>{t=(t||document).createElement(e);return w(t)},fromText:(e,t)=>{t=(t||document).createTextNode(e);return w(t)},fromDom:w,fromPoint:(e,t,r)=>g.from(e.dom.elementFromPoint(t,r)).map(w)},N=(e,t)=>{e=e.dom;if(e.nodeType!==p)return!1;if(void 0!==e.matches)return e.matches(t);if(void 0!==e.msMatchesSelector)return e.msMatchesSelector(t);if(void 0!==e.webkitMatchesSelector)return e.webkitMatchesSelector(t);if(void 0!==e.mozMatchesSelector)return e.mozMatchesSelector(t);throw new Error("Browser lacks native selectors")},D=("undefined"==typeof window&&Function("return this;")(),(i=t=>e=>e.dom.nodeType===t)(p)),S=i(3),T=i(11),E=e=>g.from(e.dom.parentNode).map(b.fromDom),A=e=>f(e.dom.childNodes,b.fromDom),C=(e,t,r)=>{if(!(l(r)||a(r)||m(r)))throw console.error("Invalid call to Attribute.set. Key ",t,":: Value ",r,":: Element ",e),new Error("Attribute value was not simple");e.setAttribute(t,r+"")},M=(e,t,r)=>{C(e.dom,t,r)},L=(e,t)=>{e.dom.removeAttribute(t)},O=e=>T(e)&&u(e.dom.host),k=e=>b.fromDom(e.dom.getRootNode()),V=e=>{e=k(e);return O(e)?g.some(e):g.none()},H=e=>b.fromDom(e.dom.host),P=e=>{let t=S(e)?e.dom.parentNode:e.dom;if(null==t||null===t.ownerDocument)return!1;let r=t.ownerDocument;return V(b.fromDom(t)).fold(()=>r.body.contains(t),c(P,H))},j=(e,t,r)=>{let o=e.dom;for(var n=d(r)?r:h;o.parentNode;){o=o.parentNode;var i=b.fromDom(o);if(t(i))return g.some(i);if(n(i))break}return g.none()},z=(e,t,r)=>j(e,e=>N(e,t),r),F=e=>void 0!==e.style&&d(e.style.getPropertyValue),I=(e,t)=>{var r=e.dom,o=window.getComputedStyle(r).getPropertyValue(t);return""!==o||P(e)?o:K(r,t)},K=(e,t)=>F(e)?e.style.getPropertyValue(t):"",R=e=>"rtl"===I(e,"direction")?"rtl":"ltr",U=(e,t)=>y(A(e),t),$=(e,t)=>U(e,e=>N(e,t)),q=e=>E(e).filter(D),G=(e,t)=>(t?z(e,"ol,ul"):g.some(e)).getOr(e),J=(n="li",e=>D(e)&&e.dom.nodeName.toLowerCase()===n),Q=(o,e,n)=>{v(e,e=>{e=b.fromDom(e);let t=J(e),r=G(e,t);q(r).each(e=>{o.setStyle(r.dom,"direction",null),R(e)===n?L(r,"dir"):M(r,"dir",n),R(r)!==n&&o.setStyle(r.dom,"direction",n),t&&(e=$(r,"li[dir],li[style]"),v(e,e=>{L(e,"dir"),o.setStyle(e.dom,"direction",null)}))})})},x=(e,t)=>{e.selection.isEditable()&&(Q(e.dom,e.selection.getSelectedBlocks(),t),e.nodeChanged())},B=(r,o)=>t=>{let e=e=>{e=b.fromDom(e.element);t.setActive(R(e)===o),t.setEnabled(r.selection.isEditable())};return r.on("NodeChange",e),t.setEnabled(r.selection.isEditable()),()=>r.off("NodeChange",e)};e.add("directionality",e=>{var t,r;(t=e).addCommand("mceDirectionLTR",()=>{x(t,"ltr")}),t.addCommand("mceDirectionRTL",()=>{x(t,"rtl")}),(r=e).ui.registry.addToggleButton("ltr",{tooltip:"Left to right",icon:"ltr",onAction:()=>r.execCommand("mceDirectionLTR"),onSetup:B(r,"ltr")}),r.ui.registry.addToggleButton("rtl",{tooltip:"Right to left",icon:"rtl",onAction:()=>r.execCommand("mceDirectionRTL"),onSetup:B(r,"rtl")})})})();