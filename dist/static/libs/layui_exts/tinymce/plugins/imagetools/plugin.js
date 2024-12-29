(()=>{function f(t){var n=t;return{get:function(){return n},set:function(t){n=t}}}function M(){}function t(){return c}var B=tinymce.util.Tools.resolve("tinymce.PluginManager"),s=tinymce.util.Tools.resolve("tinymce.util.Tools"),i=function(t){return function(){return t}},u=i(!1),a=i(!0),c={fold:function(t,n){return t()},is:u,isSome:u,isNone:a,getOr:r,getOrThunk:e,getOrDie:function(t){throw new Error(t||"error: getOrDie called on none.")},getOrNull:i(null),getOrUndefined:i(void 0),or:r,orThunk:e,map:t,each:M,bind:t,exists:u,forall:a,filter:t,equals:n,equals_:n,toArray:function(){return[]},toString:i("none()")};function n(t){return t.isNone()}function e(t){return t()}function r(t){return t}function l(e){function t(){return o}function n(t){return t(e)}var r=i(e),o={fold:function(t,n){return n(e)},is:function(t){return e===t},isSome:a,isNone:u,getOr:r,getOrThunk:r,getOrDie:r,getOrNull:r,getOrUndefined:r,or:t,orThunk:t,map:function(t){return l(t(e))},each:function(t){t(e)},bind:n,exists:n,forall:n,filter:function(t){return t(e)?o:c},toArray:function(){return[e]},toString:function(){return"some("+e+")"},equals:function(t){return t.is(e)},equals_:function(t,n){return t.fold(u,function(t){return n(e,t)})}};return o}var o,d={some:l,none:t,from:function(t){return null==t?c:l(t)}},N=function(t){return null==t},h=function(t){return!N(t)},D=(o="function",function(t){return typeof t===o});function m(t,n){return p(document.createElement("canvas"),t,n)}function F(t){var n=m(t.width,t.height);return g(n).drawImage(t,0,0),n}function g(t){return t.getContext("2d")}function p(t,n,e){return t.width=n,t.height=e,t}var v,y,w,b=window.Promise||(v=window,y=I.immediateFn||"function"==typeof v.setImmediate&&v.setImmediate||function(t){setTimeout(t,1)},w=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},I.prototype.catch=function(t){return this.then(null,t)},I.prototype.then=function(e,r){var o=this;return new I(function(t,n){_.call(o,new H(e,r,t,n))})},I.all=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];var a=Array.prototype.slice.call(1===t.length&&w(t[0])?t[0]:t);return new I(function(o,i){if(0===a.length)return o([]);var u=a.length;for(var t=0;t<a.length;t++)!function n(e,t){try{if(t&&("object"==typeof t||"function"==typeof t)){var r=t.then;if("function"==typeof r)return void r.call(t,function(t){n(e,t)},i)}a[e]=t,0==--u&&o(a)}catch(t){i(t)}}(t,a[t])})},I.resolve=function(n){return n&&"object"==typeof n&&n.constructor===I?n:new I(function(t){t(n)})},I.reject=function(e){return new I(function(t,n){n(e)})},I.race=function(o){return new I(function(t,n){for(var e=0,r=o;e<r.length;e++)r[e].then(t,n)})},I);function I(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],x(t,T(R,this),T(U,this))}function T(t,n){return function(){return t.apply(n,arguments)}}function _(e){var r=this;null===this._state?this._deferreds.push(e):y(function(){var t,n=r._state?e.onFulfilled:e.onRejected;if(null===n)(r._state?e.resolve:e.reject)(r._value);else{try{t=n(r._value)}catch(t){return void e.reject(t)}e.resolve(t)}})}function R(t){try{if(t===this)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if("function"==typeof n)return void x(T(n,t),T(R,this),T(U,this))}this._state=!0,this._value=t,A.call(this)}catch(t){U.call(this,t)}}function U(t){this._state=!1,this._value=t,A.call(this)}function A(){for(var t=0,n=this._deferreds;t<n.length;t++){var e=n[t];_.call(this,e)}this._deferreds=[]}function H(t,n,e,r){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof n?n:null,this.resolve=e,this.reject=r}function x(t,n,e){var r=!1;try{t(function(t){r||(r=!0,n(t))},function(t){r||(r=!0,e(t))})}catch(t){r||(r=!0,e(t))}}function q(t){var r,t=t.src;return 0===t.indexOf("data:")?L(t):(r=t,new b(function(t,e){var n=new XMLHttpRequest;n.open("GET",r,!0),n.responseType="blob",n.onload=function(){200===this.status&&t(this.response)},n.onerror=function(){var t,n=this;e(0===this.status?((t=new Error("No access to download image")).code=18,t.name="SecurityError",t):new Error("Error "+n.status+" downloading image"))},n.send()}))}function E(a){return new b(function(t,n){var e=URL.createObjectURL(a),r=new Image,o=function(){r.removeEventListener("load",i),r.removeEventListener("error",u)};function i(){o(),t(r)}function u(){o(),n("Unable to load data of type "+a.type+": "+e)}r.addEventListener("load",i),r.addEventListener("error",u),r.src=e,r.complete&&i()})}function L(e){return new b(function(t,n){(t=>{if(t=t.split(","),!(n=/data:([^;]+)/.exec(t[0])))return d.none();for(var n=n[1],t=t[1],e=atob(t),r=e.length,o=Math.ceil(r/1024),i=new Array(o),u=0;u<o;++u){for(var a=1024*u,c=Math.min(1024+a,r),f=new Array(c-a),s=a,l=0;s<c;++l,++s)f[l]=e[s].charCodeAt(0);i[u]=new Uint8Array(f)}return d.some(new Blob(i,{type:n}))})(e).fold(function(){n("uri is not base64: "+e)},t)})}function z(t,r,o){return r=r||"image/png",D(HTMLCanvasElement.prototype.toBlob)?new b(function(n,e){t.toBlob(function(t){t?n(t):e()},r,o)}):L(t.toDataURL(r,o))}function $(t){return E(t).then(function(t){URL.revokeObjectURL(t.src);var n=m((n=t).naturalWidth||n.width,(n=t).naturalHeight||n.height);return g(n).drawImage(t,0,0),n})}var G=E,J=q,K=function(t,n){for(var e=0,r=t.length;e<r;e++)n(t[e],e)},V=function(t,n,e){return K(t,function(t){e=n(e,t)}),e},W=function(t,n,e){for(var r=0,o=t.length;r<o;r++){var i=t[r];if(n(i,r))return d.some(i);if(e(i,r))break}return d.none()},j=function(t,n){return W(t,n,u)};function X(t,n,e){var r=n.type;function o(n,e){return t.then(function(t){return t.toDataURL(n||"image/png",e)})}return{getType:i(r),toBlob:function(){return b.resolve(n)},toDataURL:i(e),toBase64:function(){return e.split(",")[1]},toAdjustedBlob:function(n,e){return t.then(function(t){return z(t,n,e)})},toAdjustedDataURL:o,toAdjustedBase64:function(t,n){return o(t,n).then(function(t){return t.split(",")[1]})},toCanvas:function(){return t.then(F)}}}function Q(n){return e=n,new b(function(t){var n=new FileReader;n.onloadend=function(){t(n.result)},n.readAsDataURL(e)}).then(function(t){return X($(n),n,t)});var e}function Y(n,t){return z(n,t).then(function(t){return X(b.resolve(n),t,n.toDataURL())})}function Z(a,c){return a.toCanvas().then(function(t){var n=a.getType(),e=c,r=m(t.width,t.height),o=g(r),i=0,u=0;return 90!==(e=e<0?360+e:e)&&270!==e||p(r,r.height,r.width),90!==e&&180!==e||(i=r.width),270!==e&&180!==e||(u=r.height),o.translate(i,u),o.rotate(e*Math.PI/180),o.drawImage(t,0,0),Y(r,n)})}function tt(i,u){return i.toCanvas().then(function(t){var n=i.getType(),e=u,r=m(t.width,t.height),o=g(r);return"v"===e?(o.scale(1,-1),o.drawImage(t,0,-r.height)):(o.scale(-1,1),o.drawImage(t,-r.width,0)),Y(r,n)})}function k(t){if(null==t)throw new Error("Node cannot be null or undefined");return{dom:t}}var nt=tt,et=Z,rt=Object.keys,ot=function(t,n){for(var e=rt(t),r=0,o=e.length;r<o;r++){var i=e[r];n(t[i],i)}},it=function(n,r,o){return void 0===o&&(o=!1),new b(function(t){var e=new XMLHttpRequest;e.onreadystatechange=function(){4===e.readyState&&t({status:e.status,blob:e.response})},e.open("GET",n,!0),e.withCredentials=o,ot(r,function(t,n){e.setRequestHeader(n,t)}),e.responseType="blob",e.send()})},ut=function(r){return new b(function(t,n){var e=new FileReader;e.onload=function(){t(e.result)},e.onerror=function(t){n(t)},e.readAsText(r)})},at=function(t){try{return d.some(JSON.parse(t))}catch(t){return d.none()}},ct=[{code:404,message:"Could not find Image Proxy"},{code:403,message:"Rejected request"},{code:0,message:"Incorrect Image Proxy URL"}],ft=[{type:"not_found",message:"Failed to load image."},{type:"key_missing",message:"The request did not include an api key."},{type:"key_not_found",message:"The provided api key could not be found."},{type:"domain_not_trusted",message:"The api key is not valid for the request origins."}],st=function(t,n){n=V(n,function(t,n){return h(t)?t[n]:void 0},t);return d.from(n)},lt=function(t,n){return"application/json"===(null==n?void 0:n.type)&&(400===t||403===t||404===t||500===t)},dt=function(n){return"ImageProxy HTTP error: "+j(ct,function(t){return n===t.code}).fold(i("Unknown ImageProxy error"),function(t){return t.message})},mt=function(t){t=dt(t);return b.reject(t)},ht=function(n){return j(ft,function(t){return t.type===n}).fold(i("Unknown service error"),function(t){return t.message})},gt=function(t){return"ImageProxy Service error: "+at(t).bind(function(t){return st(t,["error","type"]).map(ht)}).getOr("Invalid JSON in service error message")},pt=function(t){return ut(t).then(function(t){t=gt(t);return b.reject(t)})},vt=function(t,n){return lt(t,n)?pt(n):mt(t)},yt=function(t,n){var e=-1===t.indexOf("?")?"?":"&";return/[?&]apiKey=/.test(t)?t:t+e+"apiKey="+encodeURIComponent(n)},wt=function(t){return t<200||300<=t},bt=function(t,n){var e={"Content-Type":"application/json;charset=UTF-8","tiny-api-key":n};return it(yt(t,n),e).then(function(t){return wt(t.status)?vt(t.status,t.blob):b.resolve(t.blob)})},It=function(t,n){return it(t,{},n).then(function(t){return wt(t.status)?mt(t.status):b.resolve(t.blob)})},Tt=function(t,n,e){return void 0===e&&(e=!1),n?bt(t,n):It(t,e)},_t=Q,Rt=1,C={fromHtml:function(t,n){n=(n||document).createElement("div");if(n.innerHTML=t,!n.hasChildNodes()||1<n.childNodes.length)throw console.error("HTML does not have a single root node",t),new Error("HTML must have a single root node");return k(n.childNodes[0])},fromTag:function(t,n){n=(n||document).createElement(t);return k(n)},fromText:function(t,n){n=(n||document).createTextNode(t);return k(n)},fromDom:k,fromPoint:function(t,n,e){return d.from(t.dom.elementFromPoint(n,e)).map(k)}},Ut=function(t,n){t=t.dom;if(t.nodeType!==Rt)return!1;if(void 0!==t.matches)return t.matches(n);if(void 0!==t.msMatchesSelector)return t.msMatchesSelector(n);if(void 0!==t.webkitMatchesSelector)return t.webkitMatchesSelector(n);if(void 0!==t.mozMatchesSelector)return t.mozMatchesSelector(n);throw new Error("Browser lacks native selectors")},At=(void 0!==window?window:Function("return this;")(),function(t,n){return j(t.dom.childNodes,function(t){return n(C.fromDom(t))}).map(C.fromDom)}),xt=function(t,n){return At(t,function(t){return Ut(t,n)})},Et=tinymce.util.Tools.resolve("tinymce.util.Delay"),Lt=tinymce.util.Tools.resolve("tinymce.util.Promise"),O=tinymce.util.Tools.resolve("tinymce.util.URI"),jt=function(t){return t.getParam("imagetools_toolbar","rotateleft rotateright flipv fliph editimage imageoptions")},kt=function(t){return t.getParam("imagetools_proxy")},Ct=function(t){return t.getParam("imagetools_cors_hosts",[],"string[]")},Ot=function(t){return t.getParam("imagetools_credentials_hosts",[],"string[]")},Pt=function(t){return d.from(t.getParam("imagetools_fetch_image",null,"function"))},St=function(t){return t.getParam("api_key",t.getParam("imagetools_api_key","","string"),"string")},Mt=function(t){return t.getParam("images_upload_timeout",3e4,"number")},Bt=function(t){return t.getParam("images_reuse_filename",!1,"boolean")};function Nt(t){var n,e;function r(t){return/^[0-9\.]+px$/.test(t)}return n=t.style.width,e=t.style.height,n||e?r(n)&&r(e)?{w:parseInt(n,10),h:parseInt(e,10)}:null:(e=t.height,(n=t.width)&&e?{w:parseInt(n,10),h:parseInt(e,10)}:null)}function Dt(t){return{w:t.naturalWidth,h:t.naturalHeight}}function Ft(e){function n(t){return function(){return e.execCommand(t)}}e.ui.registry.addButton("rotateleft",{tooltip:"Rotate counterclockwise",icon:"rotate-left",onAction:n("mceImageRotateLeft")}),e.ui.registry.addButton("rotateright",{tooltip:"Rotate clockwise",icon:"rotate-right",onAction:n("mceImageRotateRight")}),e.ui.registry.addButton("flipv",{tooltip:"Flip vertically",icon:"flip-vertically",onAction:n("mceImageFlipVertical")}),e.ui.registry.addButton("fliph",{tooltip:"Flip horizontally",icon:"flip-horizontally",onAction:n("mceImageFlipHorizontal")}),e.ui.registry.addButton("editimage",{tooltip:"Edit image",icon:"edit-image",onAction:n("mceEditImage"),onSetup:function(n){function t(){var t=S(e).forall(function(t){return P(e,t.dom).isNone()});n.setDisabled(t)}return e.on("NodeChange",t),function(){e.off("NodeChange",t)}}}),e.ui.registry.addButton("imageoptions",{tooltip:"Image options",icon:"image",onAction:n("mceImage")}),e.ui.registry.addContextMenu("imagetools",{update:function(t){return P(e,t).fold(function(){return[]},function(t){return[{text:"Edit image",icon:"edit-image",onAction:n("mceEditImage")}]})}})}var Ht=0,qt=function(t){return xt(C.fromDom(t),"img")},zt=function(t,n){return t.dom.is(n,"figure")},$t=function(t,n){return t.dom.is(n,"img:not([data-mce-object],[data-mce-placeholder])")},P=function(n,t){function e(t){return $t(n,t)&&(Vt(n,t)||Wt(n,t)||h(kt(n)))}return zt(n,t)?qt(t).bind(function(t){return e(t.dom)?d.some(t.dom):d.none()}):e(t)?d.some(t):d.none()},Gt=function(t,n){t.notificationManager.open({text:n,type:"error"})},S=function(t){var n=t.selection.getNode(),e=t.dom.getParent(n,"figure.image");return null!==e&&zt(t,e)?qt(e):$t(t,n)?d.some(C.fromDom(n)):d.none()},Jt=function(t,n,e){n=n.match(/(?:\/|^)(([^\/\?]+)\.(?:[a-z0-9.]+))(?:\?|$)/i);return h(n)?t.dom.encode(n[e]):null},Kt=function(){return"imagetools"+Ht++},Vt=function(t,n){n=n.src;return 0===n.indexOf("data:")||0===n.indexOf("blob:")||new O(n).host===t.documentBaseURI.host},Wt=function(t,n){return-1!==s.inArray(Ct(t),new O(n.src).host)},Xt=function(t,n){return-1!==s.inArray(Ot(t),new O(n.src).host)},Qt=function(t,n){var e;return Wt(t,n)?Tt(n.src,null,Xt(t,n)):Vt(t,n)?J(n):(e=(e=kt(t))+(-1===e.indexOf("?")?"?":"&")+"url="+encodeURIComponent(n.src),n=St(t),Tt(e,n,!1))},Yt=function(t,n){return Pt(t).fold(function(){return Qt(t,n)},function(t){return t(n)})},Zt=function(t,n){var e=t.editorUpload.blobCache.getByUri(n.src);return e?Lt.resolve(e.blob()):Yt(t,n)},tn=function(t,n){var e=Et.setEditorTimeout(t,function(){t.editorUpload.uploadImagesAuto()},Mt(t));n.set(e)},nn=function(t){Et.clearTimeout(t.get())},en=function(a,c,f,s,l,d,m){return f.toBlob().then(function(t){var n,e,r,o=a.editorUpload.blobCache,i=d.src,u=c.type===t.type;return Bt(a)&&(r=o.getByUri(i),e=h(r)?(i=r.uri(),n=r.name(),r.filename()):(n=Jt(a,i,2),Jt(a,i,1))),r=o.create({id:Kt(),blob:t,base64:f.toBase64(),uri:i,name:n,filename:u?e:void 0}),o.add(r),a.undoManager.transact(function(){a.$(d).on("load",function t(){a.$(d).off("load",t),a.nodeChanged(),s?a.editorUpload.uploadImagesAuto():(nn(l),tn(a,l))}),m&&a.$(d).attr({width:m.w,height:m.h}),a.$(d).attr({src:r.blobUri()}).removeAttr("data-mce-src")}),r})},rn=function(r,o,t,i){return function(){return S(r).fold(function(){Gt(r,"Could not find selected image")},function(e){return r._scanForImages().then(function(){return Zt(r,e.dom)}).then(function(n){return _t(n).then(t).then(function(t){return en(r,n,t,!1,o,e.dom,i)})}).catch(function(t){Gt(r,t)})})}},on=function(n,e,r){return function(){var t=S(n).fold(function(){return null},function(t){t=Nt(t.dom);return t?{w:t.h,h:t.w}:null});return rn(n,e,function(t){return et(t,r)},t)()}},un=function(t,n,e){return function(){return rn(t,n,function(t){return nt(t,e)})()}},an=function(n,e,i,u,a){return G(a).then(function(t){var n,e,r,o=Dt(t);return u.w===o.w&&u.h===o.h||Nt(i)&&(n=i,o=o)&&(e=n.style.width,r=n.style.height,(e||r)&&(n.style.width=o.w+"px",n.style.height=o.h+"px",n.removeAttribute("data-mce-style")),n.width||n.height)&&(n.setAttribute("width",String(o.w)),n.setAttribute("height",String(o.h))),URL.revokeObjectURL(t.src),a}).then(_t).then(function(t){return en(n,a,t,!0,e,i)}).catch(function(){})},cn="save-state",fn="disable",sn="enable",ln=function(t){return{blob:t,url:URL.createObjectURL(t)}},dn=function(i,u){return function(){var r=S(i),o=r.map(function(t){return Dt(t.dom)});r.each(function(n){P(i,n.dom).each(function(t){Zt(i,n.dom).then(function(t){t=ln(t);i.windowManager.open({title:"Edit Image",size:"large",body:{type:"panel",items:[{type:"imagetools",name:"imagetools",label:"Edit Image",currentState:t}]},buttons:[{type:"cancel",name:"cancel",text:"Cancel"},{type:"submit",name:"save",text:"Save",primary:!0,disabled:!0}],onSubmit:function(t){var e=t.getData().imagetools.blob;r.each(function(n){o.each(function(t){an(i,u,n.dom,t,e)})}),t.close()},onCancel:function(){},onAction:function(t,n){switch(n.name){case cn:n.value?t.enable("save"):t.disable("save");break;case fn:t.disable("save"),t.disable("cancel");break;case sn:t.enable("cancel")}}})})})})}};B.add("imagetools",function(t){var e,n,r,o,i,u,a=f(0),c=f(null);e=t,n=a,s.each({mceImageRotateLeft:on(e,n,-90),mceImageRotateRight:on(e,n,90),mceImageFlipVertical:un(e,n,"v"),mceImageFlipHorizontal:un(e,n,"h"),mceEditImage:dn(e,n)},function(t,n){e.addCommand(n,t)}),Ft(t),(r=t).ui.registry.addContextToolbar("imagetools",{items:jt(r),predicate:function(t){return P(r,t).isSome()},position:"node",scope:"node"}),i=a,u=c,(o=t).on("NodeChange",function(t){var n=u.get(),t=P(o,t.element);n&&!t.exists(function(t){return n.src===t.src})&&(nn(i),o.editorUpload.uploadImagesAuto(),u.set(null)),t.each(u.set)})})})();