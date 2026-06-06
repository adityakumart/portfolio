import{c as ve,d as Me}from"./chunk-GSVTNALA.js";import{a as le,c as Ce,d as xe,e as Se,f as we}from"./chunk-UKCZEERN.js";import{a as ee,b as te,c as ne,d as ie,g as oe}from"./chunk-2NWERXLS.js";import{A as he,B as ye,D as be,G as Te,H as Ie,I as Oe,J as Pe,K as ke,L as je,b as ce,c as pe,h as me,j as de,l as P,p as ue,q as fe,v as ge,z as _e}from"./chunk-3DSCXLS7.js";import{E as re,g as Y,oa as ae,pa as se}from"./chunk-M37OXUJ5.js";import{$ as C,Dc as O,Fb as w,Ga as L,Gb as G,Ib as y,Kb as g,Na as s,Ob as R,Pb as W,Pc as Q,Qb as U,Rc as K,Ta as E,Ua as N,Ub as q,Uc as X,Va as M,Vb as T,Wb as I,Xb as Z,Yb as p,Zb as A,aa as F,ab as S,bb as B,ca as D,da as V,ea as k,h as $,ib as f,ja as x,ka as v,la as j,ma as z,nc as H,ob as h,wb as m,xb as i,yb as o,zb as l}from"./chunk-CKG4FNOL.js";var Fe=["determinateSpinner"];function De(n,_){if(n&1&&(j(),i(0,"svg",11),l(1,"circle",12),o()),n&2){let e=g();h("viewBox",e._viewBox()),s(),T("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),h("r",e._circleRadius())}}var Ve=new D("mat-progress-spinner-default-options",{providedIn:"root",factory:()=>({diameter:Ee})}),Ee=100,ze=10,Ne=(()=>{class n{_elementRef=k(L);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=k(Ve),r=re(),t=this._elementRef.nativeElement;this._noopAnimations=r==="di-disabled"&&!!e&&!e._forceAnimations,this.mode=t.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",!this._noopAnimations&&r==="reduced-motion"&&t.classList.add("mat-progress-spinner-reduced-motion"),e&&(e.color&&(this.color=this._defaultColor=e.color),e.diameter&&(this.diameter=e.diameter),e.strokeWidth&&(this.strokeWidth=e.strokeWidth))}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0))}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0}_diameter=Ee;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0}_strokeWidth;_circleRadius(){return(this.diameter-ze)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return`0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(r){return new(r||n)};static \u0275cmp=S({type:n,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(r,t){if(r&1&&R(Fe,5),r&2){let a;W(a=U())&&(t._determinateCircle=a.first)}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(r,t){r&2&&(h("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",t.mode==="determinate"?t.value:null)("mode",t.mode),Z("mat-"+t.color),T("width",t.diameter,"px")("height",t.diameter,"px")("--mat-progress-spinner-size",t.diameter+"px")("--mat-progress-spinner-active-indicator-width",t.diameter+"px"),I("_mat-animation-noopable",t._noopAnimations)("mdc-circular-progress--indeterminate",t.mode==="indeterminate"))},inputs:{color:"color",mode:"mode",value:[2,"value","value",O],diameter:[2,"diameter","diameter",O],strokeWidth:[2,"strokeWidth","strokeWidth",O]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(r,t){if(r&1&&(f(0,De,2,8,"ng-template",null,0,H),i(2,"div",2,1),j(),i(4,"svg",3),l(5,"circle",4),o()(),z(),i(6,"div",5)(7,"div",6)(8,"div",7),w(9,8),o(),i(10,"div",9),w(11,8),o(),i(12,"div",10),w(13,8),o()()()),r&2){let a=q(1);s(4),h("viewBox",t._viewBox()),s(),T("stroke-dasharray",t._strokeCircumference(),"px")("stroke-dashoffset",t._strokeDashOffset(),"px")("stroke-width",t._circleStrokeWidth(),"%"),h("r",t._circleRadius()),s(4),m("ngTemplateOutlet",a),s(2),m("ngTemplateOutlet",a),s(2),m("ngTemplateOutlet",a)}},dependencies:[K],styles:[`.mat-mdc-progress-spinner {
  --mat-progress-spinner-animation-multiplier: 1;
  display: block;
  overflow: hidden;
  line-height: 0;
  position: relative;
  direction: ltr;
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-progress-spinner circle {
  stroke-width: var(--mat-progress-spinner-active-indicator-width, 4px);
}
.mat-mdc-progress-spinner._mat-animation-noopable, .mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle {
  transition: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container {
  animation: none !important;
}
.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle {
  stroke-dasharray: 0 !important;
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle {
    stroke: currentColor;
    stroke: CanvasText;
  }
}

.mat-progress-spinner-reduced-motion {
  --mat-progress-spinner-animation-multiplier: 1.25;
}

.mdc-circular-progress__determinate-container,
.mdc-circular-progress__indeterminate-circle-graphic,
.mdc-circular-progress__indeterminate-container,
.mdc-circular-progress__spinner-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.mdc-circular-progress__determinate-container {
  transform: rotate(-90deg);
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container {
  opacity: 0;
}

.mdc-circular-progress__indeterminate-container {
  font-size: 0;
  letter-spacing: 0;
  white-space: nowrap;
  opacity: 0;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container {
  opacity: 1;
  animation: mdc-circular-progress-container-rotate calc(1568.2352941176ms * var(--mat-progress-spinner-animation-multiplier)) linear infinite;
}

.mdc-circular-progress__determinate-circle-graphic,
.mdc-circular-progress__indeterminate-circle-graphic {
  fill: transparent;
}

.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
  stroke: var(--mat-progress-spinner-active-indicator-color, var(--mat-sys-primary));
}
@media (forced-colors: active) {
  .mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,
  .mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic {
    stroke: CanvasText;
  }
}

.mdc-circular-progress__determinate-circle {
  transition: stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);
}

.mdc-circular-progress__gap-patch {
  position: absolute;
  top: 0;
  left: 47.5%;
  box-sizing: border-box;
  width: 5%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic {
  left: -900%;
  width: 2000%;
  transform: rotate(180deg);
}
.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic {
  width: 200%;
}
.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  left: -100%;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-left-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}
.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic {
  animation: mdc-circular-progress-right-spin calc(1333ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

.mdc-circular-progress__circle-clipper {
  display: inline-flex;
  position: relative;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer {
  animation: mdc-circular-progress-spinner-layer-rotate calc(5332ms * var(--mat-progress-spinner-animation-multiplier)) cubic-bezier(0.4, 0, 0.2, 1) infinite both;
}

@keyframes mdc-circular-progress-container-rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes mdc-circular-progress-spinner-layer-rotate {
  12.5% {
    transform: rotate(135deg);
  }
  25% {
    transform: rotate(270deg);
  }
  37.5% {
    transform: rotate(405deg);
  }
  50% {
    transform: rotate(540deg);
  }
  62.5% {
    transform: rotate(675deg);
  }
  75% {
    transform: rotate(810deg);
  }
  87.5% {
    transform: rotate(945deg);
  }
  100% {
    transform: rotate(1080deg);
  }
}
@keyframes mdc-circular-progress-left-spin {
  from {
    transform: rotate(265deg);
  }
  50% {
    transform: rotate(130deg);
  }
  to {
    transform: rotate(265deg);
  }
}
@keyframes mdc-circular-progress-right-spin {
  from {
    transform: rotate(-265deg);
  }
  50% {
    transform: rotate(-130deg);
  }
  to {
    transform: rotate(-265deg);
  }
}
`],encapsulation:2})}return n})();var Ae=(()=>{class n{static \u0275fac=function(r){return new(r||n)};static \u0275mod=B({type:n});static \u0275inj=F({imports:[Y]})}return n})();var Je=(()=>{class n{constructor(){this.INDENT="  ",this.INTERFACE_SUFFIX=" {"}generateInterface(e,r){let t=[];t.push(`export interface ${r}${this.INTERFACE_SUFFIX}`);let a=this.generateProperties(e,1);return t.push(a),t.push("}"),t.join(`
`)}generateProperties(e,r){let t=[];return Object.keys(e).forEach((c,b)=>{let d=e[c],u=this.getTypeDefinition(d,c,r);t.push(u)}),t.join(`
`)}getTypeDefinition(e,r,t){let a=this.INDENT.repeat(t),c=this.sanitizePropertyName(r),b=e==null?"?":"";if(e==null)return`${a}${c}${b}: any;`;if(Array.isArray(e))return this.getArrayTypeDefinition(e,c,a,t);if(typeof e=="object")return this.getObjectTypeDefinition(e,c,a,r,t);let d=this.getValueType(e);return`${a}${c}: ${d};`}getArrayTypeDefinition(e,r,t,a){if(e.length===0)return`${t}${r}: any[];`;let c=e[0];if(e.every(u=>typeof u==typeof c)&&typeof c=="object"&&!Array.isArray(c)){let u=this.generateInterfaceNameFromProperty(r),Qe=this.generateInterface(c,u);return`${t}${r}: ${u}[];`}let d=this.getValueType(c);return`${t}${r}: ${d}[];`}getObjectTypeDefinition(e,r,t,a,c){let b=this.generateInterfaceNameFromProperty(a),d=this.generateProperties(e,c+1);return[`${t}${r}: {`,d,`${t}};`].join(`
`)}getValueType(e){if(e==null)return"any";switch(typeof e){case"string":return"string";case"number":return Number.isInteger(e),"number";case"boolean":return"boolean";default:return"any"}}sanitizePropertyName(e){let r=["abstract","arguments","await","boolean","break","byte","case","catch","char","class","const","continue","debugger","default","delete","do","double","else","enum","eval","export","extends","false","final","finally","float","for","function","goto","if","implements","import","in","instanceof","int","interface","let","long","native","new","null","package","private","protected","public","return","short","static","super","switch","synchronized","this","throw","throws","transient","true","try","typeof","var","void","volatile","while","with","yield"],t=e;return t=t.replace(/[^a-zA-Z0-9_$]/g,"_"),/^\d/.test(t)&&(t="_"+t),r.includes(t)&&(t=t+"_"),t}generateInterfaceNameFromProperty(e){return e.replace(/[^a-zA-Z0-9]/g," ").split(" ").filter(c=>c.length>0).map(c=>c.charAt(0).toUpperCase()+c.slice(1).toLowerCase()).join("")||"NestedObject"}static{this.\u0275fac=function(r){return new(r||n)}}static{this.\u0275prov=C({token:n,factory:n.\u0275fac,providedIn:"root"})}}return n})();var $e=(()=>{class n{constructor(e){this.typeGenerator=e}isValidJson(e){try{return JSON.parse(e),!0}catch{return!1}}transformJsonToInterface(e,r="GeneratedInterface"){try{if(!this.isValidJson(e))return{success:!1,interface:"",error:"Invalid JSON format. Please check your input."};let t=JSON.parse(e);return typeof t!="object"||t===null?{success:!1,interface:"",error:"JSON input must be an object, not a primitive value."}:Array.isArray(t)?{success:!1,interface:"",error:"JSON input must be an object, not an array. Try wrapping it in an object."}:{success:!0,interface:this.typeGenerator.generateInterface(t,r)}}catch(t){return{success:!1,interface:"",error:`An error occurred while processing JSON: ${t instanceof Error?t.message:"Unknown error"}`}}}getTypeInfo(e){let r={type:"any",isArray:!1,isNullable:e===null};if(e==null)return r.type="any",r.isNullable=!0,r;if(Array.isArray(e)){if(r.isArray=!0,e.length===0)r.type="any[]";else{let t=e[0],a=this.getValueType(t);r.type=`${a}[]`}return r}return r.type=this.getValueType(e),r}getValueType(e){return typeof e=="string"?"string":typeof e=="number"?"number":typeof e=="boolean"?"boolean":e instanceof Date?"Date":Array.isArray(e)?e.length>0?`${this.getValueType(e[0])}[]`:"any[]":typeof e=="object"&&e!==null?"object":"any"}static{this.\u0275fac=function(r){return new(r||n)(V(Je))}}static{this.\u0275prov=C({token:n,factory:n.\u0275fac,providedIn:"root"})}}return n})();function Re(n,_){n&1&&(i(0,"mat-error"),p(1," Interface name is required "),o())}function We(n,_){n&1&&(i(0,"mat-error"),p(1," Must start with letter, $, or _ and contain only alphanumeric characters "),o())}function Ue(n,_){n&1&&(i(0,"mat-error"),p(1," JSON input is required "),o())}function qe(n,_){n&1&&(i(0,"mat-error"),p(1," Please enter valid JSON format "),o())}function Ze(n,_){n&1&&(i(0,"div",18),l(1,"mat-spinner",19),i(2,"span",20),p(3,"Processing..."),o()())}function He(n,_){if(n&1){let e=G();i(0,"mat-card",21)(1,"mat-card-header")(2,"mat-card-title",22),p(3,"Generated TypeScript Interface"),o()(),i(4,"mat-card-content")(5,"pre",23),p(6),o(),i(7,"div",24)(8,"button",25),y("click",function(){x(e);let t=g();return v(t.copyToClipboard())}),i(9,"mat-icon"),p(10),o()(),i(11,"button",26),y("click",function(){x(e);let t=g();return v(t.downloadInterface())}),i(12,"mat-icon"),p(13,"download"),o()(),l(14,"mat-divider",27),i(15,"button",28),y("click",function(){x(e);let t=g();return v(t.showOutput=!1)}),i(16,"mat-icon"),p(17,"close"),o()()()()()}if(n&2){let e=g();s(6),A(e.generatedInterface),s(2),I("copied",e.copySuccess),s(2),A(e.copySuccess?"check_circle":"content_copy"),s(4),m("vertical",!0)}}var Ot=(()=>{class n{constructor(e,r,t){this.fb=e,this.jsonTransformer=r,this.snackBar=t,this.generatedInterface="",this.isLoading=!1,this.showOutput=!1,this.copySuccess=!1,this.destroy$=new $}ngOnInit(){this.initializeForm()}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}initializeForm(){this.form=this.fb.group({jsonInput:["",[P.required,this.jsonValidator.bind(this)]],interfaceName:["GeneratedInterface",[P.required,P.pattern(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)]]})}jsonValidator(e){return e.value?this.jsonTransformer.isValidJson(e.value)?null:{invalidJson:!0}:null}generateInterface(){if(this.form.invalid){this.showErrorMessage("Please enter valid JSON");return}this.isLoading=!0;let e=this.form.get("jsonInput")?.value,r=this.form.get("interfaceName")?.value;try{let t=this.jsonTransformer.transformJsonToInterface(e,r);t.success?(this.generatedInterface=t.interface,this.showOutput=!0,this.showSuccessMessage("Interface generated successfully!")):this.showErrorMessage(t.error||"Failed to generate interface")}catch(t){this.showErrorMessage(`Error: ${t instanceof Error?t.message:"Unknown error"}`)}finally{this.isLoading=!1}}clearInput(){this.form.reset({interfaceName:"GeneratedInterface"}),this.generatedInterface="",this.showOutput=!1,this.copySuccess=!1}copyToClipboard(){navigator.clipboard.writeText(this.generatedInterface).then(()=>{this.copySuccess=!0,this.showSuccessMessage("Copied to clipboard!"),setTimeout(()=>{this.copySuccess=!1},2e3)},()=>{this.showErrorMessage("Failed to copy to clipboard")})}downloadInterface(){let e=document.createElement("a"),t=`${this.form.get("interfaceName")?.value}.ts`;e.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(this.generatedInterface)),e.setAttribute("download",t),e.style.display="none",document.body.appendChild(e),e.click(),document.body.removeChild(e),this.showSuccessMessage(`Downloaded as ${t}`)}showErrorMessage(e){this.snackBar.open(e,"Close",{duration:5e3,horizontalPosition:"end",verticalPosition:"bottom",panelClass:["error-snackbar"]})}showSuccessMessage(e){this.snackBar.open(e,"Close",{duration:3e3,horizontalPosition:"end",verticalPosition:"bottom",panelClass:["success-snackbar"]})}get jsonInput(){return this.form.get("jsonInput")}get interfaceName(){return this.form.get("interfaceName")}static{this.\u0275fac=function(r){return new(r||n)(M(ye),M($e),M(ve))}}static{this.\u0275cmp=S({type:n,selectors:[["app-json-to-typescript"]],decls:39,vars:8,consts:[[1,"json-to-typescript-container"],[1,"header-card","mb-4"],[1,"py-3"],["fxLayout","row","fxLayoutGap","24px","fxLayoutAlign","stretch stretch",1,"content-wrapper"],["fxFlex","1 1 50%"],[1,"pb-3"],[3,"formGroup"],["appearance","outline",1,"full-width"],["matInput","","formControlName","interfaceName","placeholder","e.g., User, Product, Response","type","text"],[4,"ngIf"],["appearance","outline",1,"full-width","textarea-field"],["matInput","","formControlName","jsonInput","placeholder",'{"name": "John", "age": 30, "email": "john@example.com"}',"rows","12",1,"json-textarea"],["fxLayout","row","fxLayoutGap","12px",1,"button-group"],["mat-raised-button","","color","primary","fxFlex","1",3,"click","disabled"],[1,"button-text"],["mat-stroked-button","","fxFlex","1",3,"click"],["class","loading-indicator","fxLayout","row","fxLayoutAlign","center center",4,"ngIf"],["class","output-section","fxFlex","1 1 50%",4,"ngIf"],["fxLayout","row","fxLayoutAlign","center center",1,"loading-indicator"],["diameter","24"],[1,"loading-text"],["fxFlex","1 1 50%",1,"output-section"],[1,"section-title"],[1,"interface-output"],["fxLayout","row","fxLayoutGap","8px",1,"output-button-group"],["mat-icon-button","","matTooltip","Copy to Clipboard","color","accent",3,"click"],["mat-icon-button","","matTooltip","Download as .ts file","color","accent",3,"click"],[3,"vertical"],["mat-icon-button","","matTooltip","Close",3,"click"]],template:function(r,t){r&1&&(i(0,"div",0)(1,"mat-card",1)(2,"mat-card-header",2)(3,"mat-card-title"),p(4,"JSON to TypeScript Interface Generator"),o(),i(5,"mat-card-subtitle"),p(6,"Convert your JSON objects into strongly-typed TypeScript interfaces"),o()()(),i(7,"div",3)(8,"mat-card",4)(9,"mat-card-header")(10,"mat-card-title",5),p(11,"Input JSON"),o()(),i(12,"mat-card-content")(13,"form",6)(14,"mat-form-field",7)(15,"mat-label"),p(16,"Interface Name"),o(),l(17,"input",8),E(),f(18,Re,2,0,"mat-error",9)(19,We,2,0,"mat-error",9),o(),i(20,"mat-form-field",10)(21,"mat-label"),p(22,"Paste your JSON here"),o(),l(23,"textarea",11),E(),f(24,Ue,2,0,"mat-error",9)(25,qe,2,0,"mat-error",9),o(),i(26,"div",12)(27,"button",13),y("click",function(){return t.generateInterface()}),i(28,"mat-icon"),p(29,"auto_awesome"),o(),i(30,"span",14),p(31,"Generate Interface"),o()(),i(32,"button",15),y("click",function(){return t.clearInput()}),i(33,"mat-icon"),p(34,"clear"),o(),i(35,"span",14),p(36,"Clear"),o()()(),f(37,Ze,4,0,"div",16),o()()(),f(38,He,18,5,"mat-card",17),o()()),r&2&&(s(13),m("formGroup",t.form),s(4),N(),s(),m("ngIf",t.interfaceName?.hasError("required")),s(),m("ngIf",t.interfaceName?.hasError("pattern")),s(4),N(),s(),m("ngIf",t.jsonInput?.hasError("required")),s(),m("ngIf",t.jsonInput?.hasError("invalidJson")),s(2),m("disabled",t.form.invalid||t.isLoading),s(10),m("ngIf",t.isLoading),s(),m("ngIf",t.showOutput))},dependencies:[X,Q,be,ge,de,ue,fe,he,_e,le,me,ce,pe,xe,Ce,je,Te,Oe,ke,Pe,Ie,oe,ie,ne,te,ee,Me,se,ae,Ae,Ne,we,Se],styles:[".json-to-typescript-container[_ngcontent-%COMP%]{padding:24px;max-width:1400px;margin:0 auto;min-height:100vh}.json-to-typescript-container[_ngcontent-%COMP%]   .full-width[_ngcontent-%COMP%]{width:100%;margin-bottom:16px}.json-to-typescript-container[_ngcontent-%COMP%]   .textarea-field[_ngcontent-%COMP%]{margin-bottom:24px}.json-to-typescript-container[_ngcontent-%COMP%]   .textarea-field[_ngcontent-%COMP%]   .json-textarea[_ngcontent-%COMP%]{font-family:Courier New,monospace;font-size:12px;line-height:1.6;padding:12px}.json-to-typescript-container[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], .json-to-typescript-container[_ngcontent-%COMP%]   .output-button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{transition:all .3s ease}.json-to-typescript-container[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled), .json-to-typescript-container[_ngcontent-%COMP%]   .output-button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled){transform:translateY(-2px)}.json-to-typescript-container[_ngcontent-%COMP%]   .button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%], .json-to-typescript-container[_ngcontent-%COMP%]   .output-button-group[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{margin-right:8px}.json-to-typescript-container[_ngcontent-%COMP%]   .button-text[_ngcontent-%COMP%]{font-weight:500}.json-to-typescript-container[_ngcontent-%COMP%]   .loading-indicator[_ngcontent-%COMP%]{margin-top:20px;padding:16px;background-color:var(--mat-sys-surface-container);border-radius:4px;gap:12px}.json-to-typescript-container[_ngcontent-%COMP%]   .loading-indicator[_ngcontent-%COMP%]   .loading-text[_ngcontent-%COMP%]{font-size:14px;font-weight:500}.json-to-typescript-container[_ngcontent-%COMP%]   .interface-output[_ngcontent-%COMP%]{background-color:var(--mat-sys-surface-container);border:1px solid var(--mat-sys-outline-variant);border-radius:4px;padding:16px;font-family:Courier New,monospace;font-size:13px;line-height:1.6;color:var(--mat-sys-on-surface);overflow-x:auto;max-height:400px;overflow-y:auto;margin:16px 0}.json-to-typescript-container[_ngcontent-%COMP%]   button[matTooltip].copied[_ngcontent-%COMP%]{color:var(--mat-sys-primary)}.json-to-typescript-container[_ngcontent-%COMP%]   button[matTooltip].copied[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{animation:_ngcontent-%COMP%_pulse .5s ease}@keyframes _ngcontent-%COMP%_pulse{0%{transform:scale(1)}50%{transform:scale(1.2)}to{transform:scale(1)}}.json-to-typescript-container[_ngcontent-%COMP%]{padding:12px}.json-to-typescript-container[_ngcontent-%COMP%]   .header-card[_ngcontent-%COMP%]   mat-card-title[_ngcontent-%COMP%]{font-size:18px}.json-to-typescript-container[_ngcontent-%COMP%]   .output-button-group[_ngcontent-%COMP%]{gap:4px!important}"],changeDetection:1})}}return n})();export{Ot as JsonToTypeScriptComponent};
