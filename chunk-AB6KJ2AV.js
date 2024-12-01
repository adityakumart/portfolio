import{e as O,f as z,h as w,l as j,n as q,r as W,v as Z}from"./chunk-E3VFD42H.js";import{K as N,P as k,Q as P,V,a as m,b as x,c as B,k as D,n as _,r as E}from"./chunk-JA3OW74J.js";import{Ab as F,Ca as p,Cc as b,Db as S,Gc as H,Sb as R,Ub as y,ba as A,ca as h,ea as f,ha as r,hb as C,i as d,n as M,nb as T,nc as L,oa as I,ob as c,pb as g,tb as v,za as u}from"./chunk-P2PCPSCD.js";var Y=(()=>{class s{static \u0275fac=function(t){return new(t||s)};static \u0275cmp=T({type:s,selectors:[["ng-component"]],hostAttrs:["cdk-text-field-style-loader",""],decls:0,vars:0,template:function(t,i){},styles:["textarea.cdk-textarea-autosize{resize:none}textarea.cdk-textarea-autosize-measuring{padding:2px 0 !important;box-sizing:content-box !important;height:auto !important;overflow:hidden !important}textarea.cdk-textarea-autosize-measuring-firefox{padding:2px 0 !important;box-sizing:content-box !important;height:0 !important}@keyframes cdk-text-field-autofill-start{/*!*/}@keyframes cdk-text-field-autofill-end{/*!*/}.cdk-text-field-autofill-monitored:-webkit-autofill{animation:cdk-text-field-autofill-start 0s 1ms}.cdk-text-field-autofill-monitored:not(:-webkit-autofill){animation:cdk-text-field-autofill-end 0s 1ms}"],encapsulation:2,changeDetection:0})}return s})(),U=B({passive:!0}),G=(()=>{class s{_platform=r(m);_ngZone=r(u);_styleLoader=r(D);_monitoredElements=new Map;constructor(){}monitor(e){if(!this._platform.isBrowser)return M;this._styleLoader.load(Y);let t=E(e),i=this._monitoredElements.get(t);if(i)return i.subject;let n=new d,a="cdk-text-field-autofilled",o=l=>{l.animationName==="cdk-text-field-autofill-start"&&!t.classList.contains(a)?(t.classList.add(a),this._ngZone.run(()=>n.next({target:l.target,isAutofilled:!0}))):l.animationName==="cdk-text-field-autofill-end"&&t.classList.contains(a)&&(t.classList.remove(a),this._ngZone.run(()=>n.next({target:l.target,isAutofilled:!1})))};return this._ngZone.runOutsideAngular(()=>{t.addEventListener("animationstart",o,U),t.classList.add("cdk-text-field-autofill-monitored")}),this._monitoredElements.set(t,{subject:n,unlisten:()=>{t.removeEventListener("animationstart",o,U)}}),n}stopMonitoring(e){let t=E(e),i=this._monitoredElements.get(t);i&&(i.unlisten(),i.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t))}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t))}static \u0275fac=function(t){return new(t||s)};static \u0275prov=A({token:s,factory:s.\u0275fac,providedIn:"root"})}return s})();var K=(()=>{class s{static \u0275fac=function(t){return new(t||s)};static \u0275mod=c({type:s});static \u0275inj=h({})}return s})();var X=new f("MAT_INPUT_VALUE_ACCESSOR"),J=["button","checkbox","file","hidden","image","radio","range","reset","submit"],Q=new f("MAT_INPUT_CONFIG"),Te=(()=>{class s{_elementRef=r(p);_platform=r(m);ngControl=r(q,{optional:!0,self:!0});_autofillMonitor=r(G);_ngZone=r(u);_formField=r(z,{optional:!0});_uid=r(N).getId("mat-input-");_previousNativeValue;_inputValueAccessor;_signalBasedValueAccessor;_previousPlaceholder;_errorStateTracker;_webkitBlinkWheelListenerAttached=!1;_config=r(Q,{optional:!0});_formFieldDescribedBy;_isServer;_isNativeSelect;_isTextarea;_isInFormField;focused=!1;stateChanges=new d;controlType="mat-input";autofilled=!1;get disabled(){return this._disabled}set disabled(e){this._disabled=_(e),this.focused&&(this.focused=!1,this.stateChanges.next())}_disabled=!1;get id(){return this._id}set id(e){this._id=e||this._uid}_id;placeholder;name;get required(){return this._required??this.ngControl?.control?.hasValidator(j.required)??!1}set required(e){this._required=_(e)}_required;get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&x().has(this._type)&&(this._elementRef.nativeElement.type=this._type),this._ensureWheelDefaultBehavior()}_type="text";get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e}userAriaDescribedBy;get value(){return this._signalBasedValueAccessor?this._signalBasedValueAccessor.value():this._inputValueAccessor.value}set value(e){e!==this.value&&(this._signalBasedValueAccessor?this._signalBasedValueAccessor.value.set(e):this._inputValueAccessor.value=e,this.stateChanges.next())}get readonly(){return this._readonly}set readonly(e){this._readonly=_(e)}_readonly=!1;disabledInteractive;get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e}_neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(e=>x().has(e));constructor(){let e=r(W,{optional:!0}),t=r(Z,{optional:!0}),i=r(V),n=r(X,{optional:!0,self:!0}),a=this._elementRef.nativeElement,o=a.nodeName.toLowerCase();n?C(n.value)?this._signalBasedValueAccessor=n:this._inputValueAccessor=n:this._inputValueAccessor=a,this._previousNativeValue=this.value,this.id=this.id,this._platform.IOS&&this._ngZone.runOutsideAngular(()=>{a.addEventListener("keyup",this._iOSKeyupListener)}),this._errorStateTracker=new P(i,this.ngControl,t,e,this.stateChanges),this._isServer=!this._platform.isBrowser,this._isNativeSelect=o==="select",this._isTextarea=o==="textarea",this._isInFormField=!!this._formField,this.disabledInteractive=this._config?.disabledInteractive||!1,this._isNativeSelect&&(this.controlType=a.multiple?"mat-native-select-multiple":"mat-native-select"),this._signalBasedValueAccessor&&H(()=>{this._signalBasedValueAccessor.value(),this.stateChanges.next()})}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next()})}ngOnChanges(){this.stateChanges.next()}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._platform.IOS&&this._elementRef.nativeElement.removeEventListener("keyup",this._iOSKeyupListener),this._webkitBlinkWheelListenerAttached&&this._elementRef.nativeElement.removeEventListener("wheel",this._webkitBlinkWheelListener)}ngDoCheck(){this.ngControl&&(this.updateErrorState(),this.ngControl.disabled!==null&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder()}focus(e){this._elementRef.nativeElement.focus(e)}updateErrorState(){this._errorStateTracker.updateErrorState()}_focusChanged(e){if(e!==this.focused){if(!this._isNativeSelect&&e&&this.disabled&&this.disabledInteractive){let t=this._elementRef.nativeElement;t.type==="number"?(t.type="text",t.setSelectionRange(0,0),t.type="number"):t.setSelectionRange(0,0)}this.focused=e,this.stateChanges.next()}}_onInput(){}_dirtyCheckNativeValue(){let e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next())}_dirtyCheckPlaceholder(){let e=this._getPlaceholder();if(e!==this._previousPlaceholder){let t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder")}}_getPlaceholder(){return this.placeholder||null}_validateType(){J.indexOf(this._type)>-1}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return!this._isNeverEmpty()&&!this._elementRef.nativeElement.value&&!this._isBadInput()&&!this.autofilled}get shouldLabelFloat(){if(this._isNativeSelect){let e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}else return this.focused&&!this.disabled||!this.empty}setDescribedByIds(e){let t=this._elementRef.nativeElement,i=t.getAttribute("aria-describedby"),n;if(i){let a=this._formFieldDescribedBy||e;n=e.concat(i.split(" ").filter(o=>o&&!a.includes(o)))}else n=e;this._formFieldDescribedBy=e,n.length?t.setAttribute("aria-describedby",n.join(" ")):t.removeAttribute("aria-describedby")}onContainerClick(){this.focused||this.focus()}_isInlineSelect(){let e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}_iOSKeyupListener=e=>{let t=e.target;!t.value&&t.selectionStart===0&&t.selectionEnd===0&&(t.setSelectionRange(1,1),t.setSelectionRange(0,0))};_webkitBlinkWheelListener=()=>{};_ensureWheelDefaultBehavior(){!this._webkitBlinkWheelListenerAttached&&this._type==="number"&&(this._platform.BLINK||this._platform.WEBKIT)&&(this._ngZone.runOutsideAngular(()=>{this._elementRef.nativeElement.addEventListener("wheel",this._webkitBlinkWheelListener)}),this._webkitBlinkWheelListenerAttached=!0),this._webkitBlinkWheelListenerAttached&&this._type!=="number"&&(this._elementRef.nativeElement.removeEventListener("wheel",this._webkitBlinkWheelListener),this._webkitBlinkWheelListenerAttached=!0)}_getReadonlyAttribute(){return this._isNativeSelect?null:this.readonly||this.disabled&&this.disabledInteractive?"true":null}static \u0275fac=function(t){return new(t||s)};static \u0275dir=g({type:s,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:21,hostBindings:function(t,i){t&1&&y("focus",function(){return i._focusChanged(!0)})("blur",function(){return i._focusChanged(!1)})("input",function(){return i._onInput()}),t&2&&(R("id",i.id)("disabled",i.disabled&&!i.disabledInteractive)("required",i.required),F("name",i.name||null)("readonly",i._getReadonlyAttribute())("aria-disabled",i.disabled&&i.disabledInteractive?"true":null)("aria-invalid",i.empty&&i.required?null:i.errorState)("aria-required",i.required)("id",i.id),S("mat-input-server",i._isServer)("mat-mdc-form-field-textarea-control",i._isInFormField&&i._isTextarea)("mat-mdc-form-field-input-control",i._isInFormField)("mat-mdc-input-disabled-interactive",i.disabledInteractive)("mdc-text-field__input",i._isInFormField)("mat-mdc-native-select-inline",i._isInlineSelect()))},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:[0,"aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly",disabledInteractive:[2,"disabledInteractive","disabledInteractive",b]},exportAs:["matInput"],features:[L([{provide:O,useExisting:s}]),v,I]})}return s})(),Fe=(()=>{class s{static \u0275fac=function(t){return new(t||s)};static \u0275mod=c({type:s});static \u0275inj=h({imports:[k,w,w,K,k]})}return s})();export{X as a,Te as b,Fe as c};
