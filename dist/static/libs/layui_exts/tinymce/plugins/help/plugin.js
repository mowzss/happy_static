(()=>{var e=tinymce.util.Tools.resolve("tinymce.PluginManager");let a=()=>window.crypto.getRandomValues(new Uint32Array(1))[0]/4294967295,n=0,u=e=>{var t=(new Date).getTime();return e+"_"+Math.floor(1e9*a())+ ++n+String(t)};var r,t,i,o,s=t=>e=>e.options.get(t);let l=s("help_tabs"),m=s("forced_plugins"),c=(e,t,a)=>!!a(e,t.prototype)||(null==(a=e.constructor)?void 0:a.name)===t.name,p=(r="string",e=>{return t=typeof(e=e),(null===e?"null":"object"==t&&Array.isArray(e)?"array":"object"==t&&c(e,String,(e,t)=>t.isPrototypeOf(e))?"string":t)===r;var t}),y=(t=void 0,e=>t===e),h=e=>typeof e===i,d=(o=!(i="function"),()=>o);class g{constructor(e,t){this.tag=e,this.value=t}static some(e){return new g(!0,e)}static none(){return g.singletonNone}fold(e,t){return this.tag?t(this.value):e()}isSome(){return this.tag}isNone(){return!this.tag}map(e){return this.tag?g.some(e(this.value)):g.none()}bind(e){return this.tag?e(this.value):g.none()}exists(e){return this.tag&&e(this.value)}forall(e){return!this.tag||e(this.value)}filter(e){return!this.tag||e(this.value)?this:g.none()}getOr(e){return this.tag?this.value:e}or(e){return this.tag?this:e}getOrThunk(e){return this.tag?this.value:e()}orThunk(e){return this.tag?this:e()}getOrDie(e){if(this.tag)return this.value;throw new Error(null!=e?e:"Called getOrDie on None")}static from(e){return null==e?g.none():g.some(e)}getOrNull(){return this.tag?this.value:null}getOrUndefined(){return this.value}each(e){this.tag&&e(this.value)}toArray(){return this.tag?[this.value]:[]}toString(){return this.tag?`some(${this.value})`:"none()"}}g.singletonNone=new g(!1);let k=Array.prototype.slice,v=Array.prototype.indexOf,b=(e,t)=>v.call(e,t),f=(e,t)=>-1<b(e,t),A=(t,a)=>{var n=t.length,r=new Array(n);for(let e=0;e<n;e++){var i=t[e];r[e]=a(i,e)}return r},w=(a,n)=>{var r=[];for(let e=0,t=a.length;e<t;e++){var i=a[e];n(i,e)&&r.push(i)}return r},C=(a,n,r)=>{for(let e=0,t=a.length;e<t;e++){var i=a[e];if(n(i,e))return g.some(i);if(r(i,e))break}return g.none()},S=(e,t)=>C(e,t,d),M=(e,t)=>{e=k.call(e,0);return e.sort(t),e},_=Object.keys,x=Object.hasOwnProperty,T=(e,t)=>O(e,t)?g.from(e[t]):g.none(),O=(e,t)=>x.call(e,t),D=t=>{let a=[];var n=e=>{a.push(e)};for(let e=0;e<t.length;e++)t[e].each(n);return a};var N=tinymce.util.Tools.resolve("tinymce.Resource"),P=tinymce.util.Tools.resolve("tinymce.util.I18n");let F=(e,t)=>N.load("tinymce.html-i18n.help-keynav."+t,e+`/js/i18n/keynav/${t}.js`),E=e=>F(e,P.getCode()).catch(()=>F(e,"en")),L=async e=>({name:"keyboardnav",title:"Keyboard Navigation",items:[{type:"htmlpanel",presets:"document",html:await E(e)}]});var H=tinymce.util.Tools.resolve("tinymce.Env");let U=e=>{var t=H.os.isMacOS()||H.os.isiOS();let a=t?{alt:"&#x2325;",ctrl:"&#x2303;",shift:"&#x21E7;",meta:"&#x2318;",access:"&#x2303;&#x2325;"}:{meta:"Ctrl ",access:"Shift + Alt "};e=e.split("+"),e=A(e,e=>{var t=e.toLowerCase().trim();return O(a,t)?a[t]:e});return t?e.join("").replace(/\s/,""):e.join("+")},V=[{shortcuts:["Meta + B"],action:"Bold"},{shortcuts:["Meta + I"],action:"Italic"},{shortcuts:["Meta + U"],action:"Underline"},{shortcuts:["Meta + A"],action:"Select all"},{shortcuts:["Meta + Y","Meta + Shift + Z"],action:"Redo"},{shortcuts:["Meta + Z"],action:"Undo"},{shortcuts:["Access + 1"],action:"Heading 1"},{shortcuts:["Access + 2"],action:"Heading 2"},{shortcuts:["Access + 3"],action:"Heading 3"},{shortcuts:["Access + 4"],action:"Heading 4"},{shortcuts:["Access + 5"],action:"Heading 5"},{shortcuts:["Access + 6"],action:"Heading 6"},{shortcuts:["Access + 7"],action:"Paragraph"},{shortcuts:["Access + 8"],action:"Div"},{shortcuts:["Access + 9"],action:"Address"},{shortcuts:["Alt + 0"],action:"Open help dialog"},{shortcuts:["Alt + F9"],action:"Focus to menubar"},{shortcuts:["Alt + F10"],action:"Focus to toolbar"},{shortcuts:["Alt + F11"],action:"Focus to element path"},{shortcuts:["Alt + F12"],action:"Focus to notification"},{shortcuts:["Ctrl + F9"],action:"Focus to contextual toolbar"},{shortcuts:["Shift + Enter"],action:"Open popup menu for split buttons"},{shortcuts:["Meta + K"],action:"Insert link (if link plugin activated)"},{shortcuts:["Meta + S"],action:"Save (if save plugin activated)"},{shortcuts:["Meta + F"],action:"Find (if searchreplace plugin activated)"},{shortcuts:["Meta + Shift + F"],action:"Switch to or from fullscreen mode"}],$=()=>({name:"shortcuts",title:"Handy Shortcuts",items:[{type:"table",header:["Action","Shortcut"],cells:A(V,e=>{var t=A(e.shortcuts,U).join(" or ");return[e.action,t]})}]}),j=A([{key:"accordion",name:"Accordion"},{key:"anchor",name:"Anchor"},{key:"autolink",name:"Autolink"},{key:"autoresize",name:"Autoresize"},{key:"autosave",name:"Autosave"},{key:"charmap",name:"Character Map"},{key:"code",name:"Code"},{key:"codesample",name:"Code Sample"},{key:"colorpicker",name:"Color Picker"},{key:"directionality",name:"Directionality"},{key:"emoticons",name:"Emoticons"},{key:"fullscreen",name:"Full Screen"},{key:"help",name:"Help"},{key:"image",name:"Image"},{key:"importcss",name:"Import CSS"},{key:"insertdatetime",name:"Insert Date/Time"},{key:"link",name:"Link"},{key:"lists",name:"Lists"},{key:"advlist",name:"List Styles"},{key:"media",name:"Media"},{key:"nonbreaking",name:"Nonbreaking"},{key:"pagebreak",name:"Page Break"},{key:"preview",name:"Preview"},{key:"quickbars",name:"Quick Toolbars"},{key:"save",name:"Save"},{key:"searchreplace",name:"Search and Replace"},{key:"table",name:"Table"},{key:"textcolor",name:"Text Color"},{key:"visualblocks",name:"Visual Blocks"},{key:"visualchars",name:"Visual Characters"},{key:"wordcount",name:"Word Count"},{key:"a11ychecker",name:"Accessibility Checker",type:"premium"},{key:"typography",name:"Advanced Typography",type:"premium",slug:"advanced-typography"},{key:"ai",name:"AI Assistant",type:"premium"},{key:"casechange",name:"Case Change",type:"premium"},{key:"checklist",name:"Checklist",type:"premium"},{key:"advcode",name:"Enhanced Code Editor",type:"premium"},{key:"mediaembed",name:"Enhanced Media Embed",type:"premium",slug:"introduction-to-mediaembed"},{key:"advtable",name:"Enhanced Tables",type:"premium"},{key:"exportpdf",name:"Export to PDF",type:"premium"},{key:"exportword",name:"Export to Word",type:"premium"},{key:"footnotes",name:"Footnotes",type:"premium"},{key:"formatpainter",name:"Format Painter",type:"premium"},{key:"editimage",name:"Image Editing",type:"premium"},{key:"uploadcare",name:"Image Optimizer Powered by Uploadcare",type:"premium"},{key:"importword",name:"Import from Word",type:"premium"},{key:"inlinecss",name:"Inline CSS",type:"premium",slug:"inline-css"},{key:"linkchecker",name:"Link Checker",type:"premium"},{key:"math",name:"Math",type:"premium"},{key:"markdown",name:"Markdown",type:"premium"},{key:"mentions",name:"Mentions",type:"premium"},{key:"mergetags",name:"Merge Tags",type:"premium"},{key:"pageembed",name:"Page Embed",type:"premium"},{key:"permanentpen",name:"Permanent Pen",type:"premium"},{key:"powerpaste",name:"PowerPaste",type:"premium",slug:"introduction-to-powerpaste"},{key:"revisionhistory",name:"Revision History",type:"premium"},{key:"tinymcespellchecker",name:"Spell Checker",type:"premium",slug:"introduction-to-tiny-spellchecker"},{key:"autocorrect",name:"Spelling Autocorrect",type:"premium"},{key:"tableofcontents",name:"Table of Contents",type:"premium"},{key:"advtemplate",name:"Templates",type:"premium",slug:"advanced-templates"},{key:"tinycomments",name:"Tiny Comments",type:"premium",slug:"introduction-to-tiny-comments"},{key:"tinydrive",name:"Tiny Drive",type:"premium",slug:"tinydrive-introduction"}],e=>({...e,type:e.type||"opensource",slug:e.slug||e.key})),B=e=>{let a=e=>`<a data-alloy-tabstop="true" tabindex="-1" href="${e.url}" target="_blank" rel="noopener">${e.name}</a>`,n=(e,t)=>{var e=e.plugins[t].getMetadata;return h(e)?{name:(e=e()).name,html:a(e)}:{name:t,html:t}},t=(e,t)=>S(j,e=>e.key===t).fold(()=>n(e,t),e=>{var t="premium"===e.type?e.name+"*":e.name;return{name:t,html:a({name:t,url:`https://www.tiny.cloud/docs/tinymce/7/${e.slug}/`})}}),r=e=>{var t=_(e.plugins);let a=m(e);return y(a)?t:w(t,e=>!f(a,e))};var i,o;return{name:"plugins",title:"Plugins",items:[{type:"htmlpanel",presets:"document",html:[null==(e=e)?"":"<div>"+(i=e,e=r(i),e=M(A(e,e=>t(i,e)),(e,t)=>e.name.localeCompare(t.name)),e=A(e,e=>"<li>"+e.html+"</li>"),o=e.length,e=e.join(""),"<p><b>")+P.translate(["Plugins installed ({0}):",o])+"</b></p><ul>"+e+"</ul></div>",(o=w(j,({type:e})=>"premium"===e),o=M(A(o,e=>e.name),(e,t)=>e.localeCompare(t)),o=A(o,e=>`<li>${e}</li>`).join(""),"<div><p><b>"+P.translate("Premium plugins:")+"</b></p><ul>"+o+'<li class="tox-help__more-link" "><a href="https://www.tiny.cloud/pricing/?utm_campaign=help_dialog_plugin_tab&utm_source=tiny&utm_medium=referral&utm_term=read_more&utm_content=premium_plugin_heading" rel="noopener" target="_blank" data-alloy-tabstop="true" tabindex="-1">'+P.translate("Learn more...")+"</a></li></ul></div>")].join("")}]}};var I=tinymce.util.Tools.resolve("tinymce.EditorManager");let R=()=>{t=I.majorVersion,e=I.minorVersion;var e,t=0===t.indexOf("@")?"X.X.X":t+"."+e;return{name:"versions",title:"Version",items:[{type:"htmlpanel",html:"<p>"+P.translate(["You are using {0}",'<a data-alloy-tabstop="true" tabindex="-1" href="https://www.tiny.cloud/docs/tinymce/7/changelog/?utm_campaign=help_dialog_version_tab&utm_source=tiny&utm_medium=referral" rel="noopener" target="_blank">TinyMCE '+t+"</a>"])+"</p>",presets:"document"}]}},z=(e,a)=>{let n={};e=A(e,e=>{var t;return p(e)?(O(a,e)&&(n[e]=a[e]),e):(t=null!=(t=e.name)?t:u("tab-name"),n[t]=e,t)});return{tabs:n,names:e}},W=e=>{var t=_(e),a=t.indexOf("versions");return-1!==a&&(t.splice(a,1),t.push("versions")),{tabs:e,names:t}},X=async(e,t,a)=>{var n=$(),a=await L(a),r=B(e),i=R();let o={[n.name]:n,[a.name]:a,[r.name]:r,[i.name]:i,...t.get()};return g.from(l(e)).fold(()=>W(o),e=>z(e,o))};e.add("help",(e,t)=>{var n,a,r,i,o,s,l,m=(e=>{let t=e;return{get:()=>t,set:e=>{t=e}}})({}),c=(n=m,{addTab:e=>{var t=null!=(t=e.name)?t:u("tab-name"),a=n.get();a[t]=e,n.set(a)}}),m=((0,e.options.register)("help_tabs",{processor:"array"}),r=m,i=t,()=>{X(a,r,i).then(({tabs:t,names:e})=>{e=A(e,e=>T(t,e)),e=D(e);a.windowManager.open({title:"Help",size:"medium",body:{type:"tabpanel",tabs:e},buttons:[{type:"cancel",name:"close",text:"Close",primary:!0}],initialData:{}})})});return s=m,(o=a=e).ui.registry.addButton("help",{icon:"help",tooltip:"Help",onAction:s,context:"any"}),o.ui.registry.addMenuItem("help",{text:"Help",icon:"help",shortcut:"Alt+0",onAction:s,context:"any"}),e.addCommand("mceHelp",m),e.shortcuts.add("Alt+0","Open help dialog","mceHelp"),l=t,e.on("init",()=>{E(l)}),c})})();