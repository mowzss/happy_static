(()=>{var e=tinymce.util.Tools.resolve("tinymce.PluginManager");let o=(e,t)=>e.dispatch("VisualChars",{state:t}),n=(e,t,r)=>!!r(e,t.prototype)||(null==(r=e.constructor)?void 0:r.name)===t.name;var t,r,a=r=>e=>{return t=typeof(e=e),(null===e?"null":"object"==t&&Array.isArray(e)?"array":"object"==t&&n(e,String,(e,t)=>t.isPrototypeOf(e))?"string":t)===r;var t},s=t=>e=>typeof e===t;let l=a("string"),i=a("object"),u=(t=null,e=>t===e),c=s("boolean"),d=s("number");class m{constructor(e,t){this.tag=e,this.value=t}static some(e){return new m(!0,e)}static none(){return m.singletonNone}fold(e,t){return this.tag?t(this.value):e()}isSome(){return this.tag}isNone(){return!this.tag}map(e){return this.tag?m.some(e(this.value)):m.none()}bind(e){return this.tag?e(this.value):m.none()}exists(e){return this.tag&&e(this.value)}forall(e){return!this.tag||e(this.value)}filter(e){return!this.tag||e(this.value)?this:m.none()}getOr(e){return this.tag?this.value:e}or(e){return this.tag?this:e}getOrThunk(e){return this.tag?this.value:e()}orThunk(e){return this.tag?this:e()}getOrDie(e){if(this.tag)return this.value;throw new Error(null!=e?e:"Called getOrDie on None")}static from(e){return null==e?m.none():m.some(e)}getOrNull(){return this.tag?this.value:null}getOrUndefined(){return this.value}each(e){this.tag&&e(this.value)}toArray(){return this.tag?[this.value]:[]}toString(){return this.tag?`some(${this.value})`:"none()"}}m.singletonNone=new m(!1);let h=(t,r)=>{var o=t.length,n=new Array(o);for(let e=0;e<o;e++){var a=t[e];n[e]=r(a,e)}return n},g=(r,o)=>{for(let e=0,t=r.length;e<t;e++)o(r[e],e)},v=(r,o)=>{var n=[];for(let e=0,t=r.length;e<t;e++){var a=r[e];o(a,e)&&n.push(a)}return n},P=Object.keys,f=(r,o)=>{var n=P(r);for(let e=0,t=n.length;e<t;e++){var a=n[e];o(r[a],a)}},H="undefined"!=typeof window?window:Function("return this;")(),_=(t,e)=>{let r=null!=e?e:H;for(let e=0;e<t.length&&null!=r;++e)r=r[t[e]];return r},p=(e,t)=>{e=e.split(".");return _(e,t)},F=(e,t)=>p(e,t),I=(e,t)=>{t=F(e,t);if(null==t)throw new Error(e+" not available on this browser");return t},$=Object.getPrototypeOf,K=e=>I("HTMLElement",e),R=e=>{var t=p("ownerDocument.defaultView",e);return i(e)&&(K(t).prototype.isPrototypeOf(e)||/^HTML\w*Element$/.test($(e).constructor.name))},w=e=>e.dom.nodeValue,y=e=>U(e)&&R(e.dom),U=(a=t=>e=>e.dom.nodeType===t)(1),q=a(3),z=(e,t,r)=>{if(!(l(r)||c(r)||d(r)))throw console.error("Invalid call to Attribute.set. Key ",t,":: Value ",r,":: Element ",e),new Error("Attribute value was not simple");e.setAttribute(t,r+"")},b=(e,t,r)=>{z(e.dom,t,r)},G=(e,t)=>{e=e.dom.getAttribute(t);return null===e?void 0:e},N=(e,t)=>{e.dom.removeAttribute(t)},T=(e,t)=>{e=G(e,t);return void 0===e||""===e?[]:e.split(" ")},J=(e,t,r)=>{r=T(e,t).concat([r]);return b(e,t,r.join(" ")),!0},Q=(e,t,r)=>{var o=v(T(e,t),e=>e!==r);return 0<o.length?b(e,t,o.join(" ")):N(e,t),!1},A=e=>void 0!==e.dom.classList,W=e=>T(e,"class"),X=(e,t)=>J(e,"class",t),Y=(e,t)=>Q(e,"class",t),Z=(e,t)=>{A(e)?e.dom.classList.add(t):X(e,t)},ee=e=>{0===(A(e)?e.dom.classList:W(e)).length&&N(e,"class")},te=(e,t)=>{A(e)?e.dom.classList.remove(t):Y(e,t),ee(e)},E=e=>{if(null==e)throw new Error("Node cannot be null or undefined");return{dom:e}},k={fromHtml:(e,t)=>{var r,t=(t||document).createElement("div");if(t.innerHTML=e,!t.hasChildNodes()||1<t.childNodes.length)throw r="HTML does not have a single root node",console.error(r,e),new Error(r);return E(t.childNodes[0])},fromTag:(e,t)=>{t=(t||document).createElement(e);return E(t)},fromText:(e,t)=>{t=(t||document).createTextNode(e);return E(t)},fromDom:E,fromPoint:(e,t,r)=>m.from(e.dom.elementFromPoint(t,r)).map(E)},C={" ":"nbsp","­":"shy"},re=(s=(e,t)=>{let r="";return f(e,(e,t)=>{r+=t}),new RegExp("["+r+"]",t?"g":"")})(C),oe=s(C,!0),ne=(e=>{let t="";return f(e,e=>{t&&(t+=","),t+="span.mce-"+e}),t})(C),O="mce-nbsp",L=e=>e.dom.contentEditable,ae=e=>'<span data-mce-bogus="1" class="mce-'+C[e]+'">'+e+"</span>",x=e=>"span"===e.nodeName.toLowerCase()&&e.classList.contains("mce-nbsp-wrap"),se=e=>{var t=w(e);return q(e)&&l(t)&&re.test(t)},le=e=>y(e)&&"false"===L(e),ie=(e,t)=>{if(y(e)&&!x(e.dom)){e=L(e);if("true"===e)return!0;if("false"===e)return!1}return t},D=(e,r,o)=>{let n=[];e=e.dom,e=h(e.childNodes,k.fromDom);return g(e,e=>{var t;n=(n=o&&(t=e,x(t.dom)||!le(t))&&r(e)?n.concat([e]):n).concat(D(e,r,ie(e,o)))}),n},ue=(e,t)=>{for(;e.parentNode;){if(e.parentNode===t)return t;e=e.parentNode}},ce=e=>e.replace(oe,ae),V=(n,e)=>{let a=n.dom;e=D(k.fromDom(e),se,n.dom.isEditable(e));g(e,e=>{var t=e.dom.parentNode;if(x(t))Z(k.fromDom(t),O);else{for(var r,t=ce(a.encode(null!=(t=w(e))?t:"")),o=a.create("div",{},t);r=o.lastChild;)a.insertAfter(r,e.dom);n.dom.remove(e.dom)}})},j=(t,e)=>{e=t.dom.select(ne,e);g(e,e=>{x(e)?te(k.fromDom(e),O):t.dom.remove(e,!0)})},B=e=>{var t=e.getBody(),r=e.selection.getBookmark(),o=void 0!==(o=ue(e.selection.getNode(),t))?o:t;j(e,o),V(e,o),e.selection.moveToBookmark(r)},S=(e,t)=>{o(e,t.get());var r=e.getBody();(!0===t.get()?V:j)(e,r)},de=(e,t)=>{t.set(!t.get());var r=e.selection.getBookmark();S(e,t),e.selection.moveToBookmark(r)},me=(r="visualchars_default_state",e=>e.options.get(r)),he=(t,r)=>{let o=null;return{cancel:()=>{u(o)||(clearTimeout(o),o=null)},throttle:(...e)=>{u(o)&&(o=setTimeout(()=>{o=null,t.apply(null,e)},r))}}},M=(r,o)=>t=>{t.setActive(o.get());let e=e=>t.setActive(e.state);return r.on("VisualChars",e),()=>r.off("VisualChars",e)};e.add("visualchars",e=>{(0,e.options.register)("visualchars_default_state",{processor:"boolean",default:!1});var t,r,o,n,a,s,l,i,u=(e=>{let t=e;return{get:()=>t,set:e=>{t=e}}})(me(e));return r=u,(t=e).addCommand("mceVisualChars",()=>{de(t,r)}),n=u,a=()=>o.execCommand("mceVisualChars"),(o=e).ui.registry.addToggleButton("visualchars",{tooltip:"Show invisible characters",icon:"visualchars",onAction:a,onSetup:M(o,n),context:"any"}),o.ui.registry.addToggleMenuItem("visualchars",{text:"Show invisible characters",icon:"visualchars",onAction:a,onSetup:M(o,n),context:"any"}),((t,r)=>{let o=he(()=>{B(t)},300);t.on("keydown",e=>{!0===r.get()&&(13===e.keyCode?B(t):o.throttle())}),t.on("remove",o.cancel)})(e,u),l=u,(s=e).on("init",()=>{S(s,l)}),i=u,{isEnabled:()=>i.get()}})})();