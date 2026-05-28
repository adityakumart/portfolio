import{d as Ut}from"./chunk-WNZ3QR5L.js";import{k as Jt}from"./chunk-3TR33KWY.js";import{f as ei,g as St,h as Ke}from"./chunk-MMTASIXF.js";import{a as _t,b as Ue}from"./chunk-FTCEK2JP.js";import{d as Dt,g as un,i as It,j as Kt,l as bn,m as gn,n as fn,o as vn,p as yn,q as xn,r as kn,s as Xt}from"./chunk-2MZXYQHT.js";import{c as _n,d as Zt}from"./chunk-BJDRKBRR.js";import{a as Xi,b as Ji,e as Ye}from"./chunk-FXBQ3J75.js";import{a as ti,b as Cn,f as ii,i as ni}from"./chunk-TU64ZIXR.js";import{a as Ze}from"./chunk-RSX6UZVC.js";import{c as wn}from"./chunk-EQDGI4LG.js";import{B as sn,C as cn,d as $t,f as vt,h as yt,k as xt,m as en,n as tn,p as nn,q as an,t as on,x as rn}from"./chunk-PLQQSOGZ.js";import{A as Ct,a as ln,c as dn,d as mn,g as kt,h as wt,j as hn,l as pn,z as Yt}from"./chunk-BKDCRRXE.js";import{D as gt,F as ft,G as te,L as ye,Q as Ie,S as Se,T as Te,a as $i,e as pt,f as Ui,g as $e,j as De,k as N,l as _e,m as Yi,o as ut,p as bt,q as Wt,r as ve,s as Re,u as Zi,x as Ki}from"./chunk-RLR4A6XX.js";import{$a as We,$b as fe,A as xe,Ab as Be,B as Ni,Bb as w,Cb as ji,Db as u,Eb as $,Fb as j,Fc as Wi,G as rt,Gb as ae,Hb as K,Hc as qt,Ia as m,Ib as I,Jb as S,Ka as ze,La as le,Lc as ht,Ma as Vt,Na as we,Nb as V,Ob as Qt,Pa as Vi,Pb as E,Qa as Fe,Qb as ge,R as Y,Rb as b,S as Me,Sb as ee,T as W,Tb as Ee,Ua as P,V as Hi,Va as M,Wa as O,Y as st,Z as ke,Za as be,Zb as Gi,_ as T,_a as Ce,_b as G,a as je,aa as L,ac as Qi,b as at,ca as c,d as ne,f as Ht,ga as A,gb as jt,gc as lt,h as k,ha as z,hb as D,i as Ai,ia as se,j as zi,ja as Qe,jb as f,ka as ce,kb as v,l as Fi,la as Ae,lc as dt,mb as de,nb as me,nc as mt,o as Ge,oa as C,ob as he,pa as J,pb as _,pc as qi,qb as d,rb as l,s as ot,sa as R,sb as y,sc as B,tb as ct,ua as ue,ub as Gt,uc as g,va as qe,vc as X,xa as F,ya as Pe,yb as pe,z as Bi,zb as Z}from"./chunk-NUWCA4GH.js";var ua=["input"],ba=["formField"],ga=["*"],Tt=class{source;value;constructor(n,e){this.source=n,this.value=e}},fa={provide:wt,useExisting:st(()=>ai),multi:!0},Dn=new L("MatRadioGroup"),va=new L("mat-radio-default-options",{providedIn:"root",factory:()=>({color:"accent",disabledInteractive:!1})}),ai=(()=>{class a{_changeDetector=c(B);_value=null;_name=c(te).getId("mat-radio-group-");_selected=null;_isInitialized=!1;_labelPosition="after";_disabled=!1;_required=!1;_buttonChanges;_controlValueAccessorChangeFn=()=>{};onTouched=()=>{};change=new C;_radios;color;get name(){return this._name}set name(e){this._name=e,this._updateRadioButtonNames()}get labelPosition(){return this._labelPosition}set labelPosition(e){this._labelPosition=e==="before"?"before":"after",this._markRadiosForCheck()}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton())}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=!0)}get selected(){return this._selected}set selected(e){this._selected=e,this.value=e?e.value:null,this._checkSelectedRadioButton()}get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._markRadiosForCheck()}get required(){return this._required}set required(e){this._required=e,this._markRadiosForCheck()}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e,this._markRadiosForCheck()}_disabledInteractive=!1;constructor(){}ngAfterContentInit(){this._isInitialized=!0,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(e=>e===this.selected)&&(this._selected=null)})}ngOnDestroy(){this._buttonChanges?.unsubscribe()}_touch(){this.onTouched&&this.onTouched()}_updateRadioButtonNames(){this._radios&&this._radios.forEach(e=>{e.name=this.name,e._markForCheck()})}_updateSelectedRadioFromValue(){let e=this._selected!==null&&this._selected.value===this._value;this._radios&&!e&&(this._selected=null,this._radios.forEach(t=>{t.checked=this.value===t.value,t.checked&&(this._selected=t)}))}_emitChangeEvent(){this._isInitialized&&this.change.emit(new Tt(this._selected,this._value))}_markRadiosForCheck(){this._radios&&this._radios.forEach(e=>e._markForCheck())}writeValue(e){this.value=e,this._changeDetector.markForCheck()}registerOnChange(e){this._controlValueAccessorChangeFn=e}registerOnTouched(e){this.onTouched=e}setDisabledState(e){this.disabled=e,this._changeDetector.markForCheck()}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["mat-radio-group"]],contentQueries:function(t,i,o){if(t&1&&ae(o,Mt,5),t&2){let r;I(r=S())&&(i._radios=r)}},hostAttrs:["role","radiogroup",1,"mat-mdc-radio-group"],inputs:{color:"color",name:"name",labelPosition:"labelPosition",value:"value",selected:"selected",disabled:[2,"disabled","disabled",g],required:[2,"required","required",g],disabledInteractive:[2,"disabledInteractive","disabledInteractive",g]},outputs:{change:"change"},exportAs:["matRadioGroup"],features:[G([fa,{provide:Dn,useExisting:a}])]})}return a})(),Mt=(()=>{class a{_elementRef=c(F);_changeDetector=c(B);_focusMonitor=c(Re);_radioDispatcher=c(wn);_defaultOptions=c(va,{optional:!0});_ngZone=c(J);_renderer=c(we);_uniqueId=c(te).getId("mat-radio-");_cleanupClick;id=this._uniqueId;name;ariaLabel;ariaLabelledby;ariaDescribedby;disableRipple=!1;tabIndex=0;get checked(){return this._checked}set checked(e){this._checked!==e&&(this._checked=e,e&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!e&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),e&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck())}get value(){return this._value}set value(e){this._value!==e&&(this._value=e,this.radioGroup!==null&&(this.checked||(this.checked=this.radioGroup.value===e),this.checked&&(this.radioGroup.selected=this)))}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||"after"}set labelPosition(e){this._labelPosition=e}_labelPosition;get disabled(){return this._disabled||this.radioGroup!==null&&this.radioGroup.disabled}set disabled(e){this._setDisabled(e)}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(e){e!==this._required&&this._changeDetector.markForCheck(),this._required=e}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||"accent"}set color(e){this._color=e}_color;get disabledInteractive(){return this._disabledInteractive||this.radioGroup!==null&&this.radioGroup.disabledInteractive}set disabledInteractive(e){this._disabledInteractive=e}_disabledInteractive;change=new C;radioGroup;get inputId(){return`${this.id||this._uniqueId}-input`}_checked=!1;_disabled=!1;_required=!1;_value=null;_removeUniqueSelectionListener=()=>{};_previousTabIndex;_inputElement;_rippleTrigger;_noopAnimations=ye();_injector=c(ce);constructor(){c(_e).load(Se);let e=c(Dn,{optional:!0}),t=c(new mt("tabindex"),{optional:!0});this.radioGroup=e,this._disabledInteractive=this._defaultOptions?.disabledInteractive??!1,t&&(this.tabIndex=X(t,0))}focus(e,t){t?this._focusMonitor.focusVia(this._inputElement,t,e):this._inputElement.nativeElement.focus(e)}_markForCheck(){this._changeDetector.markForCheck()}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((e,t)=>{e!==this.id&&t===this.name&&(this.checked=!1)})}ngDoCheck(){this._updateTabIndex()}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,!0).subscribe(e=>{!e&&this.radioGroup&&this.radioGroup._touch()}),this._ngZone.runOutsideAngular(()=>{this._cleanupClick=this._renderer.listen(this._inputElement.nativeElement,"click",this._onInputClick)})}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener()}_emitChangeEvent(){this.change.emit(new Tt(this,this._value))}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(e){if(e.stopPropagation(),!this.checked&&!this.disabled){let t=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=!0,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),t&&this.radioGroup._emitChangeEvent())}}_onTouchTargetClick(e){this._onInputInteraction(e),(!this.disabled||this.disabledInteractive)&&this._inputElement?.nativeElement.focus()}_setDisabled(e){this._disabled!==e&&(this._disabled=e,this._changeDetector.markForCheck())}_onInputClick=e=>{this.disabled&&this.disabledInteractive&&e.preventDefault()};_updateTabIndex(){let e=this.radioGroup,t;if(!e||!e.selected||this.disabled?t=this.tabIndex:t=e.selected===this?this.tabIndex:-1,t!==this._previousTabIndex){let i=this._inputElement?.nativeElement;i&&(i.setAttribute("tabindex",t+""),this._previousTabIndex=t,ze(()=>{queueMicrotask(()=>{e&&e.selected&&e.selected!==this&&document.activeElement===i&&(e.selected?._inputElement.nativeElement.focus(),document.activeElement===i&&this._inputElement.nativeElement.blur())})},{injector:this._injector}))}}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-radio-button"]],viewQuery:function(t,i){if(t&1&&K(ua,5)(ba,7,F),t&2){let o;I(o=S())&&(i._inputElement=o.first),I(o=S())&&(i._rippleTrigger=o.first)}},hostAttrs:[1,"mat-mdc-radio-button"],hostVars:19,hostBindings:function(t,i){t&1&&w("focus",function(){return i._inputElement.nativeElement.focus()}),t&2&&(D("id",i.id)("tabindex",null)("aria-label",null)("aria-labelledby",null)("aria-describedby",null),E("mat-primary",i.color==="primary")("mat-accent",i.color==="accent")("mat-warn",i.color==="warn")("mat-mdc-radio-checked",i.checked)("mat-mdc-radio-disabled",i.disabled)("mat-mdc-radio-disabled-interactive",i.disabledInteractive)("_mat-animation-noopable",i._noopAnimations))},inputs:{id:"id",name:"name",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],disableRipple:[2,"disableRipple","disableRipple",g],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?0:X(e)],checked:[2,"checked","checked",g],value:"value",labelPosition:"labelPosition",disabled:[2,"disabled","disabled",g],required:[2,"required","required",g],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",g]},outputs:{change:"change"},exportAs:["matRadioButton"],ngContentSelectors:ga,decls:13,vars:17,consts:[["formField",""],["input",""],["mat-internal-form-field","",3,"labelPosition"],[1,"mdc-radio"],["aria-hidden","true",1,"mat-mdc-radio-touch-target",3,"click"],["type","radio","aria-invalid","false",1,"mdc-radio__native-control",3,"change","id","checked","disabled","required"],["aria-hidden","true",1,"mdc-radio__background"],[1,"mdc-radio__outer-circle"],[1,"mdc-radio__inner-circle"],["mat-ripple","","aria-hidden","true",1,"mat-radio-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mat-ripple-element","mat-radio-persistent-ripple"],[1,"mdc-label",3,"for"]],template:function(t,i){t&1&&($(),d(0,"div",2,0)(2,"div",3)(3,"div",4),w("click",function(r){return i._onTouchTargetClick(r)}),l(),d(4,"input",5,1),w("change",function(r){return i._onInputInteraction(r)}),l(),d(6,"div",6),y(7,"div",7)(8,"div",8),l(),d(9,"div",9),y(10,"div",10),l()(),d(11,"label",11),j(12),l()()),t&2&&(_("labelPosition",i.labelPosition),m(2),E("mdc-radio--disabled",i.disabled),m(2),_("id",i.inputId)("checked",i.checked)("disabled",i.disabled&&!i.disabledInteractive)("required",i.required),D("name",i.name)("value",i.value)("aria-label",i.ariaLabel)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-disabled",i.disabled&&i.disabledInteractive?"true":null),m(5),_("matRippleTrigger",i._rippleTrigger.nativeElement)("matRippleDisabled",i._isRippleDisabled())("matRippleCentered",!0),m(2),_("for",i.inputId))},dependencies:[Ie,It],styles:[`.mat-mdc-radio-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-radio-button .mdc-radio {
  display: inline-block;
  position: relative;
  flex: 0 0 auto;
  box-sizing: content-box;
  width: 20px;
  height: 20px;
  cursor: pointer;
  will-change: opacity, transform, border-color, color;
  padding: calc((var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]):not(:focus) ~ .mdc-radio__background::before {
  opacity: 0.04;
  transform: scale(1);
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:not([disabled]) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-hover-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-hover-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:hover > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-hover-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-pressed-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-pressed-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio:active > .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-pressed-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__background {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  position: absolute;
  transform: scale(0, 0);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  content: "";
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  width: var(--mat-radio-state-layer-size, 40px);
  height: var(--mat-radio-state-layer-size, 40px);
  top: calc(-1 * (var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
  left: calc(-1 * (var(--mat-radio-state-layer-size, 40px) - 20px) / 2);
}
.mat-mdc-radio-button .mdc-radio__outer-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-width: 2px;
  border-style: solid;
  border-radius: 50%;
  transition: border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mat-mdc-radio-button .mdc-radio__inner-circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  transform: scale(0);
  border-radius: 50%;
  transition: transform 90ms cubic-bezier(0.4, 0, 0.6, 1), background-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
@media (forced-colors: active) {
  .mat-mdc-radio-button .mdc-radio__inner-circle {
    background-color: CanvasText !important;
  }
}
.mat-mdc-radio-button .mdc-radio__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  top: 0;
  right: 0;
  left: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--mat-radio-state-layer-size, 40px);
  height: var(--mat-radio-state-layer-size, 40px);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle, .mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:focus + .mdc-radio__background::before {
  transform: scale(1);
  opacity: 0.12;
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 1), transform 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-unselected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background {
  cursor: default;
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:disabled + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface, currentColor));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-selected-focus-icon-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-selected-focus-icon-color, var(--mat-sys-primary, currentColor));
}
.mat-mdc-radio-button .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle {
  transform: scale(0.5);
  transition: transform 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled {
  pointer-events: auto;
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:not(:checked) + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-unselected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-unselected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__outer-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus + .mdc-radio__background > .mdc-radio__inner-circle,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control + .mdc-radio__background > .mdc-radio__inner-circle {
  background-color: var(--mat-radio-disabled-selected-icon-color, var(--mat-sys-on-surface, currentColor));
  opacity: var(--mat-radio-disabled-selected-icon-opacity, 0.38);
}
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__background::before,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__outer-circle,
.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__inner-circle {
  transition: none !important;
}
.mat-mdc-radio-button label {
  cursor: pointer;
}
.mat-mdc-radio-button label:empty {
  display: none;
}
.mat-mdc-radio-button .mdc-radio__background::before {
  background-color: var(--mat-radio-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button.mat-mdc-radio-checked .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__background::before {
  background-color: var(--mat-radio-checked-ripple-color, var(--mat-sys-primary));
}
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mat-ripple-element,
.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__background::before {
  background-color: var(--mat-radio-ripple-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button .mat-internal-form-field {
  color: var(--mat-radio-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-radio-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-radio-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-radio-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-radio-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-radio-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-radio-button .mdc-radio--disabled + label {
  color: var(--mat-radio-disabled-label-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-radio-button .mat-radio-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}
.mat-mdc-radio-button .mat-radio-ripple > .mat-ripple-element {
  opacity: 0.14;
}
.mat-mdc-radio-button .mat-radio-ripple::before {
  border-radius: 50%;
}
.mat-mdc-radio-button .mdc-radio > .mdc-radio__native-control:focus:enabled:not(:checked) ~ .mdc-radio__background > .mdc-radio__outer-circle {
  border-color: var(--mat-radio-unselected-focus-icon-color, var(--mat-sys-on-surface));
}
.mat-mdc-radio-button.cdk-focused .mat-focus-indicator::before {
  content: "";
}

.mat-mdc-radio-disabled {
  cursor: default;
  pointer-events: none;
}
.mat-mdc-radio-disabled.mat-mdc-radio-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-radio-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-radio-touch-target-size, 48px);
  width: var(--mat-radio-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--mat-radio-touch-target-display, block);
}
[dir=rtl] .mat-mdc-radio-touch-target {
  left: auto;
  right: 50%;
  transform: translate(50%, -50%);
}
`],encapsulation:2,changeDetection:0})}return a})(),oi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[Te,Mt,N]})}return a})();var xa=["input"],ka=["label"],wa=["*"],ri={color:"accent",clickAction:"check-indeterminate",disabledInteractive:!1},Ca=new L("mat-checkbox-default-options",{providedIn:"root",factory:()=>ri}),Q=(function(a){return a[a.Init=0]="Init",a[a.Checked=1]="Checked",a[a.Unchecked=2]="Unchecked",a[a.Indeterminate=3]="Indeterminate",a})(Q||{}),si=class{source;checked},ci=(()=>{class a{_elementRef=c(F);_changeDetectorRef=c(B);_ngZone=c(J);_animationsDisabled=ye();_options=c(Ca,{optional:!0});focus(){this._inputElement.nativeElement.focus()}_createChangeEvent(e){let t=new si;return t.source=this,t.checked=e,t}_getAnimationTargetElement(){return this._inputElement?.nativeElement}_animationClasses={uncheckedToChecked:"mdc-checkbox--anim-unchecked-checked",uncheckedToIndeterminate:"mdc-checkbox--anim-unchecked-indeterminate",checkedToUnchecked:"mdc-checkbox--anim-checked-unchecked",checkedToIndeterminate:"mdc-checkbox--anim-checked-indeterminate",indeterminateToChecked:"mdc-checkbox--anim-indeterminate-checked",indeterminateToUnchecked:"mdc-checkbox--anim-indeterminate-unchecked"};ariaLabel="";ariaLabelledby=null;ariaDescribedby;ariaExpanded;ariaControls;ariaOwns;_uniqueId;id;get inputId(){return`${this.id||this._uniqueId}-input`}required=!1;labelPosition="after";name=null;change=new C;indeterminateChange=new C;value;disableRipple=!1;_inputElement;_labelElement;tabIndex;color;disabledInteractive;_onTouched=()=>{};_currentAnimationClass="";_currentCheckState=Q.Init;_controlValueAccessorChangeFn=()=>{};_validatorChangeFn=()=>{};constructor(){c(_e).load(Se);let e=c(new mt("tabindex"),{optional:!0});this._options=this._options||ri,this.color=this._options.color||ri.color,this.tabIndex=e==null?0:parseInt(e)||0,this.id=this._uniqueId=c(te).getId("mat-mdc-checkbox-"),this.disabledInteractive=this._options?.disabledInteractive??!1}ngOnChanges(e){e.required&&this._validatorChangeFn()}ngAfterViewInit(){this._syncIndeterminate(this.indeterminate)}get checked(){return this._checked}set checked(e){e!=this.checked&&(this._checked=e,this._changeDetectorRef.markForCheck())}_checked=!1;get disabled(){return this._disabled}set disabled(e){e!==this.disabled&&(this._disabled=e,this._changeDetectorRef.markForCheck())}_disabled=!1;get indeterminate(){return this._indeterminate()}set indeterminate(e){let t=e!=this._indeterminate();this._indeterminate.set(e),t&&(e?this._transitionCheckState(Q.Indeterminate):this._transitionCheckState(this.checked?Q.Checked:Q.Unchecked),this.indeterminateChange.emit(e)),this._syncIndeterminate(e)}_indeterminate=R(!1);_isRippleDisabled(){return this.disableRipple||this.disabled}_onLabelTextChange(){this._changeDetectorRef.detectChanges()}writeValue(e){this.checked=!!e}registerOnChange(e){this._controlValueAccessorChangeFn=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this.disabled=e}validate(e){return this.required&&e.value!==!0?{required:!0}:null}registerOnValidatorChange(e){this._validatorChangeFn=e}_transitionCheckState(e){let t=this._currentCheckState,i=this._getAnimationTargetElement();if(!(t===e||!i)&&(this._currentAnimationClass&&i.classList.remove(this._currentAnimationClass),this._currentAnimationClass=this._getAnimationClassForCheckStateTransition(t,e),this._currentCheckState=e,this._currentAnimationClass.length>0)){i.classList.add(this._currentAnimationClass);let o=this._currentAnimationClass;this._ngZone.runOutsideAngular(()=>{setTimeout(()=>{i.classList.remove(o)},1e3)})}}_emitChangeEvent(){this._controlValueAccessorChangeFn(this.checked),this.change.emit(this._createChangeEvent(this.checked)),this._inputElement&&(this._inputElement.nativeElement.checked=this.checked)}toggle(){this.checked=!this.checked,this._controlValueAccessorChangeFn(this.checked)}_handleInputClick(){let e=this._options?.clickAction;!this.disabled&&e!=="noop"?(this.indeterminate&&e!=="check"&&Promise.resolve().then(()=>{this._indeterminate.set(!1),this.indeterminateChange.emit(!1)}),this._checked=!this._checked,this._transitionCheckState(this._checked?Q.Checked:Q.Unchecked),this._emitChangeEvent()):(this.disabled&&this.disabledInteractive||!this.disabled&&e==="noop")&&(this._inputElement.nativeElement.checked=this.checked,this._inputElement.nativeElement.indeterminate=this.indeterminate)}_onInteractionEvent(e){e.stopPropagation()}_onBlur(){Promise.resolve().then(()=>{this._onTouched(),this._changeDetectorRef.markForCheck()})}_getAnimationClassForCheckStateTransition(e,t){if(this._animationsDisabled)return"";switch(e){case Q.Init:if(t===Q.Checked)return this._animationClasses.uncheckedToChecked;if(t==Q.Indeterminate)return this._checked?this._animationClasses.checkedToIndeterminate:this._animationClasses.uncheckedToIndeterminate;break;case Q.Unchecked:return t===Q.Checked?this._animationClasses.uncheckedToChecked:this._animationClasses.uncheckedToIndeterminate;case Q.Checked:return t===Q.Unchecked?this._animationClasses.checkedToUnchecked:this._animationClasses.checkedToIndeterminate;case Q.Indeterminate:return t===Q.Checked?this._animationClasses.indeterminateToChecked:this._animationClasses.indeterminateToUnchecked}return""}_syncIndeterminate(e){let t=this._inputElement;t&&(t.nativeElement.indeterminate=e)}_onInputClick(){this._handleInputClick()}_onTouchTargetClick(){this._handleInputClick(),this.disabled||this._inputElement.nativeElement.focus()}_preventBubblingFromLabel(e){e.target&&this._labelElement.nativeElement.contains(e.target)&&e.stopPropagation()}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-checkbox"]],viewQuery:function(t,i){if(t&1&&K(xa,5)(ka,5),t&2){let o;I(o=S())&&(i._inputElement=o.first),I(o=S())&&(i._labelElement=o.first)}},hostAttrs:[1,"mat-mdc-checkbox"],hostVars:16,hostBindings:function(t,i){t&2&&(Be("id",i.id),D("tabindex",null)("aria-label",null)("aria-labelledby",null),ge(i.color?"mat-"+i.color:"mat-accent"),E("_mat-animation-noopable",i._animationsDisabled)("mdc-checkbox--disabled",i.disabled)("mat-mdc-checkbox-disabled",i.disabled)("mat-mdc-checkbox-checked",i.checked)("mat-mdc-checkbox-disabled-interactive",i.disabledInteractive))},inputs:{ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],ariaExpanded:[2,"aria-expanded","ariaExpanded",g],ariaControls:[0,"aria-controls","ariaControls"],ariaOwns:[0,"aria-owns","ariaOwns"],id:"id",required:[2,"required","required",g],labelPosition:"labelPosition",name:"name",value:"value",disableRipple:[2,"disableRipple","disableRipple",g],tabIndex:[2,"tabIndex","tabIndex",e=>e==null?void 0:X(e)],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",g],checked:[2,"checked","checked",g],disabled:[2,"disabled","disabled",g],indeterminate:[2,"indeterminate","indeterminate",g]},outputs:{change:"change",indeterminateChange:"indeterminateChange"},exportAs:["matCheckbox"],features:[G([{provide:wt,useExisting:st(()=>a),multi:!0},{provide:hn,useExisting:a,multi:!0}]),ue],ngContentSelectors:wa,decls:15,vars:23,consts:[["checkbox",""],["input",""],["label",""],["mat-internal-form-field","",3,"click","labelPosition"],[1,"mdc-checkbox"],["aria-hidden","true",1,"mat-mdc-checkbox-touch-target",3,"click"],["type","checkbox",1,"mdc-checkbox__native-control",3,"blur","click","change","checked","indeterminate","disabled","id","required","tabIndex"],["aria-hidden","true",1,"mdc-checkbox__ripple"],["aria-hidden","true",1,"mdc-checkbox__background"],["focusable","false","viewBox","0 0 24 24",1,"mdc-checkbox__checkmark"],["fill","none","d","M1.73,12.91 8.1,19.28 22.79,4.59",1,"mdc-checkbox__checkmark-path"],[1,"mdc-checkbox__mixedmark"],["mat-ripple","","aria-hidden","true",1,"mat-mdc-checkbox-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mdc-label",3,"for"]],template:function(t,i){if(t&1&&($(),d(0,"div",3),w("click",function(r){return i._preventBubblingFromLabel(r)}),d(1,"div",4,0)(3,"div",5),w("click",function(){return i._onTouchTargetClick()}),l(),d(4,"input",6,1),w("blur",function(){return i._onBlur()})("click",function(){return i._onInputClick()})("change",function(r){return i._onInteractionEvent(r)}),l(),y(6,"div",7),d(7,"div",8),se(),d(8,"svg",9),y(9,"path",10),l(),Qe(),y(10,"div",11),l(),y(11,"div",12),l(),d(12,"label",13,2),j(14),l()()),t&2){let o=V(2);_("labelPosition",i.labelPosition),m(4),E("mdc-checkbox--selected",i.checked),_("checked",i.checked)("indeterminate",i.indeterminate)("disabled",i.disabled&&!i.disabledInteractive)("id",i.inputId)("required",i.required)("tabIndex",i.disabled&&!i.disabledInteractive?-1:i.tabIndex),D("aria-label",i.ariaLabel||null)("aria-labelledby",i.ariaLabelledby)("aria-describedby",i.ariaDescribedby)("aria-checked",i.indeterminate?"mixed":null)("aria-controls",i.ariaControls)("aria-disabled",i.disabled&&i.disabledInteractive?!0:null)("aria-expanded",i.ariaExpanded)("aria-owns",i.ariaOwns)("name",i.name)("value",i.value),m(7),_("matRippleTrigger",o)("matRippleDisabled",i.disableRipple||i.disabled)("matRippleCentered",!0),m(),_("for",i.inputId)}},dependencies:[Ie,It],styles:[`.mdc-checkbox {
  display: inline-block;
  position: relative;
  flex: 0 0 18px;
  box-sizing: content-box;
  width: 18px;
  height: 18px;
  line-height: 0;
  white-space: nowrap;
  cursor: pointer;
  vertical-align: bottom;
  padding: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  margin: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}
.mdc-checkbox:hover > .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:hover > .mat-mdc-checkbox-ripple > .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control:focus ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-focus-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-unselected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-unselected-pressed-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-hover-state-layer-opacity, var(--mat-sys-hover-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-hover-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-focus-state-layer-opacity, var(--mat-sys-focus-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox .mdc-checkbox__native-control:focus:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-focus-state-layer-color, var(--mat-sys-primary));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked + .mdc-checkbox__ripple {
  opacity: var(--mat-checkbox-selected-pressed-state-layer-opacity, var(--mat-sys-pressed-state-layer-opacity));
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox:active > .mdc-checkbox__native-control:checked ~ .mat-mdc-checkbox-ripple .mat-ripple-element {
  background-color: var(--mat-checkbox-selected-pressed-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control ~ .mat-mdc-checkbox-ripple .mat-ripple-element,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control + .mdc-checkbox__ripple {
  background-color: var(--mat-checkbox-unselected-hover-state-layer-color, var(--mat-sys-on-surface));
}
.mdc-checkbox .mdc-checkbox__native-control {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
  width: var(--mat-checkbox-state-layer-size, 40px);
  height: var(--mat-checkbox-state-layer-size, 40px);
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  right: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - var(--mat-checkbox-state-layer-size, 40px)) / 2);
}

.mdc-checkbox--disabled {
  cursor: default;
  pointer-events: none;
}

.mdc-checkbox__background {
  display: inline-flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-radius: 2px;
  background-color: transparent;
  pointer-events: none;
  will-change: background-color, border-color;
  transition: background-color 90ms cubic-bezier(0.4, 0, 0.6, 1), border-color 90ms cubic-bezier(0.4, 0, 0.6, 1);
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  border-color: var(--mat-checkbox-unselected-icon-color, var(--mat-sys-on-surface-variant));
  top: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
  left: calc((var(--mat-checkbox-state-layer-size, 40px) - 18px) / 2);
}

.mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:enabled:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}
@media (forced-colors: active) {
  .mdc-checkbox__native-control:disabled:checked ~ .mdc-checkbox__background,
  .mdc-checkbox__native-control:disabled:indeterminate ~ .mdc-checkbox__background {
    border-color: GrayText;
  }
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-hover-icon-color, var(--mat-sys-on-surface));
  background-color: transparent;
}

.mdc-checkbox:hover > .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox:hover > .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-hover-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox__native-control:focus:focus:not(:checked) ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:not(:indeterminate) ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-unselected-focus-icon-color, var(--mat-sys-on-surface));
}

.mdc-checkbox__native-control:focus:focus:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:focus:focus:indeterminate ~ .mdc-checkbox__background {
  border-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
  background-color: var(--mat-checkbox-selected-focus-icon-color, var(--mat-sys-primary));
}

.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
  border-color: var(--mat-checkbox-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox:hover > .mdc-checkbox__native-control ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox .mdc-checkbox__native-control:focus ~ .mdc-checkbox__background,
  .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__background {
    border-color: GrayText;
  }
}
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  background-color: var(--mat-checkbox-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
  border-color: transparent;
}

.mdc-checkbox__checkmark {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 180ms cubic-bezier(0.4, 0, 0.6, 1);
  color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__checkmark {
    color: CanvasText;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
  color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__checkmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__checkmark {
    color: GrayText;
  }
}

.mdc-checkbox__checkmark-path {
  transition: stroke-dashoffset 180ms cubic-bezier(0.4, 0, 0.6, 1);
  stroke: currentColor;
  stroke-width: 3.12px;
  stroke-dashoffset: 29.7833385;
  stroke-dasharray: 29.7833385;
}

.mdc-checkbox__mixedmark {
  width: 100%;
  height: 0;
  transform: scaleX(0) rotate(0deg);
  border-width: 1px;
  border-style: solid;
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
  border-color: var(--mat-checkbox-selected-checkmark-color, var(--mat-sys-on-primary));
}
@media (forced-colors: active) {
  .mdc-checkbox__mixedmark {
    margin: 0 1px;
  }
}

.mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
  border-color: var(--mat-checkbox-disabled-selected-checkmark-color, var(--mat-sys-surface));
}
@media (forced-colors: active) {
  .mdc-checkbox--disabled .mdc-checkbox__mixedmark, .mdc-checkbox--disabled.mat-mdc-checkbox-disabled-interactive .mdc-checkbox__mixedmark {
    border-color: GrayText;
  }
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,
.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,
.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,
.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background {
  animation-duration: 180ms;
  animation-timing-function: linear;
}

.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-unchecked-checked-checkmark-path 180ms linear;
  transition: none;
}

.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path {
  animation: mdc-checkbox-checked-unchecked-checkmark-path 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark {
  animation: mdc-checkbox-checked-indeterminate-checkmark 90ms linear;
  transition: none;
}
.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-checked-indeterminate-mixedmark 90ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark {
  animation: mdc-checkbox-indeterminate-checked-checkmark 500ms linear;
  transition: none;
}
.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-checked-mixedmark 500ms linear;
  transition: none;
}

.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark {
  animation: mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear;
  transition: none;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background {
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 1), background-color 90ms cubic-bezier(0, 0, 0.2, 1);
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path {
  stroke-dashoffset: 0;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transition: opacity 180ms cubic-bezier(0, 0, 0.2, 1), transform 180ms cubic-bezier(0, 0, 0.2, 1);
  opacity: 1;
}
.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(-45deg);
}

.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__checkmark {
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 90ms cubic-bezier(0.4, 0, 0.6, 1), transform 90ms cubic-bezier(0.4, 0, 0.6, 1);
}
.mdc-checkbox__native-control:indeterminate ~ .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transform: scaleX(1) rotate(0deg);
  opacity: 1;
}

@keyframes mdc-checkbox-unchecked-checked-checkmark-path {
  0%, 50% {
    stroke-dashoffset: 29.7833385;
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark {
  0%, 68.2% {
    transform: scaleX(0);
  }
  68.2% {
    animation-timing-function: cubic-bezier(0, 0, 0, 1);
  }
  100% {
    transform: scaleX(1);
  }
}
@keyframes mdc-checkbox-checked-unchecked-checkmark-path {
  from {
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
    opacity: 1;
    stroke-dashoffset: 0;
  }
  to {
    opacity: 0;
    stroke-dashoffset: -29.7833385;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-checkmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(45deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-checkmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(45deg);
    opacity: 0;
  }
  to {
    transform: rotate(360deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-checked-indeterminate-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: rotate(-45deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}
@keyframes mdc-checkbox-indeterminate-checked-mixedmark {
  from {
    animation-timing-function: cubic-bezier(0.14, 0, 0, 1);
    transform: rotate(0deg);
    opacity: 1;
  }
  to {
    transform: rotate(315deg);
    opacity: 0;
  }
}
@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark {
  0% {
    animation-timing-function: linear;
    transform: scaleX(1);
    opacity: 1;
  }
  32.8%, 100% {
    transform: scaleX(0);
    opacity: 0;
  }
}
.mat-mdc-checkbox {
  display: inline-block;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-touch-target,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__native-control,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__ripple,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mat-mdc-checkbox-ripple::before,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__checkmark > .mdc-checkbox__checkmark-path,
.mat-mdc-checkbox._mat-animation-noopable > .mat-internal-form-field > .mdc-checkbox > .mdc-checkbox__background > .mdc-checkbox__mixedmark {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-checkbox label {
  cursor: pointer;
}
.mat-mdc-checkbox .mat-internal-form-field {
  color: var(--mat-checkbox-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-checkbox-label-text-font, var(--mat-sys-body-medium-font));
  line-height: var(--mat-checkbox-label-text-line-height, var(--mat-sys-body-medium-line-height));
  font-size: var(--mat-checkbox-label-text-size, var(--mat-sys-body-medium-size));
  letter-spacing: var(--mat-checkbox-label-text-tracking, var(--mat-sys-body-medium-tracking));
  font-weight: var(--mat-checkbox-label-text-weight, var(--mat-sys-body-medium-weight));
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled.mat-mdc-checkbox-disabled-interactive input {
  cursor: default;
}
.mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
  cursor: default;
  color: var(--mat-checkbox-disabled-label-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-mdc-checkbox.mat-mdc-checkbox-disabled label {
    color: GrayText;
  }
}
.mat-mdc-checkbox label:empty {
  display: none;
}
.mat-mdc-checkbox .mdc-checkbox__ripple {
  opacity: 0;
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple,
.mdc-checkbox__ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.mat-mdc-checkbox .mat-mdc-checkbox-ripple:not(:empty),
.mdc-checkbox__ripple:not(:empty) {
  transform: translateZ(0);
}

.mat-mdc-checkbox-ripple .mat-ripple-element {
  opacity: 0.1;
}

.mat-mdc-checkbox-touch-target {
  position: absolute;
  top: 50%;
  left: 50%;
  height: var(--mat-checkbox-touch-target-size, 48px);
  width: var(--mat-checkbox-touch-target-size, 48px);
  transform: translate(-50%, -50%);
  display: var(--mat-checkbox-touch-target-display, block);
}

.mat-mdc-checkbox .mat-mdc-checkbox-ripple::before {
  border-radius: 50%;
}

.mdc-checkbox__native-control:focus-visible ~ .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2,changeDetection:0})}return a})(),li=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[ci,N]})}return a})();var di=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[N]})}return a})();var Ia=["*"];function Sa(a,n){a&1&&j(0)}var mi=(()=>{class a{_elementRef=c(F);constructor(){}focus(){this._elementRef.nativeElement.focus()}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkStepHeader",""]],hostAttrs:["role","tab"]})}return a})(),hi=(()=>{class a{template=c(le);constructor(){}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkStepLabel",""]]})}return a})();var Le={NUMBER:"number",EDIT:"edit",DONE:"done",ERROR:"error"},Ta=new L("STEPPER_GLOBAL_OPTIONS"),Pt=(()=>{class a{_stepperOptions;_stepper=c(Et);_displayDefaultIndicatorType;stepLabel;_childForms;content;stepControl;get interacted(){return this._interacted()}set interacted(e){this._interacted.set(e)}_interacted=R(!1);interactedStream=new C;label;errorMessage;ariaLabel;ariaLabelledby;get state(){return this._state()}set state(e){this._state.set(e)}_state=R(void 0);get editable(){return this._editable()}set editable(e){this._editable.set(e)}_editable=R(!0);optional=!1;get completed(){let e=this._completedOverride(),t=this._interacted();return e??(t&&(!this.stepControl||this.stepControl.valid))}set completed(e){this._completedOverride.set(e)}_completedOverride=R(null);index=R(-1);isSelected=dt(()=>this._stepper.selectedIndex===this.index());indicatorType=dt(()=>{let e=this.isSelected(),t=this.completed,i=this._state()??Le.NUMBER,o=this._editable();return this._showError()&&this.hasError&&!e?Le.ERROR:this._displayDefaultIndicatorType?!t||e?Le.NUMBER:o?Le.EDIT:Le.DONE:t&&!e?Le.DONE:t&&e?i:o&&e?Le.EDIT:i});isNavigable=dt(()=>{let e=this.isSelected();return this.completed||e||!this._stepper.linear});get hasError(){let e=this._customError();return e??this._getDefaultError()}set hasError(e){this._customError.set(e)}_customError=R(null);_getDefaultError(){return this.interacted&&!!this.stepControl?.invalid}constructor(){let e=c(Ta,{optional:!0});this._stepperOptions=e||{},this._displayDefaultIndicatorType=this._stepperOptions.displayDefaultIndicatorType!==!1}select(){this._stepper.selected=this}reset(){this._interacted.set(!1),this._completedOverride()!=null&&this._completedOverride.set(!1),this._customError()!=null&&this._customError.set(!1),this.stepControl&&(this._childForms?.forEach(e=>e.resetForm?.()),this.stepControl.reset())}ngOnChanges(){this._stepper._stateChanged()}_markAsInteracted(){this._interacted()||(this._interacted.set(!0),this.interactedStream.emit(this))}_showError(){return this._stepperOptions.showError??this._customError()!=null}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["cdk-step"]],contentQueries:function(t,i,o){if(t&1&&ae(o,hi,5)(o,pn,5),t&2){let r;I(r=S())&&(i.stepLabel=r.first),I(r=S())&&(i._childForms=r)}},viewQuery:function(t,i){if(t&1&&K(le,7),t&2){let o;I(o=S())&&(i.content=o.first)}},inputs:{stepControl:"stepControl",label:"label",errorMessage:"errorMessage",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],state:"state",editable:[2,"editable","editable",g],optional:[2,"optional","optional",g],completed:[2,"completed","completed",g],hasError:[2,"hasError","hasError",g]},outputs:{interactedStream:"interacted"},exportAs:["cdkStep"],features:[ue],ngContentSelectors:Ia,decls:1,vars:0,template:function(t,i){t&1&&($(),We(0,Sa,1,0,"ng-template"))},encapsulation:2,changeDetection:0})}return a})(),Et=(()=>{class a{_dir=c(De,{optional:!0});_changeDetectorRef=c(B);_elementRef=c(F);_destroyed=new k;_keyManager;_steps;steps=new Pe;_stepHeader;_sortedHeaders=new Pe;get linear(){return this._linear()}set linear(e){this._linear.set(e)}_linear=R(!1);get selectedIndex(){return this._selectedIndex()}set selectedIndex(e){this._steps?(this._isValidIndex(e),this.selectedIndex!==e&&(this.selected?._markAsInteracted(),!this._anyControlsInvalidOrPending(e)&&(e>=this.selectedIndex||this.steps.toArray()[e].editable)&&this._updateSelectedItemIndex(e))):this._selectedIndex.set(e)}_selectedIndex=R(0);get selected(){return this.steps?this.steps.toArray()[this.selectedIndex]:void 0}set selected(e){this.selectedIndex=e&&this.steps?this.steps.toArray().indexOf(e):-1}selectionChange=new C;selectedIndexChange=new C;_groupId=c(te).getId("cdk-stepper-");get orientation(){return this._orientation}set orientation(e){this._orientation=e,this._keyManager&&this._keyManager.withVerticalOrientation(e==="vertical")}_orientation="horizontal";constructor(){}ngAfterContentInit(){this._steps.changes.pipe(Y(this._steps),W(this._destroyed)).subscribe(e=>{this.steps.reset(e.filter(t=>t._stepper===this)),this.steps.forEach((t,i)=>t.index.set(i)),this.steps.notifyOnChanges()})}ngAfterViewInit(){if(this._stepHeader.changes.pipe(Y(this._stepHeader),W(this._destroyed)).subscribe(e=>{this._sortedHeaders.reset(e.toArray().sort((t,i)=>t._elementRef.nativeElement.compareDocumentPosition(i._elementRef.nativeElement)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)),this._sortedHeaders.notifyOnChanges()}),this._keyManager=new ft(this._sortedHeaders).withWrap().withHomeAndEnd().withVerticalOrientation(this._orientation==="vertical"),this._keyManager.updateActiveItem(this.selectedIndex),(this._dir?this._dir.change:Ge()).pipe(Y(this._layoutDirection()),W(this._destroyed)).subscribe(e=>this._keyManager?.withHorizontalOrientation(e)),this._keyManager.updateActiveItem(this.selectedIndex),this.steps.changes.subscribe(()=>{this.selected||this._selectedIndex.set(Math.max(this.selectedIndex-1,0))}),this._isValidIndex(this.selectedIndex)||this._selectedIndex.set(0),this.linear&&this.selectedIndex>0){let e=this.steps.toArray().slice(0,this._selectedIndex());for(let t of e)t._markAsInteracted()}}ngOnDestroy(){this._keyManager?.destroy(),this.steps.destroy(),this._sortedHeaders.destroy(),this._destroyed.next(),this._destroyed.complete()}next(){this.selectedIndex=Math.min(this._selectedIndex()+1,this.steps.length-1)}previous(){this.selectedIndex=Math.max(this._selectedIndex()-1,0)}reset(){this._updateSelectedItemIndex(0),this.steps.forEach(e=>e.reset()),this._stateChanged()}_getStepLabelId(e){return`${this._groupId}-label-${e}`}_getStepContentId(e){return`${this._groupId}-content-${e}`}_stateChanged(){this._changeDetectorRef.markForCheck()}_getAnimationDirection(e){let t=e-this._selectedIndex();return t<0?this._layoutDirection()==="rtl"?"next":"previous":t>0?this._layoutDirection()==="rtl"?"previous":"next":"current"}_getFocusIndex(){return this._keyManager?this._keyManager.activeItemIndex:this._selectedIndex()}_updateSelectedItemIndex(e){let t=this.steps.toArray(),i=this._selectedIndex();this.selectionChange.emit({selectedIndex:e,previouslySelectedIndex:i,selectedStep:t[e],previouslySelectedStep:t[i]}),this._keyManager&&(this._containsFocus()?this._keyManager.setActiveItem(e):this._keyManager.updateActiveItem(e)),this._selectedIndex.set(e),this.selectedIndexChange.emit(e),this._stateChanged()}_onKeydown(e){let t=gt(e),i=e.keyCode,o=this._keyManager;o?.activeItemIndex!=null&&!t&&(i===32||i===13)?(this.selectedIndex=o.activeItemIndex,e.preventDefault()):o?.setFocusOrigin("keyboard").onKeydown(e)}_anyControlsInvalidOrPending(e){return this.linear&&e>=0?this.steps.toArray().slice(0,e).some(t=>{let i=t.stepControl;return(i?i.invalid||i.pending||!t.interacted:!t.completed)&&!t.optional&&!t._completedOverride()}):!1}_layoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_containsFocus(){let e=this._elementRef.nativeElement,t=Ui();return e===t||e.contains(t)}_isValidIndex(e){return e>-1&&(!this.steps||e<this.steps.length)}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkStepper",""]],contentQueries:function(t,i,o){if(t&1&&ae(o,Pt,5)(o,mi,5),t&2){let r;I(r=S())&&(i._steps=r),I(r=S())&&(i._stepHeader=r)}},inputs:{linear:[2,"linear","linear",g],selectedIndex:[2,"selectedIndex","selectedIndex",X],selected:"selected",orientation:"orientation"},outputs:{selectionChange:"selectionChange",selectedIndexChange:"selectedIndexChange"},exportAs:["cdkStepper"]})}return a})();var Tn=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[N]})}return a})();var Ma=(a,n,e)=>({index:a,active:n,optional:e});function Pa(a,n){if(a&1&&pe(0,2),a&2){let e=u();_("ngTemplateOutlet",e.iconOverrides[e.state])("ngTemplateOutletContext",Qi(2,Ma,e.index,e.active,e.optional))}}function Ea(a,n){if(a&1&&(d(0,"span",7),b(1),l()),a&2){let e=u(2);m(),ee(e._getDefaultTextForState(e.state))}}function Ra(a,n){if(a&1&&(d(0,"span",8),b(1),l()),a&2){let e=u(3);m(),ee(e._intl.completedLabel)}}function La(a,n){if(a&1&&(d(0,"span",8),b(1),l()),a&2){let e=u(3);m(),ee(e._intl.editableLabel)}}function Oa(a,n){if(a&1&&(f(0,Ra,2,1,"span",8)(1,La,2,1,"span",8),d(2,"mat-icon",7),b(3),l()),a&2){let e=u(2);v(e.state==="done"?0:e.state==="edit"?1:-1),m(3),ee(e._getDefaultTextForState(e.state))}}function Aa(a,n){if(a&1&&f(0,Ea,2,1,"span",7)(1,Oa,4,2),a&2){let e,t=u();v((e=t.state)==="number"?0:1)}}function za(a,n){a&1&&(d(0,"div",4),pe(1,9),l()),a&2&&(m(),_("ngTemplateOutlet",n.template))}function Fa(a,n){if(a&1&&(d(0,"div",4),b(1),l()),a&2){let e=u();m(),ee(e.label)}}function Ba(a,n){if(a&1&&(d(0,"div",5),b(1),l()),a&2){let e=u();m(),ee(e._intl.optionalLabel)}}function Na(a,n){if(a&1&&(d(0,"div",6),b(1),l()),a&2){let e=u();m(),ee(e.errorMessage)}}var Mn=["*"];function Ha(a,n){}function Va(a,n){if(a&1&&(j(0),Ce(1,Ha,0,0,"ng-template",0)),a&2){let e=u();m(),_("cdkPortalOutlet",e._portal)}}var ja=["animatedContainer"],Pn=a=>({steps:a}),En=a=>({step:a});function Ga(a,n){a&1&&j(0)}function Qa(a,n){if(a&1&&(d(0,"div",5),pe(1,9)(2,6),l()),a&2){let e=u(2),t=V(6);m(),_("ngTemplateOutlet",e.headerPrefix()),m(),_("ngTemplateOutlet",t)("ngTemplateOutletContext",fe(3,Pn,e.steps))}}function qa(a,n){if(a&1&&pe(0,6),a&2){let e=u(2),t=V(6);_("ngTemplateOutlet",t)("ngTemplateOutletContext",fe(2,Pn,e.steps))}}function Wa(a,n){if(a&1&&(d(0,"div",10,2),pe(2,9),l()),a&2){let e=n.$implicit,t=n.$index,i=u(2);ge("mat-horizontal-stepper-content-"+i._getAnimationDirection(t)),_("id",i._getStepContentId(t)),D("aria-labelledby",i._getStepLabelId(t))("inert",i.selectedIndex===t?null:""),m(2),_("ngTemplateOutlet",e.content)}}function $a(a,n){if(a&1&&(d(0,"div",3),f(1,Qa,3,5,"div",5)(2,qa,1,4,"ng-container",6),d(3,"div",7),me(4,Wa,3,6,"div",8,de),l()()),a&2){let e=u();m(),v(e.headerPrefix()?1:2),m(3),he(e.steps)}}function Ua(a,n){if(a&1&&pe(0,9),a&2){let e=u(2);_("ngTemplateOutlet",e.headerPrefix())}}function Ya(a,n){if(a&1&&(d(0,"div",11),pe(1,6),d(2,"div",12,2)(4,"div",13)(5,"div",14),pe(6,9),l()()()()),a&2){let e=n.$implicit,t=n.$index,i=n.$index,o=n.$count,r=u(2),s=V(4);m(),_("ngTemplateOutlet",s)("ngTemplateOutletContext",fe(11,En,e)),m(),E("mat-stepper-vertical-line",i!==o-1)("mat-vertical-content-container-active",r.selectedIndex===t),D("inert",r.selectedIndex===t?null:"")("aria-label",r.ariaLabel),m(2),_("id",r._getStepContentId(t)),D("aria-labelledby",r._getStepLabelId(t)),m(2),_("ngTemplateOutlet",e.content)}}function Za(a,n){if(a&1&&(d(0,"div",4),f(1,Ua,1,1,"ng-container",9),me(2,Ya,7,13,"div",11,de),l()),a&2){let e=u();m(),v(e.headerPrefix()?1:-1),m(),he(e.steps)}}function Ka(a,n){if(a&1){let e=Z();d(0,"mat-step-header",15),w("click",function(){let i=A(e).step;return z(i.select())})("keydown",function(i){A(e);let o=u();return z(o._onKeydown(i))}),l()}if(a&2){let e=n.step,t=u();E("mat-horizontal-stepper-header",t.orientation==="horizontal")("mat-vertical-stepper-header",t.orientation==="vertical"),_("tabIndex",t._getFocusIndex()===e.index()?0:-1)("id",t._getStepLabelId(e.index()))("index",e.index())("state",e.indicatorType())("label",e.stepLabel||e.label)("selected",e.isSelected())("active",e.isNavigable())("optional",e.optional)("errorMessage",e.errorMessage)("iconOverrides",t._iconOverrides)("disableRipple",t.disableRipple||!e.isNavigable())("color",e.color||t.color),D("role",t.orientation==="horizontal"?"tab":"button")("aria-posinset",t.orientation==="horizontal"?e.index()+1:null)("aria-setsize",t.orientation==="horizontal"?t.steps.length:null)("aria-selected",t.orientation==="horizontal"?e.isSelected():null)("aria-current",t.orientation==="vertical"&&e.isSelected()?"step":null)("aria-disabled",t.orientation==="vertical"&&e.isSelected()?"true":null)("aria-expanded",t.orientation==="vertical"?e.isSelected():null)("aria-controls",t._getStepContentId(e.index()))("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null)("aria-disabled",e.isNavigable()?null:!0)}}function Xa(a,n){a&1&&y(0,"div",17)}function Ja(a,n){if(a&1&&(pe(0,6),f(1,Xa,1,0,"div",17)),a&2){let e=n.$implicit,t=n.$index,i=n.$count;u(2);let o=V(4);_("ngTemplateOutlet",o)("ngTemplateOutletContext",fe(3,En,e)),m(),v(t!==i-1?1:-1)}}function eo(a,n){if(a&1&&(d(0,"div",16),me(1,Ja,2,5,null,null,de),l()),a&2){let e=n.steps,t=u();D("aria-label",t.ariaLabel),m(),he(e)}}var pi=(()=>{class a extends hi{static \u0275fac=(()=>{let e;return function(i){return(e||(e=qe(a)))(i||a)}})();static \u0275dir=O({type:a,selectors:[["","matStepLabel",""]],features:[be]})}return a})(),to=(()=>{class a{changes=new k;optionalLabel="Optional";completedLabel="Completed";editableLabel="Editable";static \u0275fac=function(t){return new(t||a)};static \u0275prov=ke({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})(),_i=(()=>{class a extends mi{_intl=c(to);_focusMonitor=c(Re);_intlSubscription;state;label;errorMessage;iconOverrides;index;selected=!1;active=!1;optional=!1;disableRipple=!1;color;constructor(){super();let e=c(_e);e.load(Se),e.load(Yi);let t=c(B);this._intlSubscription=this._intl.changes.subscribe(()=>t.markForCheck())}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0)}ngOnDestroy(){this._intlSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._elementRef)}focus(e,t){e?this._focusMonitor.focusVia(this._elementRef,e,t):this._elementRef.nativeElement.focus(t)}_stringLabel(){return this.label instanceof pi?null:this.label}_templateLabel(){return this.label instanceof pi?this.label:null}_getHostElement(){return this._elementRef.nativeElement}_getDefaultTextForState(e){return e=="number"?`${this.index+1}`:e=="edit"?"create":e=="error"?"warning":e}_hasEmptyLabel(){return!this._stringLabel()&&!this._templateLabel()&&!this._hasOptionalLabel()&&!this._hasErrorLabel()}_hasOptionalLabel(){return this.optional&&this.state!=="error"}_hasErrorLabel(){return this.state==="error"}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-step-header"]],hostAttrs:["role","",1,"mat-step-header"],hostVars:4,hostBindings:function(t,i){t&2&&(ge("mat-"+(i.color||"primary")),E("mat-step-header-empty-label",i._hasEmptyLabel()))},inputs:{state:"state",label:"label",errorMessage:"errorMessage",iconOverrides:"iconOverrides",index:"index",selected:"selected",active:"active",optional:"optional",disableRipple:"disableRipple",color:"color"},features:[be],decls:10,vars:17,consts:[["matRipple","",1,"mat-step-header-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"],[1,"mat-step-icon-content"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-step-label"],[1,"mat-step-text-label"],[1,"mat-step-optional"],[1,"mat-step-sub-label-error"],["aria-hidden","true"],[1,"cdk-visually-hidden"],[3,"ngTemplateOutlet"]],template:function(t,i){if(t&1&&(y(0,"div",0),d(1,"div")(2,"div",1),f(3,Pa,1,6,"ng-container",2)(4,Aa,2,1),l()(),d(5,"div",3),f(6,za,2,1,"div",4)(7,Fa,2,1,"div",4),f(8,Ba,2,1,"div",5),f(9,Na,2,1,"div",6),l()),t&2){let o;_("matRippleTrigger",i._getHostElement())("matRippleDisabled",i.disableRipple),m(),ge(Gi("mat-step-icon-state-",i.state," mat-step-icon")),E("mat-step-icon-selected",i.selected),m(2),v(i.iconOverrides&&i.iconOverrides[i.state]?3:4),m(2),E("mat-step-label-active",i.active)("mat-step-label-selected",i.selected)("mat-step-label-error",i.state=="error"),m(),v((o=i._templateLabel())?6:i._stringLabel()?7:-1,o),m(2),v(i._hasOptionalLabel()?8:-1),m(),v(i._hasErrorLabel()?9:-1)}},dependencies:[Ie,qt,_t],styles:[`.mat-step-header {
  overflow: hidden;
  outline: none;
  cursor: pointer;
  position: relative;
  box-sizing: content-box;
  -webkit-tap-highlight-color: transparent;
}
.mat-step-header:focus-visible .mat-focus-indicator::before {
  content: "";
}
.mat-step-header:hover[aria-disabled=true] {
  cursor: default;
}
.mat-step-header:hover:not([aria-disabled]), .mat-step-header:hover[aria-disabled=false] {
  background-color: var(--mat-stepper-header-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
  border-radius: var(--mat-stepper-header-hover-state-layer-shape, var(--mat-sys-corner-medium));
}
.mat-step-header.cdk-keyboard-focused, .mat-step-header.cdk-program-focused {
  background-color: var(--mat-stepper-header-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
  border-radius: var(--mat-stepper-header-focus-state-layer-shape, var(--mat-sys-corner-medium));
}
@media (hover: none) {
  .mat-step-header:hover {
    background: none;
  }
}
@media (forced-colors: active) {
  .mat-step-header {
    outline: solid 1px;
  }
  .mat-step-header[aria-selected=true] .mat-step-label {
    text-decoration: underline;
  }
  .mat-step-header[aria-disabled=true] {
    outline-color: GrayText;
  }
  .mat-step-header[aria-disabled=true] .mat-step-label,
  .mat-step-header[aria-disabled=true] .mat-step-icon,
  .mat-step-header[aria-disabled=true] .mat-step-optional {
    color: GrayText;
  }
}

.mat-step-optional {
  font-size: 12px;
  color: var(--mat-stepper-header-optional-label-text-color, var(--mat-sys-on-surface-variant));
}

.mat-step-sub-label-error {
  font-size: 12px;
  font-weight: normal;
}

.mat-step-icon {
  border-radius: 50%;
  height: 24px;
  width: 24px;
  flex-shrink: 0;
  position: relative;
  color: var(--mat-stepper-header-icon-foreground-color, var(--mat-sys-surface));
  background-color: var(--mat-stepper-header-icon-background-color, var(--mat-sys-on-surface-variant));
}

.mat-step-icon-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
}

.mat-step-icon .mat-icon {
  font-size: 16px;
  height: 16px;
  width: 16px;
}

.mat-step-icon-state-error {
  background-color: var(--mat-stepper-header-error-state-icon-background-color, transparent);
  color: var(--mat-stepper-header-error-state-icon-foreground-color, var(--mat-sys-error));
}
.mat-step-icon-state-error .mat-icon {
  font-size: 24px;
  height: 24px;
  width: 24px;
}

.mat-step-label {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 50px;
  vertical-align: middle;
  font-family: var(--mat-stepper-header-label-text-font, var(--mat-sys-title-small-font));
  font-size: var(--mat-stepper-header-label-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-stepper-header-label-text-weight, var(--mat-sys-title-small-weight));
  color: var(--mat-stepper-header-label-text-color, var(--mat-sys-on-surface-variant));
}
.mat-step-label.mat-step-label-active {
  color: var(--mat-stepper-header-selected-state-label-text-color, var(--mat-sys-on-surface-variant));
}
.mat-step-label.mat-step-label-error {
  color: var(--mat-stepper-header-error-state-label-text-color, var(--mat-sys-error));
  font-size: var(--mat-stepper-header-error-state-label-text-size, var(--mat-sys-title-small-size));
}
.mat-step-label.mat-step-label-selected {
  font-size: var(--mat-stepper-header-selected-state-label-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-stepper-header-selected-state-label-text-weight, var(--mat-sys-title-small-weight));
}
.mat-step-header-empty-label .mat-step-label {
  min-width: 0;
}

.mat-step-text-label {
  text-overflow: ellipsis;
  overflow: hidden;
}

.mat-step-header .mat-step-header-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}

.mat-step-icon-selected {
  background-color: var(--mat-stepper-header-selected-state-icon-background-color, var(--mat-sys-primary));
  color: var(--mat-stepper-header-selected-state-icon-foreground-color, var(--mat-sys-on-primary));
}

.mat-step-icon-state-done {
  background-color: var(--mat-stepper-header-done-state-icon-background-color, var(--mat-sys-primary));
  color: var(--mat-stepper-header-done-state-icon-foreground-color, var(--mat-sys-on-primary));
}

.mat-step-icon-state-edit {
  background-color: var(--mat-stepper-header-edit-state-icon-background-color, var(--mat-sys-primary));
  color: var(--mat-stepper-header-edit-state-icon-foreground-color, var(--mat-sys-on-primary));
}
`],encapsulation:2,changeDetection:0})}return a})(),io=(()=>{class a{templateRef=c(le);name;constructor(){}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["ng-template","matStepperIcon",""]],inputs:{name:[0,"matStepperIcon","name"]}})}return a})(),no=(()=>{class a{_template=c(le);constructor(){}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["ng-template","matStepContent",""]]})}return a})(),ao=(()=>{class a extends Pt{_errorStateMatcher=c(Ct,{skipSelf:!0});_viewContainerRef=c(Fe);_isSelected=ne.EMPTY;stepLabel=void 0;color;_lazyContent;_portal;ngAfterContentInit(){this._isSelected=this._stepper.steps.changes.pipe(Me(()=>this._stepper.selectionChange.pipe(ot(e=>e.selectedStep===this),Y(this._stepper.selected===this)))).subscribe(e=>{e&&this._lazyContent&&!this._portal&&(this._portal=new xt(this._lazyContent._template,this._viewContainerRef))})}ngOnDestroy(){this._isSelected.unsubscribe()}isErrorState(e,t){let i=this._errorStateMatcher.isErrorState(e,t),o=!!(e&&e.invalid&&this.interacted);return i||o}static \u0275fac=(()=>{let e;return function(i){return(e||(e=qe(a)))(i||a)}})();static \u0275cmp=P({type:a,selectors:[["mat-step"]],contentQueries:function(t,i,o){if(t&1&&ae(o,pi,5)(o,no,5),t&2){let r;I(r=S())&&(i.stepLabel=r.first),I(r=S())&&(i._lazyContent=r.first)}},hostAttrs:["hidden",""],inputs:{color:"color"},exportAs:["matStep"],features:[G([{provide:Ct,useExisting:a},{provide:Pt,useExisting:a}]),be],ngContentSelectors:Mn,decls:1,vars:0,consts:[[3,"cdkPortalOutlet"]],template:function(t,i){t&1&&($(),Ce(0,Va,2,1,"ng-template"))},dependencies:[en],encapsulation:2,changeDetection:0})}return a})(),oo=(()=>{class a extends Et{_ngZone=c(J);_renderer=c(we);_animationsDisabled=ye();_cleanupTransition;_isAnimating=R(!1);_stepHeader=void 0;_animatedContainers;_steps=void 0;steps=new Pe;_icons;animationDone=new C;disableRipple=!1;color;labelPosition="end";headerPosition="top";ariaLabel=null;headerPrefix=qi(null);_iconOverrides={};get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=/^\d+$/.test(e)?e+"ms":e}_animationDuration="";_isServer=!c($i).isBrowser;constructor(){super();let t=c(F).nativeElement.nodeName.toLowerCase();this.orientation=t==="mat-vertical-stepper"?"vertical":"horizontal"}ngAfterContentInit(){super.ngAfterContentInit(),this._icons.forEach(({name:e,templateRef:t})=>this._iconOverrides[e]=t),this.steps.changes.pipe(W(this._destroyed)).subscribe(()=>this._stateChanged()),this.selectedIndexChange.pipe(W(this._destroyed)).subscribe(()=>{let e=this._getAnimationDuration();e==="0ms"||e==="0s"?this._onAnimationDone():this._isAnimating.set(!0)}),this._ngZone.runOutsideAngular(()=>{this._animationsDisabled||setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-stepper-animations-enabled"),this._cleanupTransition=this._renderer.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionend)},200)})}ngAfterViewInit(){if(super.ngAfterViewInit(),typeof queueMicrotask=="function"){let e=!1;this._animatedContainers.changes.pipe(Y(null),W(this._destroyed)).subscribe(()=>queueMicrotask(()=>{e||(e=!0,this.animationDone.emit()),this._stateChanged()}))}}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransition?.()}_getAnimationDuration(){return this._animationsDisabled?"0ms":this.animationDuration?this.animationDuration:this.orientation==="horizontal"?"500ms":"225ms"}_handleTransitionend=e=>{let t=e.target;if(!t)return;let i=this.orientation==="horizontal"&&e.propertyName==="transform"&&t.classList.contains("mat-horizontal-stepper-content-current"),o=this.orientation==="vertical"&&e.propertyName==="grid-template-rows"&&t.classList.contains("mat-vertical-content-container-active");(i||o)&&this._animatedContainers.find(s=>s.nativeElement===t)&&this._onAnimationDone()};_onAnimationDone(){this._isAnimating.set(!1),this.animationDone.emit()}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-stepper"],["mat-vertical-stepper"],["mat-horizontal-stepper"],["","matStepper",""]],contentQueries:function(t,i,o){if(t&1&&ae(o,ao,5)(o,io,5),t&2){let r;I(r=S())&&(i._steps=r),I(r=S())&&(i._icons=r)}},viewQuery:function(t,i){if(t&1&&K(_i,5)(ja,5),t&2){let o;I(o=S())&&(i._stepHeader=o),I(o=S())&&(i._animatedContainers=o)}},hostVars:14,hostBindings:function(t,i){t&2&&(Qt("--mat-stepper-animation-duration",i._getAnimationDuration()),E("mat-stepper-horizontal",i.orientation==="horizontal")("mat-stepper-vertical",i.orientation==="vertical")("mat-stepper-label-position-end",i.orientation==="horizontal"&&i.labelPosition=="end")("mat-stepper-label-position-bottom",i.orientation==="horizontal"&&i.labelPosition=="bottom")("mat-stepper-header-position-bottom",i.headerPosition==="bottom")("mat-stepper-animating",i._isAnimating()))},inputs:{disableRipple:"disableRipple",color:"color",labelPosition:"labelPosition",headerPosition:"headerPosition",ariaLabel:[0,"aria-label","ariaLabel"],headerPrefix:[1,"headerPrefix"],animationDuration:"animationDuration"},outputs:{animationDone:"animationDone"},exportAs:["matStepper","matVerticalStepper","matHorizontalStepper"],features:[G([{provide:Et,useExisting:a}]),be],ngContentSelectors:Mn,decls:7,vars:2,consts:[["stepTemplate",""],["horizontalStepsTemplate",""],["animatedContainer",""],[1,"mat-horizontal-stepper-wrapper"],[1,"mat-vertical-stepper-wrapper"],[1,"mat-horizontal-stepper-header-wrapper"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-horizontal-content-container"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id","class"],[3,"ngTemplateOutlet"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id"],[1,"mat-step"],[1,"mat-vertical-content-container"],["role","region",1,"mat-vertical-stepper-content",3,"id"],[1,"mat-vertical-content"],[3,"click","keydown","tabIndex","id","index","state","label","selected","active","optional","errorMessage","iconOverrides","disableRipple","color"],["aria-orientation","horizontal","role","tablist",1,"mat-horizontal-stepper-header-container"],[1,"mat-stepper-horizontal-line"]],template:function(t,i){if(t&1&&($(),f(0,Ga,1,0),f(1,$a,6,1,"div",3)(2,Za,4,1,"div",4),Ce(3,Ka,1,27,"ng-template",null,0,lt)(5,eo,3,1,"ng-template",null,1,lt)),t&2){let o;v(i._isServer?0:-1),m(),v((o=i.orientation)==="horizontal"?1:o==="vertical"?2:-1)}},dependencies:[qt,_i],styles:[`.mat-stepper-vertical,
.mat-stepper-horizontal {
  display: block;
  font-family: var(--mat-stepper-container-text-font, var(--mat-sys-body-medium-font));
  background: var(--mat-stepper-container-color, var(--mat-sys-surface));
}

.mat-horizontal-stepper-header-wrapper {
  align-items: center;
  display: flex;
}

.mat-horizontal-stepper-header-container {
  white-space: nowrap;
  display: flex;
  align-items: center;
  flex-grow: 1;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header-container {
  align-items: flex-start;
}
.mat-stepper-header-position-bottom .mat-horizontal-stepper-header-container {
  order: 1;
}

.mat-stepper-horizontal-line {
  border-top-width: 1px;
  border-top-style: solid;
  flex: auto;
  height: 0;
  margin: 0 -16px;
  min-width: 32px;
  border-top-color: var(--mat-stepper-line-color, var(--mat-sys-outline));
}
.mat-stepper-label-position-bottom .mat-stepper-horizontal-line {
  margin: 0;
  min-width: 0;
  position: relative;
  top: calc(calc((var(--mat-stepper-header-height, 72px) - 24px) / 2) + 12px);
}

.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before, [dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before, .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after, [dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after {
  border-top-width: 1px;
  border-top-style: solid;
  content: "";
  display: inline-block;
  height: 0;
  position: absolute;
  width: calc(50% - 20px);
}

.mat-horizontal-stepper-header {
  display: flex;
  overflow: hidden;
  align-items: center;
  padding: 0 24px;
  height: var(--mat-stepper-header-height, 72px);
}
.mat-horizontal-stepper-header .mat-step-icon {
  margin-right: 8px;
  flex: none;
}
[dir=rtl] .mat-horizontal-stepper-header .mat-step-icon {
  margin-right: 0;
  margin-left: 8px;
}
.mat-horizontal-stepper-header.mat-step-header-empty-label .mat-step-icon {
  margin: 0;
}
.mat-horizontal-stepper-header::before, .mat-horizontal-stepper-header::after {
  border-top-color: var(--mat-stepper-line-color, var(--mat-sys-outline));
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header {
  padding: calc((var(--mat-stepper-header-height, 72px) - 24px) / 2) 24px;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header::before, .mat-stepper-label-position-bottom .mat-horizontal-stepper-header::after {
  top: calc(calc((var(--mat-stepper-header-height, 72px) - 24px) / 2) + 12px);
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header {
  box-sizing: border-box;
  flex-direction: column;
  height: auto;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::after, [dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::after {
  right: 0;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:first-child)::before, [dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:not(:last-child)::before {
  left: 0;
}
[dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:last-child::before, [dir=rtl] .mat-stepper-label-position-bottom .mat-horizontal-stepper-header:first-child::after {
  display: none;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-icon {
  margin-right: 0;
  margin-left: 0;
}
.mat-stepper-label-position-bottom .mat-horizontal-stepper-header .mat-step-label {
  padding: 16px 0 0 0;
  text-align: center;
  width: 100%;
}

.mat-vertical-stepper-header {
  display: flex;
  align-items: center;
  height: 24px;
  padding: calc((var(--mat-stepper-header-height, 72px) - 24px) / 2) 24px;
}
.mat-vertical-stepper-header .mat-step-icon {
  margin-right: 12px;
}
[dir=rtl] .mat-vertical-stepper-header .mat-step-icon {
  margin-right: 0;
  margin-left: 12px;
}

.mat-horizontal-stepper-wrapper {
  display: flex;
  flex-direction: column;
}

.mat-horizontal-stepper-content {
  visibility: hidden;
  overflow: hidden;
  outline: 0;
  height: 0;
}
.mat-stepper-animations-enabled .mat-horizontal-stepper-content {
  transition: transform var(--mat-stepper-animation-duration, 0) cubic-bezier(0.35, 0, 0.25, 1);
}
.mat-horizontal-stepper-content.mat-horizontal-stepper-content-previous {
  transform: translate3d(-100%, 0, 0);
}
.mat-horizontal-stepper-content.mat-horizontal-stepper-content-next {
  transform: translate3d(100%, 0, 0);
}
.mat-horizontal-stepper-content.mat-horizontal-stepper-content-current {
  visibility: visible;
  transform: none;
  height: auto;
}
.mat-stepper-horizontal:not(.mat-stepper-animating) .mat-horizontal-stepper-content.mat-horizontal-stepper-content-current {
  overflow: visible;
}

.mat-horizontal-content-container {
  overflow: hidden;
  padding: 0 24px 24px 24px;
}
@media (forced-colors: active) {
  .mat-horizontal-content-container {
    outline: solid 1px;
  }
}
.mat-stepper-header-position-bottom .mat-horizontal-content-container {
  padding: 24px 24px 0 24px;
}

.mat-vertical-content-container {
  display: grid;
  grid-template-rows: 0fr;
  grid-template-columns: 100%;
  margin-left: 36px;
  border: 0;
  position: relative;
}
.mat-stepper-animations-enabled .mat-vertical-content-container {
  transition: grid-template-rows var(--mat-stepper-animation-duration, 0) cubic-bezier(0.4, 0, 0.2, 1);
}
.mat-vertical-content-container.mat-vertical-content-container-active {
  grid-template-rows: 1fr;
}
.mat-step:last-child .mat-vertical-content-container {
  border: none;
}
@media (forced-colors: active) {
  .mat-vertical-content-container {
    outline: solid 1px;
  }
}
[dir=rtl] .mat-vertical-content-container {
  margin-left: 0;
  margin-right: 36px;
}
@supports not (grid-template-rows: 0fr) {
  .mat-vertical-content-container {
    height: 0;
  }
  .mat-vertical-content-container.mat-vertical-content-container-active {
    height: auto;
  }
}

.mat-stepper-vertical-line::before {
  content: "";
  position: absolute;
  left: 0;
  border-left-width: 1px;
  border-left-style: solid;
  border-left-color: var(--mat-stepper-line-color, var(--mat-sys-outline));
  top: calc(8px - calc((var(--mat-stepper-header-height, 72px) - 24px) / 2));
  bottom: calc(8px - calc((var(--mat-stepper-header-height, 72px) - 24px) / 2));
}
[dir=rtl] .mat-stepper-vertical-line::before {
  left: auto;
  right: 0;
}

.mat-vertical-stepper-content {
  overflow: hidden;
  outline: 0;
  visibility: hidden;
}
.mat-stepper-animations-enabled .mat-vertical-stepper-content {
  transition: visibility var(--mat-stepper-animation-duration, 0) linear;
}
.mat-vertical-content-container-active > .mat-vertical-stepper-content {
  visibility: visible;
}

.mat-vertical-content {
  padding: 0 24px 24px 24px;
}
`],encapsulation:2,changeDetection:0})}return a})();var ui=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({providers:[Ct],imports:[tn,Tn,Ue,Te,oo,_i,N]})}return a})();var Xe=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[N]})}return a})();function ro(a,n){if(a&1&&(d(0,"mat-option",17),b(1),l()),a&2){let e=n.$implicit;_("value",e),m(),Ee(" ",e," ")}}function so(a,n){if(a&1){let e=Z();d(0,"mat-form-field",14)(1,"mat-select",16,0),w("selectionChange",function(i){A(e);let o=u(2);return z(o._changePageSize(i.value))}),me(3,ro,2,2,"mat-option",17,de),l(),d(5,"div",18),w("click",function(){A(e);let i=V(2);return z(i.open())}),l()()}if(a&2){let e=u(2);_("appearance",e._formFieldAppearance)("color",e.color),m(),_("value",e.pageSize)("disabled",e.disabled),jt("aria-labelledby",e._pageSizeLabelId),_("panelClass",e.selectConfig.panelClass||"")("disableOptionCentering",e.selectConfig.disableOptionCentering),m(2),he(e._displayedPageSizeOptions)}}function co(a,n){if(a&1&&(d(0,"div",15),b(1),l()),a&2){let e=u(2);m(),ee(e.pageSize)}}function lo(a,n){if(a&1&&(d(0,"div",3)(1,"div",13),b(2),l(),f(3,so,6,7,"mat-form-field",14),f(4,co,2,1,"div",15),l()),a&2){let e=u();m(),D("id",e._pageSizeLabelId),m(),Ee(" ",e._intl.itemsPerPageLabel," "),m(),v(e._displayedPageSizeOptions.length>1?3:-1),m(),v(e._displayedPageSizeOptions.length<=1?4:-1)}}function mo(a,n){if(a&1){let e=Z();d(0,"button",19),w("click",function(){A(e);let i=u();return z(i._buttonClicked(0,i._previousButtonsDisabled()))}),se(),d(1,"svg",8),y(2,"path",20),l()()}if(a&2){let e=u();_("matTooltip",e._intl.firstPageLabel)("matTooltipDisabled",e._previousButtonsDisabled())("disabled",e._previousButtonsDisabled())("tabindex",e._previousButtonsDisabled()?-1:null),D("aria-label",e._intl.firstPageLabel)}}function ho(a,n){if(a&1){let e=Z();d(0,"button",21),w("click",function(){A(e);let i=u();return z(i._buttonClicked(i.getNumberOfPages()-1,i._nextButtonsDisabled()))}),se(),d(1,"svg",8),y(2,"path",22),l()()}if(a&2){let e=u();_("matTooltip",e._intl.lastPageLabel)("matTooltipDisabled",e._nextButtonsDisabled())("disabled",e._nextButtonsDisabled())("tabindex",e._nextButtonsDisabled()?-1:null),D("aria-label",e._intl.lastPageLabel)}}var po=(()=>{class a{changes=new k;itemsPerPageLabel="Items per page:";nextPageLabel="Next page";previousPageLabel="Previous page";firstPageLabel="First page";lastPageLabel="Last page";getRangeLabel=(e,t,i)=>{if(i==0||t==0)return`0 of ${i}`;i=Math.max(i,0);let o=e*t,r=o<i?Math.min(o+t,i):o+t;return`${o+1} \u2013 ${r} of ${i}`};static \u0275fac=function(t){return new(t||a)};static \u0275prov=ke({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})(),_o=50;var uo=new L("MAT_PAGINATOR_DEFAULT_OPTIONS"),bo=(()=>{class a{_intl=c(po);_changeDetectorRef=c(B);_formFieldAppearance;_pageSizeLabelId=c(te).getId("mat-paginator-page-size-label-");_intlChanges;_isInitialized=!1;_initializedStream=new zi(1);color;get pageIndex(){return this._pageIndex}set pageIndex(e){this._pageIndex=Math.max(e||0,0),this._changeDetectorRef.markForCheck()}_pageIndex=0;get length(){return this._length}set length(e){this._length=e||0,this._changeDetectorRef.markForCheck()}_length=0;get pageSize(){return this._pageSize}set pageSize(e){this._pageSize=Math.max(e||0,0),this._updateDisplayedPageSizeOptions()}_pageSize;get pageSizeOptions(){return this._pageSizeOptions}set pageSizeOptions(e){this._pageSizeOptions=(e||[]).map(t=>X(t,0)),this._updateDisplayedPageSizeOptions()}_pageSizeOptions=[];hidePageSize=!1;showFirstLastButtons=!1;selectConfig={};disabled=!1;page=new C;_displayedPageSizeOptions;initialized=this._initializedStream;constructor(){let e=this._intl,t=c(uo,{optional:!0});if(this._intlChanges=e.changes.subscribe(()=>this._changeDetectorRef.markForCheck()),t){let{pageSize:i,pageSizeOptions:o,hidePageSize:r,showFirstLastButtons:s}=t;i!=null&&(this._pageSize=i),o!=null&&(this._pageSizeOptions=o),r!=null&&(this.hidePageSize=r),s!=null&&(this.showFirstLastButtons=s)}this._formFieldAppearance=t?.formFieldAppearance||"outline"}ngOnInit(){this._isInitialized=!0,this._updateDisplayedPageSizeOptions(),this._initializedStream.next()}ngOnDestroy(){this._initializedStream.complete(),this._intlChanges.unsubscribe()}nextPage(){this.hasNextPage()&&this._navigate(this.pageIndex+1)}previousPage(){this.hasPreviousPage()&&this._navigate(this.pageIndex-1)}firstPage(){this.hasPreviousPage()&&this._navigate(0)}lastPage(){this.hasNextPage()&&this._navigate(this.getNumberOfPages()-1)}hasPreviousPage(){return this.pageIndex>=1&&this.pageSize!=0}hasNextPage(){let e=this.getNumberOfPages()-1;return this.pageIndex<e&&this.pageSize!=0}getNumberOfPages(){return this.pageSize?Math.ceil(this.length/this.pageSize):0}_changePageSize(e){let t=this.pageIndex*this.pageSize,i=this.pageIndex;this.pageIndex=Math.floor(t/e)||0,this.pageSize=e,this._emitPageEvent(i)}_nextButtonsDisabled(){return this.disabled||!this.hasNextPage()}_previousButtonsDisabled(){return this.disabled||!this.hasPreviousPage()}_updateDisplayedPageSizeOptions(){this._isInitialized&&(this.pageSize||(this._pageSize=this.pageSizeOptions.length!=0?this.pageSizeOptions[0]:_o),this._displayedPageSizeOptions=this.pageSizeOptions.slice(),this._displayedPageSizeOptions.indexOf(this.pageSize)===-1&&this._displayedPageSizeOptions.push(this.pageSize),this._displayedPageSizeOptions.sort((e,t)=>e-t),this._changeDetectorRef.markForCheck())}_emitPageEvent(e){this.page.emit({previousPageIndex:e,pageIndex:this.pageIndex,pageSize:this.pageSize,length:this.length})}_navigate(e){let t=this.pageIndex;e!==t&&(this.pageIndex=e,this._emitPageEvent(t))}_buttonClicked(e,t){t||this._navigate(e)}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-paginator"]],hostAttrs:["role","group",1,"mat-mdc-paginator"],inputs:{color:"color",pageIndex:[2,"pageIndex","pageIndex",X],length:[2,"length","length",X],pageSize:[2,"pageSize","pageSize",X],pageSizeOptions:"pageSizeOptions",hidePageSize:[2,"hidePageSize","hidePageSize",g],showFirstLastButtons:[2,"showFirstLastButtons","showFirstLastButtons",g],selectConfig:"selectConfig",disabled:[2,"disabled","disabled",g]},outputs:{page:"page"},exportAs:["matPaginator"],decls:14,vars:14,consts:[["selectRef",""],[1,"mat-mdc-paginator-outer-container"],[1,"mat-mdc-paginator-container"],[1,"mat-mdc-paginator-page-size"],[1,"mat-mdc-paginator-range-actions"],["aria-atomic","true","aria-live","polite","role","status",1,"mat-mdc-paginator-range-label"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-first",3,"matTooltip","matTooltipDisabled","disabled","tabindex"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-previous",3,"click","matTooltip","matTooltipDisabled","disabled","tabindex"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true",1,"mat-mdc-paginator-icon"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-next",3,"click","matTooltip","matTooltipDisabled","disabled","tabindex"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-last",3,"matTooltip","matTooltipDisabled","disabled","tabindex"],["aria-hidden","true",1,"mat-mdc-paginator-page-size-label"],[1,"mat-mdc-paginator-page-size-select",3,"appearance","color"],[1,"mat-mdc-paginator-page-size-value"],["hideSingleSelectionIndicator","",3,"selectionChange","value","disabled","aria-labelledby","panelClass","disableOptionCentering"],[3,"value"],[1,"mat-mdc-paginator-touch-target",3,"click"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-first",3,"click","matTooltip","matTooltipDisabled","disabled","tabindex"],["d","M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"],["matIconButton","","type","button","matTooltipPosition","above","disabledInteractive","",1,"mat-mdc-paginator-navigation-last",3,"click","matTooltip","matTooltipDisabled","disabled","tabindex"],["d","M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"]],template:function(t,i){t&1&&(d(0,"div",1)(1,"div",2),f(2,lo,5,4,"div",3),d(3,"div",4)(4,"div",5),b(5),l(),f(6,mo,3,5,"button",6),d(7,"button",7),w("click",function(){return i._buttonClicked(i.pageIndex-1,i._previousButtonsDisabled())}),se(),d(8,"svg",8),y(9,"path",9),l()(),Qe(),d(10,"button",10),w("click",function(){return i._buttonClicked(i.pageIndex+1,i._nextButtonsDisabled())}),se(),d(11,"svg",8),y(12,"path",11),l()(),f(13,ho,3,5,"button",12),l()()()),t&2&&(m(2),v(i.hidePageSize?-1:2),m(3),Ee(" ",i._intl.getRangeLabel(i.pageIndex,i.pageSize,i.length)," "),m(),v(i.showFirstLastButtons?6:-1),m(),_("matTooltip",i._intl.previousPageLabel)("matTooltipDisabled",i._previousButtonsDisabled())("disabled",i._previousButtonsDisabled())("tabindex",i._previousButtonsDisabled()?-1:null),D("aria-label",i._intl.previousPageLabel),m(3),_("matTooltip",i._intl.nextPageLabel)("matTooltipDisabled",i._nextButtonsDisabled())("disabled",i._nextButtonsDisabled())("tabindex",i._nextButtonsDisabled()?-1:null),D("aria-label",i._intl.nextPageLabel),m(3),v(i.showFirstLastButtons?13:-1))},dependencies:[kt,St,Dt,Xi,cn],styles:[`.mat-mdc-paginator {
  display: block;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: var(--mat-paginator-container-text-color, var(--mat-sys-on-surface));
  background-color: var(--mat-paginator-container-background-color, var(--mat-sys-surface));
  font-family: var(--mat-paginator-container-text-font, var(--mat-sys-body-small-font));
  line-height: var(--mat-paginator-container-text-line-height, var(--mat-sys-body-small-line-height));
  font-size: var(--mat-paginator-container-text-size, var(--mat-sys-body-small-size));
  font-weight: var(--mat-paginator-container-text-weight, var(--mat-sys-body-small-weight));
  letter-spacing: var(--mat-paginator-container-text-tracking, var(--mat-sys-body-small-tracking));
  --mat-form-field-container-height: var(--mat-paginator-form-field-container-height, 40px);
  --mat-form-field-container-vertical-padding: var(--mat-paginator-form-field-container-vertical-padding, 8px);
}
.mat-mdc-paginator .mat-mdc-select-value {
  font-size: var(--mat-paginator-select-trigger-text-size, var(--mat-sys-body-small-size));
}
.mat-mdc-paginator .mat-mdc-form-field-subscript-wrapper {
  display: none;
}
.mat-mdc-paginator .mat-mdc-select {
  line-height: 1.5;
}

.mat-mdc-paginator-outer-container {
  display: flex;
}

.mat-mdc-paginator-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  flex-wrap: wrap;
  width: 100%;
  min-height: var(--mat-paginator-container-size, 56px);
}

.mat-mdc-paginator-page-size {
  display: flex;
  align-items: baseline;
  margin-right: 8px;
}
[dir=rtl] .mat-mdc-paginator-page-size {
  margin-right: 0;
  margin-left: 8px;
}

.mat-mdc-paginator-page-size-label {
  margin: 0 4px;
}

.mat-mdc-paginator-page-size-select {
  margin: 0 4px;
  width: var(--mat-paginator-page-size-select-width, 84px);
}

.mat-mdc-paginator-range-label {
  margin: 0 32px 0 24px;
}

.mat-mdc-paginator-range-actions {
  display: flex;
  align-items: center;
}

.mat-mdc-paginator-icon {
  display: inline-block;
  width: 28px;
  fill: var(--mat-paginator-enabled-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-icon-button[aria-disabled] .mat-mdc-paginator-icon {
  fill: var(--mat-paginator-disabled-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
[dir=rtl] .mat-mdc-paginator-icon {
  transform: rotate(180deg);
}

@media (forced-colors: active) {
  .mat-mdc-icon-button[aria-disabled] .mat-mdc-paginator-icon,
  .mat-mdc-paginator-icon {
    fill: currentColor;
  }
  .mat-mdc-paginator-range-actions .mat-mdc-icon-button {
    outline: solid 1px;
  }
  .mat-mdc-paginator-range-actions .mat-mdc-icon-button[aria-disabled] {
    color: GrayText;
  }
}
.mat-mdc-paginator-touch-target {
  display: var(--mat-paginator-touch-target-display, block);
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--mat-paginator-page-size-select-width, 84px);
  height: var(--mat-paginator-page-size-select-touch-target-height, 48px);
  background-color: transparent;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
`],encapsulation:2,changeDetection:0})}return a})(),bi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[Ye,Ke,Ze,bo]})}return a})();var gi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[N]})}return a})();var yo=["mat-menu-item",""],xo=[[["mat-icon"],["","matMenuItemIcon",""]],"*"],ko=["mat-icon, [matMenuItemIcon]","*"];function wo(a,n){a&1&&(se(),d(0,"svg",2),y(1,"polygon",3),l())}var Co=["*"];function Do(a,n){if(a&1){let e=Z();ct(0,"div",0),ji("click",function(){A(e);let i=u();return z(i.closed.emit("click"))})("animationstart",function(i){A(e);let o=u();return z(o._onAnimationStart(i.animationName))})("animationend",function(i){A(e);let o=u();return z(o._onAnimationDone(i.animationName))})("animationcancel",function(i){A(e);let o=u();return z(o._onAnimationDone(i.animationName))}),ct(1,"div",1),j(2),Gt()()}if(a&2){let e=u();ge(e._classList),E("mat-menu-panel-animations-disabled",e._animationsDisabled)("mat-menu-panel-exit-animation",e._panelAnimationState==="void")("mat-menu-panel-animating",e._isAnimating()),Be("id",e.panelId),D("aria-label",e.ariaLabel||null)("aria-labelledby",e.ariaLabelledby||null)("aria-describedby",e.ariaDescribedby||null)}}var vi=new L("MAT_MENU_PANEL"),Je=(()=>{class a{_elementRef=c(F);_document=c(Ae);_focusMonitor=c(Re);_parentMenu=c(vi,{optional:!0});_changeDetectorRef=c(B);role="menuitem";disabled=!1;disableRipple=!1;_hovered=new k;_focused=new k;_highlighted=!1;_triggersSubmenu=!1;constructor(){c(_e).load(Se),this._parentMenu?.addItem?.(this)}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._getHostElement(),e,t):this._getHostElement().focus(t),this._focused.next(this)}ngAfterViewInit(){this._focusMonitor&&this._focusMonitor.monitor(this._elementRef,!1)}ngOnDestroy(){this._focusMonitor&&this._focusMonitor.stopMonitoring(this._elementRef),this._parentMenu&&this._parentMenu.removeItem&&this._parentMenu.removeItem(this),this._hovered.complete(),this._focused.complete()}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._elementRef.nativeElement}_checkDisabled(e){this.disabled&&(e.preventDefault(),e.stopPropagation())}_handleMouseEnter(){this._hovered.next(this)}getLabel(){let e=this._elementRef.nativeElement.cloneNode(!0),t=e.querySelectorAll("mat-icon, .material-icons");for(let i=0;i<t.length;i++)t[i].remove();return e.textContent?.trim()||""}_setHighlighted(e){this._highlighted=e,this._changeDetectorRef.markForCheck()}_setTriggersSubmenu(e){this._triggersSubmenu=e,this._changeDetectorRef.markForCheck()}_hasFocus(){return this._document&&this._document.activeElement===this._getHostElement()}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["","mat-menu-item",""]],hostAttrs:[1,"mat-mdc-menu-item","mat-focus-indicator"],hostVars:8,hostBindings:function(t,i){t&1&&w("click",function(r){return i._checkDisabled(r)})("mouseenter",function(){return i._handleMouseEnter()}),t&2&&(D("role",i.role)("tabindex",i._getTabIndex())("aria-disabled",i.disabled)("disabled",i.disabled||null),E("mat-mdc-menu-item-highlighted",i._highlighted)("mat-mdc-menu-item-submenu-trigger",i._triggersSubmenu))},inputs:{role:"role",disabled:[2,"disabled","disabled",g],disableRipple:[2,"disableRipple","disableRipple",g]},exportAs:["matMenuItem"],attrs:yo,ngContentSelectors:ko,decls:5,vars:3,consts:[[1,"mat-mdc-menu-item-text"],["matRipple","",1,"mat-mdc-menu-ripple",3,"matRippleDisabled","matRippleTrigger"],["viewBox","0 0 5 10","focusable","false","aria-hidden","true",1,"mat-mdc-menu-submenu-icon"],["points","0,0 5,5 0,10"]],template:function(t,i){t&1&&($(xo),j(0),d(1,"span",0),j(2,1),l(),y(3,"div",1),f(4,wo,2,0,":svg:svg",2)),t&2&&(m(3),_("matRippleDisabled",i.disableRipple||i.disabled)("matRippleTrigger",i._getHostElement()),m(),v(i._triggersSubmenu?4:-1))},dependencies:[Ie],encapsulation:2,changeDetection:0})}return a})();var Io=new L("MatMenuContent");var So=new L("mat-menu-default-options",{providedIn:"root",factory:()=>({overlapTrigger:!1,xPosition:"after",yPosition:"below",backdropClass:"cdk-overlay-transparent-backdrop"})}),fi="_mat-menu-enter",Rt="_mat-menu-exit",He=(()=>{class a{_elementRef=c(F);_changeDetectorRef=c(B);_injector=c(ce);_keyManager;_xPosition;_yPosition;_firstItemFocusRef;_exitFallbackTimeout;_animationsDisabled=ye();_allItems;_directDescendantItems=new Pe;_classList={};_panelAnimationState="void";_animationDone=new k;_isAnimating=R(!1);parentMenu;direction;overlayPanelClass;backdropClass;ariaLabel;ariaLabelledby;ariaDescribedby;get xPosition(){return this._xPosition}set xPosition(e){this._xPosition=e,this.setPositionClasses()}get yPosition(){return this._yPosition}set yPosition(e){this._yPosition=e,this.setPositionClasses()}templateRef;items;lazyContent;overlapTrigger=!1;hasBackdrop;set panelClass(e){let t=this._previousPanelClass,i=je({},this._classList);t&&t.length&&t.split(" ").forEach(o=>{i[o]=!1}),this._previousPanelClass=e,e&&e.length&&(e.split(" ").forEach(o=>{i[o]=!0}),this._elementRef.nativeElement.className=""),this._classList=i}_previousPanelClass;get classList(){return this.panelClass}set classList(e){this.panelClass=e}closed=new C;close=this.closed;panelId=c(te).getId("mat-menu-panel-");constructor(){let e=c(So);this.overlayPanelClass=e.overlayPanelClass||"",this._xPosition=e.xPosition,this._yPosition=e.yPosition,this.backdropClass=e.backdropClass,this.overlapTrigger=e.overlapTrigger,this.hasBackdrop=e.hasBackdrop}ngOnInit(){this.setPositionClasses()}ngAfterContentInit(){this._updateDirectDescendants(),this._keyManager=new ft(this._directDescendantItems).withWrap().withTypeAhead().withHomeAndEnd(),this._keyManager.tabOut.subscribe(()=>this.closed.emit("tab")),this._directDescendantItems.changes.pipe(Y(this._directDescendantItems),Me(e=>xe(...e.map(t=>t._focused)))).subscribe(e=>this._keyManager.updateActiveItem(e)),this._directDescendantItems.changes.subscribe(e=>{let t=this._keyManager;if(this._panelAnimationState==="enter"&&t.activeItem?._hasFocus()){let i=e.toArray(),o=Math.max(0,Math.min(i.length-1,t.activeItemIndex||0));i[o]&&!i[o].disabled?t.setActiveItem(o):t.setNextItemActive()}})}ngOnDestroy(){this._keyManager?.destroy(),this._directDescendantItems.destroy(),this.closed.complete(),this._firstItemFocusRef?.destroy(),clearTimeout(this._exitFallbackTimeout)}_hovered(){return this._directDescendantItems.changes.pipe(Y(this._directDescendantItems),Me(t=>xe(...t.map(i=>i._hovered))))}addItem(e){}removeItem(e){}_handleKeydown(e){let t=e.keyCode,i=this._keyManager;switch(t){case 27:gt(e)||(e.preventDefault(),this.closed.emit("keydown"));break;case 37:this.parentMenu&&this.direction==="ltr"&&this.closed.emit("keydown");break;case 39:this.parentMenu&&this.direction==="rtl"&&this.closed.emit("keydown");break;default:(t===38||t===40)&&i.setFocusOrigin("keyboard"),i.onKeydown(e);return}}focusFirstItem(e="program"){this._firstItemFocusRef?.destroy(),this._firstItemFocusRef=ze(()=>{let t=this._resolvePanel();if(!t||!t.contains(document.activeElement)){let i=this._keyManager;i.setFocusOrigin(e).setFirstItemActive(),!i.activeItem&&t&&t.focus()}},{injector:this._injector})}resetActiveItem(){this._keyManager.setActiveItem(-1)}setElevation(e){}setPositionClasses(e=this.xPosition,t=this.yPosition){this._classList=at(je({},this._classList),{"mat-menu-before":e==="before","mat-menu-after":e==="after","mat-menu-above":t==="above","mat-menu-below":t==="below"}),this._changeDetectorRef.markForCheck()}_onAnimationDone(e){let t=e===Rt;(t||e===fi)&&(t&&(clearTimeout(this._exitFallbackTimeout),this._exitFallbackTimeout=void 0),this._animationDone.next(t?"void":"enter"),this._isAnimating.set(!1))}_onAnimationStart(e){(e===fi||e===Rt)&&this._isAnimating.set(!0)}_setIsOpen(e){if(this._panelAnimationState=e?"enter":"void",e){if(this._keyManager.activeItemIndex===0){let t=this._resolvePanel();t&&(t.scrollTop=0)}}else this._animationsDisabled||(this._exitFallbackTimeout=setTimeout(()=>this._onAnimationDone(Rt),200));this._animationsDisabled&&setTimeout(()=>{this._onAnimationDone(e?fi:Rt)}),this._changeDetectorRef.markForCheck()}_updateDirectDescendants(){this._allItems.changes.pipe(Y(this._allItems)).subscribe(e=>{this._directDescendantItems.reset(e.filter(t=>t._parentMenu===this)),this._directDescendantItems.notifyOnChanges()})}_resolvePanel(){let e=null;return this._directDescendantItems.length&&(e=this._directDescendantItems.first._getHostElement().closest('[role="menu"]')),e}static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["mat-menu"]],contentQueries:function(t,i,o){if(t&1&&ae(o,Io,5)(o,Je,5)(o,Je,4),t&2){let r;I(r=S())&&(i.lazyContent=r.first),I(r=S())&&(i._allItems=r),I(r=S())&&(i.items=r)}},viewQuery:function(t,i){if(t&1&&K(le,5),t&2){let o;I(o=S())&&(i.templateRef=o.first)}},hostVars:3,hostBindings:function(t,i){t&2&&D("aria-label",null)("aria-labelledby",null)("aria-describedby",null)},inputs:{backdropClass:"backdropClass",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],xPosition:"xPosition",yPosition:"yPosition",overlapTrigger:[2,"overlapTrigger","overlapTrigger",g],hasBackdrop:[2,"hasBackdrop","hasBackdrop",e=>e==null?null:g(e)],panelClass:[0,"class","panelClass"],classList:"classList"},outputs:{closed:"closed",close:"close"},exportAs:["matMenu"],features:[G([{provide:vi,useExisting:a}])],ngContentSelectors:Co,decls:1,vars:0,consts:[["tabindex","-1","role","menu",1,"mat-mdc-menu-panel",3,"click","animationstart","animationend","animationcancel","id"],[1,"mat-mdc-menu-content"]],template:function(t,i){t&1&&($(),We(0,Do,3,12,"ng-template"))},styles:[`mat-menu {
  display: none;
}

.mat-mdc-menu-content {
  margin: 0;
  padding: 8px 0;
  outline: 0;
}
.mat-mdc-menu-content,
.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  flex: 1;
  white-space: normal;
  font-family: var(--mat-menu-item-label-text-font, var(--mat-sys-label-large-font));
  line-height: var(--mat-menu-item-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-size: var(--mat-menu-item-label-text-size, var(--mat-sys-label-large-size));
  letter-spacing: var(--mat-menu-item-label-text-tracking, var(--mat-sys-label-large-tracking));
  font-weight: var(--mat-menu-item-label-text-weight, var(--mat-sys-label-large-weight));
}

@keyframes _mat-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-menu-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-menu-panel {
  min-width: 112px;
  max-width: 280px;
  overflow: auto;
  box-sizing: border-box;
  outline: 0;
  animation: _mat-menu-enter 120ms cubic-bezier(0, 0, 0.2, 1);
  border-radius: var(--mat-menu-container-shape, var(--mat-sys-corner-extra-small));
  background-color: var(--mat-menu-container-color, var(--mat-sys-surface-container));
  box-shadow: var(--mat-menu-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  will-change: transform, opacity;
}
.mat-mdc-menu-panel.mat-menu-panel-exit-animation {
  animation: _mat-menu-exit 100ms 25ms linear forwards;
}
.mat-mdc-menu-panel.mat-menu-panel-animations-disabled {
  animation: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating {
  pointer-events: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating:has(.mat-mdc-menu-content:empty) {
  display: none;
}
@media (forced-colors: active) {
  .mat-mdc-menu-panel {
    outline: solid 1px;
  }
}
.mat-mdc-menu-panel .mat-divider {
  border-top-color: var(--mat-menu-divider-color, var(--mat-sys-surface-variant));
  margin-bottom: var(--mat-menu-divider-bottom-spacing, 8px);
  margin-top: var(--mat-menu-divider-top-spacing, 8px);
}

.mat-mdc-menu-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  color: inherit;
  font-size: inherit;
  background: none;
  text-decoration: none;
  margin: 0;
  min-height: 48px;
  padding-left: var(--mat-menu-item-leading-spacing, 12px);
  padding-right: var(--mat-menu-item-trailing-spacing, 12px);
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-menu-item::-moz-focus-inner {
  border: 0;
}
[dir=rtl] .mat-mdc-menu-item {
  padding-left: var(--mat-menu-item-trailing-spacing, 12px);
  padding-right: var(--mat-menu-item-leading-spacing, 12px);
}
.mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--mat-menu-item-with-icon-leading-spacing, 12px);
  padding-right: var(--mat-menu-item-with-icon-trailing-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--mat-menu-item-with-icon-trailing-spacing, 12px);
  padding-right: var(--mat-menu-item-with-icon-leading-spacing, 12px);
}
.mat-mdc-menu-item, .mat-mdc-menu-item:visited, .mat-mdc-menu-item:link {
  color: var(--mat-menu-item-label-text-color, var(--mat-sys-on-surface));
}
.mat-mdc-menu-item .mat-icon-no-color,
.mat-mdc-menu-item .mat-mdc-menu-submenu-icon {
  color: var(--mat-menu-item-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-mdc-menu-item[disabled] {
  cursor: default;
  opacity: 0.38;
}
.mat-mdc-menu-item[disabled]::after {
  display: block;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.mat-mdc-menu-item:focus {
  outline: 0;
}
.mat-mdc-menu-item .mat-icon {
  flex-shrink: 0;
  margin-right: var(--mat-menu-item-spacing, 12px);
  height: var(--mat-menu-item-icon-size, 24px);
  width: var(--mat-menu-item-icon-size, 24px);
}
[dir=rtl] .mat-mdc-menu-item {
  text-align: right;
}
[dir=rtl] .mat-mdc-menu-item .mat-icon {
  margin-right: 0;
  margin-left: var(--mat-menu-item-spacing, 12px);
}
.mat-mdc-menu-item:not([disabled]):hover {
  background-color: var(--mat-menu-item-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-menu-item:not([disabled]).cdk-program-focused, .mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused, .mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted {
  background-color: var(--mat-menu-item-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
@media (forced-colors: active) {
  .mat-mdc-menu-item {
    margin-top: 1px;
  }
}

.mat-mdc-menu-submenu-icon {
  width: var(--mat-menu-item-icon-size, 24px);
  height: 10px;
  fill: currentColor;
  padding-left: var(--mat-menu-item-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-submenu-icon {
  padding-right: var(--mat-menu-item-spacing, 12px);
  padding-left: 0;
}
[dir=rtl] .mat-mdc-menu-submenu-icon polygon {
  transform: scaleX(-1);
  transform-origin: center;
}
@media (forced-colors: active) {
  .mat-mdc-menu-submenu-icon {
    fill: CanvasText;
  }
}

.mat-mdc-menu-item .mat-mdc-menu-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
`],encapsulation:2,changeDetection:0})}return a})(),To=new L("mat-menu-scroll-strategy",{providedIn:"root",factory:()=>{let a=c(ce);return()=>nn(a)}});var Ne=new WeakMap,Mo=(()=>{class a{_canHaveBackdrop;_element=c(F);_viewContainerRef=c(Fe);_menuItemInstance=c(Je,{optional:!0,self:!0});_dir=c(De,{optional:!0});_focusMonitor=c(Re);_ngZone=c(J);_injector=c(ce);_scrollStrategy=c(To);_changeDetectorRef=c(B);_animationsDisabled=ye();_portal;_overlayRef=null;_menuOpen=!1;_closingActionsSubscription=ne.EMPTY;_menuCloseSubscription=ne.EMPTY;_pendingRemoval;_parentMaterialMenu;_parentInnerPadding;_openedBy=void 0;get _menu(){return this._menuInternal}set _menu(e){e!==this._menuInternal&&(this._menuInternal=e,this._menuCloseSubscription.unsubscribe(),e&&(this._parentMaterialMenu,this._menuCloseSubscription=e.close.subscribe(t=>{this._destroyMenu(t),(t==="click"||t==="tab")&&this._parentMaterialMenu&&this._parentMaterialMenu.closed.emit(t)})),this._menuItemInstance?._setTriggersSubmenu(this._triggersSubmenu()))}_menuInternal=null;constructor(e){this._canHaveBackdrop=e;let t=c(vi,{optional:!0});this._parentMaterialMenu=t instanceof He?t:void 0}ngOnDestroy(){this._menu&&this._ownsMenu(this._menu)&&Ne.delete(this._menu),this._pendingRemoval?.unsubscribe(),this._menuCloseSubscription.unsubscribe(),this._closingActionsSubscription.unsubscribe(),this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=null)}get menuOpen(){return this._menuOpen}get dir(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_triggersSubmenu(){return!!(this._menuItemInstance&&this._parentMaterialMenu&&this._menu)}_closeMenu(){this._menu?.close.emit()}_openMenu(e){if(this._triggerIsAriaDisabled())return;let t=this._menu;if(this._menuOpen||!t)return;this._pendingRemoval?.unsubscribe();let i=Ne.get(t);Ne.set(t,this),i&&i!==this&&i._closeMenu();let o=this._createOverlay(t),r=o.getConfig(),s=r.positionStrategy;this._setPosition(t,s),this._canHaveBackdrop?r.hasBackdrop=t.hasBackdrop==null?!this._triggersSubmenu():t.hasBackdrop:r.hasBackdrop=t.hasBackdrop??!1,o.hasAttached()||(o.attach(this._getPortal(t)),t.lazyContent?.attach(this.menuData)),this._closingActionsSubscription=this._menuClosingActions().subscribe(()=>this._closeMenu()),t.parentMenu=this._triggersSubmenu()?this._parentMaterialMenu:void 0,t.direction=this.dir,e&&t.focusFirstItem(this._openedBy||"program"),this._setIsMenuOpen(!0),t instanceof He&&(t._setIsOpen(!0),t._directDescendantItems.changes.pipe(W(t.close)).subscribe(()=>{s.withLockedPosition(!1).reapplyLastPosition(),s.withLockedPosition(!0)}))}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t)}_destroyMenu(e){let t=this._overlayRef,i=this._menu;!t||!this.menuOpen||(this._closingActionsSubscription.unsubscribe(),this._pendingRemoval?.unsubscribe(),i instanceof He&&this._ownsMenu(i)?(this._pendingRemoval=i._animationDone.pipe(rt(1)).subscribe(()=>{t.detach(),Ne.has(i)||i.lazyContent?.detach()}),i._setIsOpen(!1)):(t.detach(),i?.lazyContent?.detach()),i&&this._ownsMenu(i)&&Ne.delete(i),this.restoreFocus&&(e==="keydown"||!this._openedBy||!this._triggersSubmenu())&&this.focus(this._openedBy),this._openedBy=void 0,this._setIsMenuOpen(!1))}_setIsMenuOpen(e){e!==this._menuOpen&&(this._menuOpen=e,this._menuOpen?this.menuOpened.emit():this.menuClosed.emit(),this._triggersSubmenu()&&this._menuItemInstance._setHighlighted(e),this._changeDetectorRef.markForCheck())}_createOverlay(e){if(!this._overlayRef){let t=this._getOverlayConfig(e);this._subscribeToPositions(e,t.positionStrategy),this._overlayRef=rn(this._injector,t),this._overlayRef.keydownEvents().subscribe(i=>{this._menu instanceof He&&this._menu._handleKeydown(i)})}return this._overlayRef}_getOverlayConfig(e){return new an({positionStrategy:on(this._injector,this._getOverlayOrigin()).withLockedPosition().withGrowAfterOpen().withTransformOriginOn(".mat-menu-panel, .mat-mdc-menu-panel"),backdropClass:e.backdropClass||"cdk-overlay-transparent-backdrop",panelClass:e.overlayPanelClass,scrollStrategy:this._scrollStrategy(),direction:this._dir||"ltr",disableAnimations:this._animationsDisabled})}_subscribeToPositions(e,t){e.setPositionClasses&&t.positionChanges.subscribe(i=>{this._ngZone.run(()=>{let o=i.connectionPair.overlayX==="start"?"after":"before",r=i.connectionPair.overlayY==="top"?"below":"above";e.setPositionClasses(o,r)})})}_setPosition(e,t){let[i,o]=e.xPosition==="before"?["end","start"]:["start","end"],[r,s]=e.yPosition==="above"?["bottom","top"]:["top","bottom"],[h,p]=[r,s],[x,H]=[i,o],q=0;if(this._triggersSubmenu()){if(H=i=e.xPosition==="before"?"start":"end",o=x=i==="end"?"start":"end",this._parentMaterialMenu){if(this._parentInnerPadding==null){let Oe=this._parentMaterialMenu.items.first;this._parentInnerPadding=Oe?Oe._getHostElement().offsetTop:0}q=r==="bottom"?this._parentInnerPadding:-this._parentInnerPadding}}else e.overlapTrigger||(h=r==="top"?"bottom":"top",p=s==="top"?"bottom":"top");t.withPositions([{originX:i,originY:h,overlayX:x,overlayY:r,offsetY:q},{originX:o,originY:h,overlayX:H,overlayY:r,offsetY:q},{originX:i,originY:p,overlayX:x,overlayY:s,offsetY:-q},{originX:o,originY:p,overlayX:H,overlayY:s,offsetY:-q}])}_menuClosingActions(){let e=this._getOutsideClickStream(this._overlayRef),t=this._overlayRef.detachments(),i=this._parentMaterialMenu?this._parentMaterialMenu.closed:Ge(),o=this._parentMaterialMenu?this._parentMaterialMenu._hovered().pipe(Ni(r=>this._menuOpen&&r!==this._menuItemInstance)):Ge();return xe(e,i,o,t)}_getPortal(e){return(!this._portal||this._portal.templateRef!==e.templateRef)&&(this._portal=new xt(e.templateRef,this._viewContainerRef)),this._portal}_ownsMenu(e){return Ne.get(e)===this}_triggerIsAriaDisabled(){return g(this._element.nativeElement.getAttribute("aria-disabled"))}static \u0275fac=function(t){Vi()};static \u0275dir=O({type:a})}return a})(),On=(()=>{class a extends Mo{_cleanupTouchstart;_hoverSubscription=ne.EMPTY;get _deprecatedMatMenuTriggerFor(){return this.menu}set _deprecatedMatMenuTriggerFor(e){this.menu=e}get menu(){return this._menu}set menu(e){this._menu=e}menuData;restoreFocus=!0;menuOpened=new C;onMenuOpen=this.menuOpened;menuClosed=new C;onMenuClose=this.menuClosed;constructor(){super(!0);let e=c(we);this._cleanupTouchstart=e.listen(this._element.nativeElement,"touchstart",t=>{bt(t)||(this._openedBy="touch")},{passive:!0})}triggersSubmenu(){return super._triggersSubmenu()}toggleMenu(){return this.menuOpen?this.closeMenu():this.openMenu()}openMenu(){this._openMenu(!0)}closeMenu(){this._closeMenu()}updatePosition(){this._overlayRef?.updatePosition()}ngAfterContentInit(){this._handleHover()}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTouchstart(),this._hoverSubscription.unsubscribe()}_getOverlayOrigin(){return this._element}_getOutsideClickStream(e){return e.backdropClick()}_handleMousedown(e){ut(e)||(this._openedBy=e.button===0?"mouse":void 0,this.triggersSubmenu()&&e.preventDefault())}_handleKeydown(e){let t=e.keyCode;(t===13||t===32)&&(this._openedBy="keyboard"),this.triggersSubmenu()&&(t===39&&this.dir==="ltr"||t===37&&this.dir==="rtl")&&(this._openedBy="keyboard",this.openMenu())}_handleClick(e){this.triggersSubmenu()?(e.stopPropagation(),this.openMenu()):this.toggleMenu()}_handleHover(){this.triggersSubmenu()&&this._parentMaterialMenu&&(this._hoverSubscription=this._parentMaterialMenu._hovered().subscribe(e=>{e===this._menuItemInstance&&!e.disabled&&this._parentMaterialMenu?._panelAnimationState!=="void"&&(this._openedBy="mouse",this._openMenu(!1))}))}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","mat-menu-trigger-for",""],["","matMenuTriggerFor",""]],hostAttrs:[1,"mat-mdc-menu-trigger"],hostVars:3,hostBindings:function(t,i){t&1&&w("click",function(r){return i._handleClick(r)})("mousedown",function(r){return i._handleMousedown(r)})("keydown",function(r){return i._handleKeydown(r)}),t&2&&D("aria-haspopup",i.menu?"menu":null)("aria-expanded",i.menuOpen)("aria-controls",i.menuOpen?i.menu==null?null:i.menu.panelId:null)},inputs:{_deprecatedMatMenuTriggerFor:[0,"mat-menu-trigger-for","_deprecatedMatMenuTriggerFor"],menu:[0,"matMenuTriggerFor","menu"],menuData:[0,"matMenuTriggerData","menuData"],restoreFocus:[0,"matMenuTriggerRestoreFocus","restoreFocus"]},outputs:{menuOpened:"menuOpened",onMenuOpen:"onMenuOpen",menuClosed:"menuClosed",onMenuClose:"onMenuClose"},exportAs:["matMenuTrigger"],features:[be]})}return a})();var yi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[Te,sn,N,yt]})}return a})();var xi=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({imports:[Ki,Te,un,N,Xe]})}return a})();var An=(()=>{class a{static{this.\u0275fac=function(t){return new(t||a)}}static{this.\u0275mod=M({type:a})}static{this.\u0275inj=T({imports:[ht,Yt,Zt,Ye,Ke,oi,di,li,Kt,Xt,ui,Jt,Xe,Ue,Ze,Ut,ti,ii,bi,gi,yi,ei,ni,xi,Yt,Zt,Ye,Ke,oi,di,li,Kt,Xt,ui,Jt,Xe,Ue,Ze,Ut,ti,ii,bi,gi,yi,ei,ni,xi]})}}return a})();function Ci(a){let n=a.cloneNode(!0),e=n.querySelectorAll("[id]"),t=a.nodeName.toLowerCase();n.removeAttribute("id");for(let i=0;i<e.length;i++)e[i].removeAttribute("id");return t==="canvas"?Bn(a,n):(t==="input"||t==="select"||t==="textarea")&&Fn(a,n),zn("canvas",a,n,Bn),zn("input, textarea, select",a,n,Fn),n}function zn(a,n,e,t){let i=n.querySelectorAll(a);if(i.length){let o=e.querySelectorAll(a);for(let r=0;r<i.length;r++)t(i[r],o[r])}}var Eo=0;function Fn(a,n){n.type!=="file"&&(n.value=a.value),n.type==="radio"&&n.name&&(n.name=`mat-clone-${n.name}-${Eo++}`)}function Bn(a,n){let e=n.getContext("2d");if(e)try{e.drawImage(a,0,0)}catch{}}function Pi(a){let n=a.getBoundingClientRect();return{top:n.top,right:n.right,bottom:n.bottom,left:n.left,width:n.width,height:n.height,x:n.x,y:n.y}}function Di(a,n,e){let{top:t,bottom:i,left:o,right:r}=a;return e>=t&&e<=i&&n>=o&&n<=r}function Ro(a,n){let e=n.left<a.left,t=n.left+n.width>a.right,i=n.top<a.top,o=n.top+n.height>a.bottom;return e||t||i||o}function it(a,n,e){a.top+=n,a.bottom=a.top+a.height,a.left+=e,a.right=a.left+a.width}function Nn(a,n,e,t){let{top:i,right:o,bottom:r,left:s,width:h,height:p}=a,x=h*n,H=p*n;return t>i-H&&t<r+H&&e>s-x&&e<o+x}var Lt=class{_document;positions=new Map;constructor(n){this._document=n}clear(){this.positions.clear()}cache(n){this.clear(),this.positions.set(this._document,{scrollPosition:this.getViewportScrollPosition()}),n.forEach(e=>{this.positions.set(e,{scrollPosition:{top:e.scrollTop,left:e.scrollLeft},clientRect:Pi(e)})})}handleScroll(n){let e=$e(n),t=this.positions.get(e);if(!t)return null;let i=t.scrollPosition,o,r;if(e===this._document){let p=this.getViewportScrollPosition();o=p.top,r=p.left}else o=e.scrollTop,r=e.scrollLeft;let s=i.top-o,h=i.left-r;return this.positions.forEach((p,x)=>{p.clientRect&&e!==x&&e.contains(x)&&it(p.clientRect,s,h)}),i.top=o,i.left=r,{top:s,left:h}}getViewportScrollPosition(){return{top:window.scrollY,left:window.scrollX}}};function Kn(a,n){let e=a.rootNodes;if(e.length===1&&e[0].nodeType===n.ELEMENT_NODE)return e[0];let t=n.createElement("div");return e.forEach(i=>t.appendChild(i)),t}function Ei(a,n,e){for(let t in n)if(n.hasOwnProperty(t)){let i=n[t];i?a.setProperty(t,i,e?.has(t)?"important":""):a.removeProperty(t)}return a}function Ve(a,n){let e=n?"":"none";Ei(a.style,{"touch-action":n?"":"none","-webkit-user-drag":n?"":"none","-webkit-tap-highlight-color":n?"":"transparent","user-select":e,"-ms-user-select":e,"-webkit-user-select":e,"-moz-user-select":e})}function Hn(a,n,e){Ei(a.style,{position:n?"":"fixed",top:n?"":"0",opacity:n?"":"0",left:n?"":"-999em"},e)}function Ot(a,n){return n&&n!="none"?a+" "+n:a}function Vn(a,n){a.style.width=`${n.width}px`,a.style.height=`${n.height}px`,a.style.transform=nt(n.left,n.top)}function nt(a,n){return`translate3d(${Math.round(a)}px, ${Math.round(n)}px, 0)`}var et={capture:!0},ki={passive:!1,capture:!0},Lo=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275cmp=P({type:a,selectors:[["ng-component"]],hostAttrs:["cdk-drag-resets-container",""],decls:0,vars:0,template:function(t,i){},styles:[`@layer cdk-resets {
  .cdk-drag-preview {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    inset: auto;
  }
}
.cdk-drag-placeholder *,
.cdk-drag-preview * {
  pointer-events: none !important;
}
`],encapsulation:2,changeDetection:0})}return a})(),Ft=(()=>{class a{_ngZone=c(J);_document=c(Ae);_styleLoader=c(_e);_renderer=c(Vt).createRenderer(null,null);_cleanupDocumentTouchmove;_scroll=new k;_dropInstances=new Set;_dragInstances=new Set;_activeDragInstances=R([]);_globalListeners;_draggingPredicate=e=>e.isDragging();_domNodesToDirectives=null;pointerMove=new k;pointerUp=new k;constructor(){}registerDropContainer(e){this._dropInstances.has(e)||this._dropInstances.add(e)}registerDragItem(e){this._dragInstances.add(e),this._dragInstances.size===1&&this._ngZone.runOutsideAngular(()=>{this._cleanupDocumentTouchmove?.(),this._cleanupDocumentTouchmove=this._renderer.listen(this._document,"touchmove",this._persistentTouchmoveListener,ki)})}removeDropContainer(e){this._dropInstances.delete(e)}removeDragItem(e){this._dragInstances.delete(e),this.stopDragging(e),this._dragInstances.size===0&&this._cleanupDocumentTouchmove?.()}startDragging(e,t){if(!(this._activeDragInstances().indexOf(e)>-1)&&(this._styleLoader.load(Lo),this._activeDragInstances.update(i=>[...i,e]),this._activeDragInstances().length===1)){let i=t.type.startsWith("touch"),o=s=>this.pointerUp.next(s),r=[["scroll",s=>this._scroll.next(s),et],["selectstart",this._preventDefaultWhileDragging,ki]];i?r.push(["touchend",o,et],["touchcancel",o,et]):r.push(["mouseup",o,et]),i||r.push(["mousemove",s=>this.pointerMove.next(s),ki]),this._ngZone.runOutsideAngular(()=>{this._globalListeners=r.map(([s,h,p])=>this._renderer.listen(this._document,s,h,p))})}}stopDragging(e){this._activeDragInstances.update(t=>{let i=t.indexOf(e);return i>-1?(t.splice(i,1),[...t]):t}),this._activeDragInstances().length===0&&this._clearGlobalListeners()}isDragging(e){return this._activeDragInstances().indexOf(e)>-1}scrolled(e){let t=[this._scroll];return e&&e!==this._document&&t.push(new Ht(i=>this._ngZone.runOutsideAngular(()=>{let o=this._renderer.listen(e,"scroll",r=>{this._activeDragInstances().length&&i.next(r)},et);return()=>{o()}}))),xe(...t)}registerDirectiveNode(e,t){this._domNodesToDirectives??=new WeakMap,this._domNodesToDirectives.set(e,t)}removeDirectiveNode(e){this._domNodesToDirectives?.delete(e)}getDragDirectiveForNode(e){return this._domNodesToDirectives?.get(e)||null}ngOnDestroy(){this._dragInstances.forEach(e=>this.removeDragItem(e)),this._dropInstances.forEach(e=>this.removeDropContainer(e)),this._domNodesToDirectives=null,this._clearGlobalListeners(),this.pointerMove.complete(),this.pointerUp.complete()}_preventDefaultWhileDragging=e=>{this._activeDragInstances().length>0&&e.preventDefault()};_persistentTouchmoveListener=e=>{this._activeDragInstances().length>0&&(this._activeDragInstances().some(this._draggingPredicate)&&e.preventDefault(),this.pointerMove.next(e))};_clearGlobalListeners(){this._globalListeners?.forEach(e=>e()),this._globalListeners=void 0}static \u0275fac=function(t){return new(t||a)};static \u0275prov=ke({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})();function jn(a){let n=a.toLowerCase().indexOf("ms")>-1?1:1e3;return parseFloat(a)*n}function Oo(a){let n=getComputedStyle(a),e=wi(n,"transition-property"),t=e.find(s=>s==="transform"||s==="all");if(!t)return 0;let i=e.indexOf(t),o=wi(n,"transition-duration"),r=wi(n,"transition-delay");return jn(o[i])+jn(r[i])}function wi(a,n){return a.getPropertyValue(n).split(",").map(t=>t.trim())}var Ao=new Set(["position"]),Ii=class{_document;_rootElement;_direction;_initialDomRect;_previewTemplate;_previewClass;_pickupPositionOnPage;_initialTransform;_zIndex;_renderer;_previewEmbeddedView=null;_preview;get element(){return this._preview}constructor(n,e,t,i,o,r,s,h,p,x){this._document=n,this._rootElement=e,this._direction=t,this._initialDomRect=i,this._previewTemplate=o,this._previewClass=r,this._pickupPositionOnPage=s,this._initialTransform=h,this._zIndex=p,this._renderer=x}attach(n){this._preview=this._createPreview(),n.appendChild(this._preview),Gn(this._preview)&&this._preview.showPopover()}destroy(){this._preview.remove(),this._previewEmbeddedView?.destroy(),this._preview=this._previewEmbeddedView=null}setTransform(n){this._preview.style.transform=n}getBoundingClientRect(){return this._preview.getBoundingClientRect()}addClass(n){this._preview.classList.add(n)}getTransitionDuration(){return Oo(this._preview)}addEventListener(n,e){return this._renderer.listen(this._preview,n,e)}_createPreview(){let n=this._previewTemplate,e=this._previewClass,t=n?n.template:null,i;if(t&&n){let o=n.matchSize?this._initialDomRect:null,r=n.viewContainer.createEmbeddedView(t,n.context);r.detectChanges(),i=Kn(r,this._document),this._previewEmbeddedView=r,n.matchSize?Vn(i,o):i.style.transform=nt(this._pickupPositionOnPage.x,this._pickupPositionOnPage.y)}else i=Ci(this._rootElement),Vn(i,this._initialDomRect),this._initialTransform&&(i.style.transform=this._initialTransform);return Ei(i.style,{"pointer-events":"none",margin:Gn(i)?"0 auto 0 0":"0",position:"fixed",top:"0",left:"0","z-index":this._zIndex+""},Ao),Ve(i,!1),i.classList.add("cdk-drag-preview"),i.setAttribute("popover","manual"),i.setAttribute("dir",this._direction),e&&(Array.isArray(e)?e.forEach(o=>i.classList.add(o)):i.classList.add(e)),i}};function Gn(a){return"showPopover"in a}var zo={passive:!0},Qn={passive:!1},Fo={passive:!1,capture:!0},Bo=800,qn="cdk-drag-placeholder",Wn=new Set(["position"]);function Xn(a,n,e={dragStartThreshold:5,pointerDirectionChangeThreshold:5}){let t=a.get(we,null,{optional:!0})||a.get(Vt).createRenderer(null,null);return new Si(n,e,a.get(Ae),a.get(J),a.get(vt),a.get(Ft),t)}var Si=class{_config;_document;_ngZone;_viewportRuler;_dragDropRegistry;_renderer;_rootElementCleanups;_cleanupShadowRootSelectStart;_preview=null;_previewContainer;_placeholderRef=null;_placeholder;_pickupPositionInElement;_pickupPositionOnPage;_marker;_anchor=null;_passiveTransform={x:0,y:0};_activeTransform={x:0,y:0};_initialTransform;_hasStartedDragging=R(!1);_hasMoved=!1;_initialContainer;_initialIndex;_parentPositions;_moveEvents=new k;_pointerDirectionDelta;_pointerPositionAtLastDirectionChange;_lastKnownPointerPosition;_rootElement;_ownerSVGElement=null;_rootElementTapHighlight;_pointerMoveSubscription=ne.EMPTY;_pointerUpSubscription=ne.EMPTY;_scrollSubscription=ne.EMPTY;_resizeSubscription=ne.EMPTY;_lastTouchEventTime;_dragStartTime;_boundaryElement=null;_nativeInteractionsEnabled=!0;_initialDomRect;_previewRect;_boundaryRect;_previewTemplate;_placeholderTemplate;_handles=[];_disabledHandles=new Set;_dropContainer;_direction="ltr";_parentDragRef=null;_cachedShadowRoot;lockAxis=null;dragStartDelay=0;previewClass;scale=1;get disabled(){return this._disabled||!!(this._dropContainer&&this._dropContainer.disabled)}set disabled(n){n!==this._disabled&&(this._disabled=n,this._toggleNativeDragInteractions(),this._handles.forEach(e=>Ve(e,n)))}_disabled=!1;beforeStarted=new k;started=new k;released=new k;ended=new k;entered=new k;exited=new k;dropped=new k;moved=this._moveEvents;data;constrainPosition;constructor(n,e,t,i,o,r,s){this._config=e,this._document=t,this._ngZone=i,this._viewportRuler=o,this._dragDropRegistry=r,this._renderer=s,this.withRootElement(n).withParent(e.parentDragRef||null),this._parentPositions=new Lt(t),r.registerDragItem(this)}getPlaceholderElement(){return this._placeholder}getRootElement(){return this._rootElement}getVisibleElement(){return this.isDragging()?this.getPlaceholderElement():this.getRootElement()}withHandles(n){this._handles=n.map(t=>ve(t)),this._handles.forEach(t=>Ve(t,this.disabled)),this._toggleNativeDragInteractions();let e=new Set;return this._disabledHandles.forEach(t=>{this._handles.indexOf(t)>-1&&e.add(t)}),this._disabledHandles=e,this}withPreviewTemplate(n){return this._previewTemplate=n,this}withPlaceholderTemplate(n){return this._placeholderTemplate=n,this}withRootElement(n){let e=ve(n);if(e!==this._rootElement){this._removeRootElementListeners();let t=this._renderer;this._rootElementCleanups=this._ngZone.runOutsideAngular(()=>[t.listen(e,"mousedown",this._pointerDown,Qn),t.listen(e,"touchstart",this._pointerDown,zo),t.listen(e,"dragstart",this._nativeDragStart,Qn)]),this._initialTransform=void 0,this._rootElement=e}return typeof SVGElement<"u"&&this._rootElement instanceof SVGElement&&(this._ownerSVGElement=this._rootElement.ownerSVGElement),this}withBoundaryElement(n){return this._boundaryElement=n?ve(n):null,this._resizeSubscription.unsubscribe(),n&&(this._resizeSubscription=this._viewportRuler.change(10).subscribe(()=>this._containInsideBoundaryOnResize())),this}withParent(n){return this._parentDragRef=n,this}dispose(){this._removeRootElementListeners(),this.isDragging()&&this._rootElement?.remove(),this._marker?.remove(),this._destroyPreview(),this._destroyPlaceholder(),this._dragDropRegistry.removeDragItem(this),this._removeListeners(),this.beforeStarted.complete(),this.started.complete(),this.released.complete(),this.ended.complete(),this.entered.complete(),this.exited.complete(),this.dropped.complete(),this._moveEvents.complete(),this._handles=[],this._disabledHandles.clear(),this._dropContainer=void 0,this._resizeSubscription.unsubscribe(),this._parentPositions.clear(),this._boundaryElement=this._rootElement=this._ownerSVGElement=this._placeholderTemplate=this._previewTemplate=this._marker=this._parentDragRef=null}isDragging(){return this._hasStartedDragging()&&this._dragDropRegistry.isDragging(this)}reset(){this._rootElement.style.transform=this._initialTransform||"",this._activeTransform={x:0,y:0},this._passiveTransform={x:0,y:0}}resetToBoundary(){if(this._boundaryElement&&this._rootElement&&Ro(this._boundaryElement.getBoundingClientRect(),this._rootElement.getBoundingClientRect())){let n=this._boundaryElement.getBoundingClientRect(),e=this._rootElement.getBoundingClientRect(),t=0,i=0;e.left<n.left?t=n.left-e.left:e.right>n.right&&(t=n.right-e.right),e.top<n.top?i=n.top-e.top:e.bottom>n.bottom&&(i=n.bottom-e.bottom);let o=this._activeTransform.x,r=this._activeTransform.y,s=o+t,h=r+i;this._rootElement.style.transform=nt(s,h),this._activeTransform={x:s,y:h},this._passiveTransform={x:s,y:h}}}disableHandle(n){!this._disabledHandles.has(n)&&this._handles.indexOf(n)>-1&&(this._disabledHandles.add(n),Ve(n,!0))}enableHandle(n){this._disabledHandles.has(n)&&(this._disabledHandles.delete(n),Ve(n,this.disabled))}withDirection(n){return this._direction=n,this}_withDropContainer(n){this._dropContainer=n}getFreeDragPosition(){let n=this.isDragging()?this._activeTransform:this._passiveTransform;return{x:n.x,y:n.y}}setFreeDragPosition(n){return this._activeTransform={x:0,y:0},this._passiveTransform.x=n.x,this._passiveTransform.y=n.y,this._dropContainer||this._applyRootElementTransform(n.x,n.y),this}withPreviewContainer(n){return this._previewContainer=n,this}_sortFromLastPointerPosition(){let n=this._lastKnownPointerPosition;n&&this._dropContainer&&this._updateActiveDropContainer(this._getConstrainedPointerPosition(n),n)}_removeListeners(){this._pointerMoveSubscription.unsubscribe(),this._pointerUpSubscription.unsubscribe(),this._scrollSubscription.unsubscribe(),this._cleanupShadowRootSelectStart?.(),this._cleanupShadowRootSelectStart=void 0}_destroyPreview(){this._preview?.destroy(),this._preview=null}_destroyPlaceholder(){this._anchor?.remove(),this._placeholder?.remove(),this._placeholderRef?.destroy(),this._placeholder=this._anchor=this._placeholderRef=null}_pointerDown=n=>{if(this.beforeStarted.next(),this._handles.length){let e=this._getTargetHandle(n);e&&!this._disabledHandles.has(e)&&!this.disabled&&this._initializeDragSequence(e,n)}else this.disabled||this._initializeDragSequence(this._rootElement,n)};_pointerMove=n=>{let e=this._getPointerPositionOnPage(n);if(!this._hasStartedDragging()){let i=Math.abs(e.x-this._pickupPositionOnPage.x),o=Math.abs(e.y-this._pickupPositionOnPage.y);if(i+o>=this._config.dragStartThreshold){let s=Date.now()>=this._dragStartTime+this._getDragStartDelay(n),h=this._dropContainer;if(!s){this._endDragSequence(n);return}(!h||!h.isDragging()&&!h.isReceiving())&&(n.cancelable&&n.preventDefault(),this._hasStartedDragging.set(!0),this._ngZone.run(()=>this._startDragSequence(n)))}return}n.cancelable&&n.preventDefault();let t=this._getConstrainedPointerPosition(e);if(this._hasMoved=!0,this._lastKnownPointerPosition=e,this._updatePointerDirectionDelta(t),this._dropContainer)this._updateActiveDropContainer(t,e);else{let i=this.constrainPosition?this._initialDomRect:this._pickupPositionOnPage,o=this._activeTransform;o.x=t.x-i.x+this._passiveTransform.x,o.y=t.y-i.y+this._passiveTransform.y,this._applyRootElementTransform(o.x,o.y)}this._moveEvents.observers.length&&this._ngZone.run(()=>{this._moveEvents.next({source:this,pointerPosition:t,event:n,distance:this._getDragDistance(t),delta:this._pointerDirectionDelta})})};_pointerUp=n=>{this._endDragSequence(n)};_endDragSequence(n){if(this._dragDropRegistry.isDragging(this)&&(this._removeListeners(),this._dragDropRegistry.stopDragging(this),this._toggleNativeDragInteractions(),this._handles&&(this._rootElement.style.webkitTapHighlightColor=this._rootElementTapHighlight),!!this._hasStartedDragging()))if(this.released.next({source:this,event:n}),this._dropContainer)this._dropContainer._stopScrolling(),this._animatePreviewToPlaceholder().then(()=>{this._cleanupDragArtifacts(n),this._cleanupCachedDimensions(),this._dragDropRegistry.stopDragging(this)});else{this._passiveTransform.x=this._activeTransform.x;let e=this._getPointerPositionOnPage(n);this._passiveTransform.y=this._activeTransform.y,this._ngZone.run(()=>{this.ended.next({source:this,distance:this._getDragDistance(e),dropPoint:e,event:n})}),this._cleanupCachedDimensions(),this._dragDropRegistry.stopDragging(this)}}_startDragSequence(n){tt(n)&&(this._lastTouchEventTime=Date.now()),this._toggleNativeDragInteractions();let e=this._getShadowRoot(),t=this._dropContainer;if(e&&this._ngZone.runOutsideAngular(()=>{this._cleanupShadowRootSelectStart=this._renderer.listen(e,"selectstart",No,Fo)}),t){let i=this._rootElement,o=i.parentNode,r=this._placeholder=this._createPlaceholderElement(),s=this._marker=this._marker||this._document.createComment("");o.insertBefore(s,i),this._initialTransform=i.style.transform||"",this._preview=new Ii(this._document,this._rootElement,this._direction,this._initialDomRect,this._previewTemplate||null,this.previewClass||null,this._pickupPositionOnPage,this._initialTransform,this._config.zIndex||1e3,this._renderer),this._preview.attach(this._getPreviewInsertionPoint(o,e)),Hn(i,!1,Wn),this._document.body.appendChild(o.replaceChild(r,i)),this.started.next({source:this,event:n}),t.start(),this._initialContainer=t,this._initialIndex=t.getItemIndex(this)}else this.started.next({source:this,event:n}),this._initialContainer=this._initialIndex=void 0;this._parentPositions.cache(t?t.getScrollableParents():[])}_initializeDragSequence(n,e){this._parentDragRef&&e.stopPropagation();let t=this.isDragging(),i=tt(e),o=!i&&e.button!==0,r=this._rootElement,s=$e(e),h=!i&&this._lastTouchEventTime&&this._lastTouchEventTime+Bo>Date.now(),p=i?bt(e):ut(e);if(s&&s.draggable&&e.type==="mousedown"&&e.preventDefault(),t||o||h||p)return;if(this._handles.length){let q=r.style;this._rootElementTapHighlight=q.webkitTapHighlightColor||"",q.webkitTapHighlightColor="transparent"}this._hasMoved=!1,this._hasStartedDragging.set(this._hasMoved),this._removeListeners(),this._initialDomRect=this._rootElement.getBoundingClientRect(),this._pointerMoveSubscription=this._dragDropRegistry.pointerMove.subscribe(this._pointerMove),this._pointerUpSubscription=this._dragDropRegistry.pointerUp.subscribe(this._pointerUp),this._scrollSubscription=this._dragDropRegistry.scrolled(this._getShadowRoot()).subscribe(q=>this._updateOnScroll(q)),this._boundaryElement&&(this._boundaryRect=Pi(this._boundaryElement));let x=this._previewTemplate;this._pickupPositionInElement=x&&x.template&&!x.matchSize?{x:0,y:0}:this._getPointerPositionInElement(this._initialDomRect,n,e);let H=this._pickupPositionOnPage=this._lastKnownPointerPosition=this._getPointerPositionOnPage(e);this._pointerDirectionDelta={x:0,y:0},this._pointerPositionAtLastDirectionChange={x:H.x,y:H.y},this._dragStartTime=Date.now(),this._dragDropRegistry.startDragging(this,e)}_cleanupDragArtifacts(n){Hn(this._rootElement,!0,Wn),this._marker.parentNode.replaceChild(this._rootElement,this._marker),this._destroyPreview(),this._destroyPlaceholder(),this._initialDomRect=this._boundaryRect=this._previewRect=this._initialTransform=void 0,this._ngZone.run(()=>{let e=this._dropContainer,t=e.getItemIndex(this),i=this._getPointerPositionOnPage(n),o=this._getDragDistance(i),r=e._isOverContainer(i.x,i.y);this.ended.next({source:this,distance:o,dropPoint:i,event:n}),this.dropped.next({item:this,currentIndex:t,previousIndex:this._initialIndex,container:e,previousContainer:this._initialContainer,isPointerOverContainer:r,distance:o,dropPoint:i,event:n}),e.drop(this,t,this._initialIndex,this._initialContainer,r,o,i,n),this._dropContainer=this._initialContainer})}_updateActiveDropContainer({x:n,y:e},{x:t,y:i}){let o=this._initialContainer._getSiblingContainerFromPosition(this,n,e);!o&&this._dropContainer!==this._initialContainer&&this._initialContainer._isOverContainer(n,e)&&(o=this._initialContainer),o&&o!==this._dropContainer&&this._ngZone.run(()=>{let r=this._dropContainer.getItemIndex(this),s=this._dropContainer.getItemAtIndex(r+1)?.getVisibleElement()||null;this.exited.next({item:this,container:this._dropContainer}),this._dropContainer.exit(this),this._conditionallyInsertAnchor(o,this._dropContainer,s),this._dropContainer=o,this._dropContainer.enter(this,n,e,o===this._initialContainer&&o.sortingDisabled?this._initialIndex:void 0),this.entered.next({item:this,container:o,currentIndex:o.getItemIndex(this)})}),this.isDragging()&&(this._dropContainer._startScrollingIfNecessary(t,i),this._dropContainer._sortItem(this,n,e,this._pointerDirectionDelta),this.constrainPosition?this._applyPreviewTransform(n,e):this._applyPreviewTransform(n-this._pickupPositionInElement.x,e-this._pickupPositionInElement.y))}_animatePreviewToPlaceholder(){if(!this._hasMoved)return Promise.resolve();let n=this._placeholder.getBoundingClientRect();this._preview.addClass("cdk-drag-animating"),this._applyPreviewTransform(n.left,n.top);let e=this._preview.getTransitionDuration();return e===0?Promise.resolve():this._ngZone.runOutsideAngular(()=>new Promise(t=>{let i=s=>{(!s||this._preview&&$e(s)===this._preview.element&&s.propertyName==="transform")&&(r(),t(),clearTimeout(o))},o=setTimeout(i,e*1.5),r=this._preview.addEventListener("transitionend",i)}))}_createPlaceholderElement(){let n=this._placeholderTemplate,e=n?n.template:null,t;return e?(this._placeholderRef=n.viewContainer.createEmbeddedView(e,n.context),this._placeholderRef.detectChanges(),t=Kn(this._placeholderRef,this._document)):t=Ci(this._rootElement),t.style.pointerEvents="none",t.classList.add(qn),t}_getPointerPositionInElement(n,e,t){let i=e===this._rootElement?null:e,o=i?i.getBoundingClientRect():n,r=tt(t)?t.targetTouches[0]:t,s=this._getViewportScrollPosition(),h=r.pageX-o.left-s.left,p=r.pageY-o.top-s.top;return{x:o.left-n.left+h,y:o.top-n.top+p}}_getPointerPositionOnPage(n){let e=this._getViewportScrollPosition(),t=tt(n)?n.touches[0]||n.changedTouches[0]||{pageX:0,pageY:0}:n,i=t.pageX-e.left,o=t.pageY-e.top;if(this._ownerSVGElement){let r=this._ownerSVGElement.getScreenCTM();if(r){let s=this._ownerSVGElement.createSVGPoint();return s.x=i,s.y=o,s.matrixTransform(r.inverse())}}return{x:i,y:o}}_getConstrainedPointerPosition(n){let e=this._dropContainer?this._dropContainer.lockAxis:null,{x:t,y:i}=this.constrainPosition?this.constrainPosition(n,this,this._initialDomRect,this._pickupPositionInElement):n;if(this.lockAxis==="x"||e==="x"?i=this._pickupPositionOnPage.y-(this.constrainPosition?this._pickupPositionInElement.y:0):(this.lockAxis==="y"||e==="y")&&(t=this._pickupPositionOnPage.x-(this.constrainPosition?this._pickupPositionInElement.x:0)),this._boundaryRect){let{x:o,y:r}=this.constrainPosition?{x:0,y:0}:this._pickupPositionInElement,s=this._boundaryRect,{width:h,height:p}=this._getPreviewRect(),x=s.top+r,H=s.bottom-(p-r),q=s.left+o,Oe=s.right-(h-o);t=$n(t,q,Oe),i=$n(i,x,H)}return{x:t,y:i}}_updatePointerDirectionDelta(n){let{x:e,y:t}=n,i=this._pointerDirectionDelta,o=this._pointerPositionAtLastDirectionChange,r=Math.abs(e-o.x),s=Math.abs(t-o.y);return r>this._config.pointerDirectionChangeThreshold&&(i.x=e>o.x?1:-1,o.x=e),s>this._config.pointerDirectionChangeThreshold&&(i.y=t>o.y?1:-1,o.y=t),i}_toggleNativeDragInteractions(){if(!this._rootElement||!this._handles)return;let n=this._handles.length>0||!this.isDragging();n!==this._nativeInteractionsEnabled&&(this._nativeInteractionsEnabled=n,Ve(this._rootElement,n))}_removeRootElementListeners(){this._rootElementCleanups?.forEach(n=>n()),this._rootElementCleanups=void 0}_applyRootElementTransform(n,e){let t=1/this.scale,i=nt(n*t,e*t),o=this._rootElement.style;this._initialTransform==null&&(this._initialTransform=o.transform&&o.transform!="none"?o.transform:""),o.transform=Ot(i,this._initialTransform)}_applyPreviewTransform(n,e){let t=this._previewTemplate?.template?void 0:this._initialTransform,i=nt(n,e);this._preview.setTransform(Ot(i,t))}_getDragDistance(n){let e=this._pickupPositionOnPage;return e?{x:n.x-e.x,y:n.y-e.y}:{x:0,y:0}}_cleanupCachedDimensions(){this._boundaryRect=this._previewRect=void 0,this._parentPositions.clear()}_containInsideBoundaryOnResize(){let{x:n,y:e}=this._passiveTransform;if(n===0&&e===0||this.isDragging()||!this._boundaryElement)return;let t=this._rootElement.getBoundingClientRect(),i=this._boundaryElement.getBoundingClientRect();if(i.width===0&&i.height===0||t.width===0&&t.height===0)return;let o=i.left-t.left,r=t.right-i.right,s=i.top-t.top,h=t.bottom-i.bottom;i.width>t.width?(o>0&&(n+=o),r>0&&(n-=r)):n=0,i.height>t.height?(s>0&&(e+=s),h>0&&(e-=h)):e=0,(n!==this._passiveTransform.x||e!==this._passiveTransform.y)&&this.setFreeDragPosition({y:e,x:n})}_getDragStartDelay(n){let e=this.dragStartDelay;return typeof e=="number"?e:tt(n)?e.touch:e?e.mouse:0}_updateOnScroll(n){let e=this._parentPositions.handleScroll(n);if(e){let t=$e(n);this._boundaryRect&&t!==this._boundaryElement&&t.contains(this._boundaryElement)&&it(this._boundaryRect,e.top,e.left),this._pickupPositionOnPage.x+=e.left,this._pickupPositionOnPage.y+=e.top,this._dropContainer||(this._activeTransform.x-=e.left,this._activeTransform.y-=e.top,this._applyRootElementTransform(this._activeTransform.x,this._activeTransform.y))}}_getViewportScrollPosition(){return this._parentPositions.positions.get(this._document)?.scrollPosition||this._parentPositions.getViewportScrollPosition()}_getShadowRoot(){return this._cachedShadowRoot===void 0&&(this._cachedShadowRoot=pt(this._rootElement)),this._cachedShadowRoot}_getPreviewInsertionPoint(n,e){let t=this._previewContainer||"global";if(t==="parent")return n;if(t==="global"){let i=this._document;return e||i.fullscreenElement||i.webkitFullscreenElement||i.mozFullScreenElement||i.msFullscreenElement||i.body}return ve(t)}_getPreviewRect(){return(!this._previewRect||!this._previewRect.width&&!this._previewRect.height)&&(this._previewRect=this._preview?this._preview.getBoundingClientRect():this._initialDomRect),this._previewRect}_nativeDragStart=n=>{if(this._handles.length){let e=this._getTargetHandle(n);e&&!this._disabledHandles.has(e)&&!this.disabled&&n.preventDefault()}else this.disabled||n.preventDefault()};_getTargetHandle(n){return this._handles.find(e=>n.target&&(n.target===e||e.contains(n.target)))}_conditionallyInsertAnchor(n,e,t){if(n===this._initialContainer)this._anchor?.remove(),this._anchor=null;else if(e===this._initialContainer&&e.hasAnchor){let i=this._anchor??=Ci(this._placeholder);i.classList.remove(qn),i.classList.add("cdk-drag-anchor"),i.style.transform="",t?t.before(i):ve(e.element).appendChild(i)}}};function $n(a,n,e){return Math.max(n,Math.min(e,a))}function tt(a){return a.type[0]==="t"}function No(a){a.preventDefault()}function Bt(a,n,e){let t=Un(n,a.length-1),i=Un(e,a.length-1);if(t===i)return;let o=a[t],r=i<t?-1:1;for(let s=t;s!==i;s+=r)a[s]=a[s+r];a[i]=o}function Un(a,n){return Math.max(0,Math.min(n,a))}var At=class{_dragDropRegistry;_element;_sortPredicate;_itemPositions=[];_activeDraggables;orientation="vertical";direction="ltr";constructor(n){this._dragDropRegistry=n}_previousSwap={drag:null,delta:0,overlaps:!1};start(n){this.withItems(n)}sort(n,e,t,i){let o=this._itemPositions,r=this._getItemIndexFromPointerPosition(n,e,t,i);if(r===-1&&o.length>0)return null;let s=this.orientation==="horizontal",h=o.findIndex(ie=>ie.drag===n),p=o[r],x=o[h].clientRect,H=p.clientRect,q=h>r?1:-1,Oe=this._getItemOffsetPx(x,H,q),ha=this._getSiblingOffsetPx(h,o,q),pa=o.slice();return Bt(o,h,r),o.forEach((ie,_a)=>{if(pa[_a]===ie)return;let Ri=ie.drag===n,Nt=Ri?Oe:ha,Li=Ri?n.getPlaceholderElement():ie.drag.getRootElement();ie.offset+=Nt;let Oi=Math.round(ie.offset*(1/ie.drag.scale));s?(Li.style.transform=Ot(`translate3d(${Oi}px, 0, 0)`,ie.initialTransform),it(ie.clientRect,0,Nt)):(Li.style.transform=Ot(`translate3d(0, ${Oi}px, 0)`,ie.initialTransform),it(ie.clientRect,Nt,0))}),this._previousSwap.overlaps=Di(H,e,t),this._previousSwap.drag=p.drag,this._previousSwap.delta=s?i.x:i.y,{previousIndex:h,currentIndex:r}}enter(n,e,t,i){let o=this._activeDraggables,r=o.indexOf(n),s=n.getPlaceholderElement();r>-1&&o.splice(r,1);let h=i==null||i<0?this._getItemIndexFromPointerPosition(n,e,t):i,p=o[h];if(p===n&&(p=o[h+1]),!p&&(h==null||h===-1||h<o.length-1)&&this._shouldEnterAsFirstChild(e,t)&&(p=o[0]),p&&!this._dragDropRegistry.isDragging(p)){let x=p.getRootElement();x.parentElement.insertBefore(s,x),o.splice(h,0,n)}else this._element.appendChild(s),o.push(n);s.style.transform="",this._cacheItemPositions()}withItems(n){this._activeDraggables=n.slice(),this._cacheItemPositions()}withSortPredicate(n){this._sortPredicate=n}reset(){this._activeDraggables?.forEach(n=>{let e=n.getRootElement();if(e){let t=this._itemPositions.find(i=>i.drag===n)?.initialTransform;e.style.transform=t||""}}),this._itemPositions=[],this._activeDraggables=[],this._previousSwap.drag=null,this._previousSwap.delta=0,this._previousSwap.overlaps=!1}getActiveItemsSnapshot(){return this._activeDraggables}getItemIndex(n){return this._getVisualItemPositions().findIndex(e=>e.drag===n)}getItemAtIndex(n){return this._getVisualItemPositions()[n]?.drag||null}updateOnScroll(n,e){this._itemPositions.forEach(({clientRect:t})=>{it(t,n,e)}),this._itemPositions.forEach(({drag:t})=>{this._dragDropRegistry.isDragging(t)&&t._sortFromLastPointerPosition()})}withElementContainer(n){this._element=n}_cacheItemPositions(){let n=this.orientation==="horizontal";this._itemPositions=this._activeDraggables.map(e=>{let t=e.getVisibleElement();return{drag:e,offset:0,initialTransform:t.style.transform||"",clientRect:Pi(t)}}).sort((e,t)=>n?e.clientRect.left-t.clientRect.left:e.clientRect.top-t.clientRect.top)}_getVisualItemPositions(){return this.orientation==="horizontal"&&this.direction==="rtl"?this._itemPositions.slice().reverse():this._itemPositions}_getItemOffsetPx(n,e,t){let i=this.orientation==="horizontal",o=i?e.left-n.left:e.top-n.top;return t===-1&&(o+=i?e.width-n.width:e.height-n.height),o}_getSiblingOffsetPx(n,e,t){let i=this.orientation==="horizontal",o=e[n].clientRect,r=e[n+t*-1],s=o[i?"width":"height"]*t;if(r){let h=i?"left":"top",p=i?"right":"bottom";t===-1?s-=r.clientRect[h]-o[p]:s+=o[h]-r.clientRect[p]}return s}_shouldEnterAsFirstChild(n,e){if(!this._activeDraggables.length)return!1;let t=this._itemPositions,i=this.orientation==="horizontal";if(t[0].drag!==this._activeDraggables[0]){let r=t[t.length-1].clientRect;return i?n>=r.right:e>=r.bottom}else{let r=t[0].clientRect;return i?n<=r.left:e<=r.top}}_getItemIndexFromPointerPosition(n,e,t,i){let o=this.orientation==="horizontal",r=this._itemPositions.findIndex(({drag:s,clientRect:h})=>{if(s===n)return!1;if(i){let p=o?i.x:i.y;if(s===this._previousSwap.drag&&this._previousSwap.overlaps&&p===this._previousSwap.delta)return!1}return o?e>=Math.floor(h.left)&&e<Math.floor(h.right):t>=Math.floor(h.top)&&t<Math.floor(h.bottom)});return r===-1||!this._sortPredicate(r,n)?-1:r}},Ti=class{_document;_dragDropRegistry;_element;_sortPredicate;_rootNode;_activeItems;_previousSwap={drag:null,deltaX:0,deltaY:0,overlaps:!1};_relatedNodes=[];constructor(n,e){this._document=n,this._dragDropRegistry=e}start(n){let e=this._element.childNodes;this._relatedNodes=[];for(let t=0;t<e.length;t++){let i=e[t];this._relatedNodes.push([i,i.nextSibling])}this.withItems(n)}sort(n,e,t,i){let o=this._getItemIndexFromPointerPosition(n,e,t),r=this._previousSwap;if(o===-1||this._activeItems[o]===n)return null;let s=this._activeItems[o];if(r.drag===s&&r.overlaps&&r.deltaX===i.x&&r.deltaY===i.y)return null;let h=this.getItemIndex(n),p=n.getPlaceholderElement(),x=s.getRootElement();o>h?x.after(p):x.before(p),Bt(this._activeItems,h,o);let H=this._getRootNode().elementFromPoint(e,t);return r.deltaX=i.x,r.deltaY=i.y,r.drag=s,r.overlaps=x===H||x.contains(H),{previousIndex:h,currentIndex:o}}enter(n,e,t,i){let o=this._activeItems.indexOf(n);o>-1&&this._activeItems.splice(o,1);let r=i==null||i<0?this._getItemIndexFromPointerPosition(n,e,t):i;r===-1&&(r=this._getClosestItemIndexToPointer(n,e,t));let s=this._activeItems[r];s&&!this._dragDropRegistry.isDragging(s)?(this._activeItems.splice(r,0,n),s.getRootElement().before(n.getPlaceholderElement())):(this._activeItems.push(n),this._element.appendChild(n.getPlaceholderElement()))}withItems(n){this._activeItems=n.slice()}withSortPredicate(n){this._sortPredicate=n}reset(){let n=this._element,e=this._previousSwap;for(let t=this._relatedNodes.length-1;t>-1;t--){let[i,o]=this._relatedNodes[t];i.parentNode===n&&i.nextSibling!==o&&(o===null?n.appendChild(i):o.parentNode===n&&n.insertBefore(i,o))}this._relatedNodes=[],this._activeItems=[],e.drag=null,e.deltaX=e.deltaY=0,e.overlaps=!1}getActiveItemsSnapshot(){return this._activeItems}getItemIndex(n){return this._activeItems.indexOf(n)}getItemAtIndex(n){return this._activeItems[n]||null}updateOnScroll(){this._activeItems.forEach(n=>{this._dragDropRegistry.isDragging(n)&&n._sortFromLastPointerPosition()})}withElementContainer(n){n!==this._element&&(this._element=n,this._rootNode=void 0)}_getItemIndexFromPointerPosition(n,e,t){let i=this._getRootNode().elementFromPoint(Math.floor(e),Math.floor(t)),o=i?this._activeItems.findIndex(r=>{let s=r.getRootElement();return i===s||s.contains(i)}):-1;return o===-1||!this._sortPredicate(o,n)?-1:o}_getRootNode(){return this._rootNode||(this._rootNode=pt(this._element)||this._document),this._rootNode}_getClosestItemIndexToPointer(n,e,t){if(this._activeItems.length===0)return-1;if(this._activeItems.length===1)return 0;let i=1/0,o=-1;for(let r=0;r<this._activeItems.length;r++){let s=this._activeItems[r];if(s!==n){let{x:h,y:p}=s.getRootElement().getBoundingClientRect(),x=Math.hypot(e-h,t-p);x<i&&(i=x,o=r)}}return o}},Yn=.05,Jn=.05,re=(function(a){return a[a.NONE=0]="NONE",a[a.UP=1]="UP",a[a.DOWN=2]="DOWN",a})(re||{}),U=(function(a){return a[a.NONE=0]="NONE",a[a.LEFT=1]="LEFT",a[a.RIGHT=2]="RIGHT",a})(U||{});function ea(a,n){return new Mi(n,a.get(Ft),a.get(Ae),a.get(J),a.get(vt))}var Mi=class{_dragDropRegistry;_ngZone;_viewportRuler;element;disabled=!1;sortingDisabled=!1;lockAxis=null;autoScrollDisabled=!1;autoScrollStep=2;hasAnchor=!1;enterPredicate=()=>!0;sortPredicate=()=>!0;beforeStarted=new k;entered=new k;exited=new k;dropped=new k;sorted=new k;receivingStarted=new k;receivingStopped=new k;data;_container;_isDragging=!1;_parentPositions;_sortStrategy;_domRect;_draggables=[];_siblings=[];_activeSiblings=new Set;_viewportScrollSubscription=ne.EMPTY;_verticalScrollDirection=re.NONE;_horizontalScrollDirection=U.NONE;_scrollNode;_stopScrollTimers=new k;_cachedShadowRoot=null;_document;_scrollableElements=[];_initialScrollSnap;_direction="ltr";constructor(n,e,t,i,o){this._dragDropRegistry=e,this._ngZone=i,this._viewportRuler=o;let r=this.element=ve(n);this._document=t,this.withOrientation("vertical").withElementContainer(r),e.registerDropContainer(this),this._parentPositions=new Lt(t)}dispose(){this._stopScrolling(),this._stopScrollTimers.complete(),this._viewportScrollSubscription.unsubscribe(),this.beforeStarted.complete(),this.entered.complete(),this.exited.complete(),this.dropped.complete(),this.sorted.complete(),this.receivingStarted.complete(),this.receivingStopped.complete(),this._activeSiblings.clear(),this._scrollNode=null,this._parentPositions.clear(),this._dragDropRegistry.removeDropContainer(this)}isDragging(){return this._isDragging}start(){this._draggingStarted(),this._notifyReceivingSiblings()}enter(n,e,t,i){this._draggingStarted(),i==null&&this.sortingDisabled&&(i=this._draggables.indexOf(n)),this._sortStrategy.enter(n,e,t,i),this._cacheParentPositions(),this._notifyReceivingSiblings(),this.entered.next({item:n,container:this,currentIndex:this.getItemIndex(n)})}exit(n){this._reset(),this.exited.next({item:n,container:this})}drop(n,e,t,i,o,r,s,h={}){this._reset(),this.dropped.next({item:n,currentIndex:e,previousIndex:t,container:this,previousContainer:i,isPointerOverContainer:o,distance:r,dropPoint:s,event:h})}withItems(n){let e=this._draggables;return this._draggables=n,n.forEach(t=>t._withDropContainer(this)),this.isDragging()&&(e.filter(i=>i.isDragging()).every(i=>n.indexOf(i)===-1)?this._reset():this._sortStrategy.withItems(this._draggables)),this}withDirection(n){return this._direction=n,this._sortStrategy instanceof At&&(this._sortStrategy.direction=n),this}connectedTo(n){return this._siblings=n.slice(),this}withOrientation(n){if(n==="mixed")this._sortStrategy=new Ti(this._document,this._dragDropRegistry);else{let e=new At(this._dragDropRegistry);e.direction=this._direction,e.orientation=n,this._sortStrategy=e}return this._sortStrategy.withElementContainer(this._container),this._sortStrategy.withSortPredicate((e,t)=>this.sortPredicate(e,t,this)),this}withScrollableParents(n){let e=this._container;return this._scrollableElements=n.indexOf(e)===-1?[e,...n]:n.slice(),this}withElementContainer(n){if(n===this._container)return this;let e=ve(this.element),t=this._scrollableElements.indexOf(this._container),i=this._scrollableElements.indexOf(n);return t>-1&&this._scrollableElements.splice(t,1),i>-1&&this._scrollableElements.splice(i,1),this._sortStrategy&&this._sortStrategy.withElementContainer(n),this._cachedShadowRoot=null,this._scrollableElements.unshift(n),this._container=n,this}getScrollableParents(){return this._scrollableElements}getItemIndex(n){return this._isDragging?this._sortStrategy.getItemIndex(n):this._draggables.indexOf(n)}getItemAtIndex(n){return this._isDragging?this._sortStrategy.getItemAtIndex(n):this._draggables[n]||null}isReceiving(){return this._activeSiblings.size>0}_sortItem(n,e,t,i){if(this.sortingDisabled||!this._domRect||!Nn(this._domRect,Yn,e,t))return;let o=this._sortStrategy.sort(n,e,t,i);o&&this.sorted.next({previousIndex:o.previousIndex,currentIndex:o.currentIndex,container:this,item:n})}_startScrollingIfNecessary(n,e){if(this.autoScrollDisabled)return;let t,i=re.NONE,o=U.NONE;if(this._parentPositions.positions.forEach((r,s)=>{s===this._document||!r.clientRect||t||Nn(r.clientRect,Yn,n,e)&&([i,o]=Ho(s,r.clientRect,this._direction,n,e),(i||o)&&(t=s))}),!i&&!o){let{width:r,height:s}=this._viewportRuler.getViewportSize(),h={width:r,height:s,top:0,right:r,bottom:s,left:0};i=ta(h,e),o=ia(h,n),t=window}t&&(i!==this._verticalScrollDirection||o!==this._horizontalScrollDirection||t!==this._scrollNode)&&(this._verticalScrollDirection=i,this._horizontalScrollDirection=o,this._scrollNode=t,(i||o)&&t?this._ngZone.runOutsideAngular(this._startScrollInterval):this._stopScrolling())}_stopScrolling(){this._stopScrollTimers.next()}_draggingStarted(){let n=this._container.style;this.beforeStarted.next(),this._isDragging=!0,this._initialScrollSnap=n.msScrollSnapType||n.scrollSnapType||"",n.scrollSnapType=n.msScrollSnapType="none",this._sortStrategy.start(this._draggables),this._cacheParentPositions(),this._viewportScrollSubscription.unsubscribe(),this._listenToScrollEvents()}_cacheParentPositions(){this._parentPositions.cache(this._scrollableElements),this._domRect=this._parentPositions.positions.get(this._container).clientRect}_reset(){this._isDragging=!1;let n=this._container.style;n.scrollSnapType=n.msScrollSnapType=this._initialScrollSnap,this._siblings.forEach(e=>e._stopReceiving(this)),this._sortStrategy.reset(),this._stopScrolling(),this._viewportScrollSubscription.unsubscribe(),this._parentPositions.clear()}_startScrollInterval=()=>{this._stopScrolling(),Bi(0,Fi).pipe(W(this._stopScrollTimers)).subscribe(()=>{let n=this._scrollNode,e=this.autoScrollStep;this._verticalScrollDirection===re.UP?n.scrollBy(0,-e):this._verticalScrollDirection===re.DOWN&&n.scrollBy(0,e),this._horizontalScrollDirection===U.LEFT?n.scrollBy(-e,0):this._horizontalScrollDirection===U.RIGHT&&n.scrollBy(e,0)})};_isOverContainer(n,e){return this._domRect!=null&&Di(this._domRect,n,e)}_getSiblingContainerFromPosition(n,e,t){return this._siblings.find(i=>i._canReceive(n,e,t))}_canReceive(n,e,t){if(!this._domRect||!Di(this._domRect,e,t)||!this.enterPredicate(n,this))return!1;let i=this._getShadowRoot().elementFromPoint(e,t);return i?i===this._container||this._container.contains(i):!1}_startReceiving(n,e){let t=this._activeSiblings;!t.has(n)&&e.every(i=>this.enterPredicate(i,this)||this._draggables.indexOf(i)>-1)&&(t.add(n),this._cacheParentPositions(),this._listenToScrollEvents(),this.receivingStarted.next({initiator:n,receiver:this,items:e}))}_stopReceiving(n){this._activeSiblings.delete(n),this._viewportScrollSubscription.unsubscribe(),this.receivingStopped.next({initiator:n,receiver:this})}_listenToScrollEvents(){this._viewportScrollSubscription=this._dragDropRegistry.scrolled(this._getShadowRoot()).subscribe(n=>{if(this.isDragging()){let e=this._parentPositions.handleScroll(n);e&&this._sortStrategy.updateOnScroll(e.top,e.left)}else this.isReceiving()&&this._cacheParentPositions()})}_getShadowRoot(){if(!this._cachedShadowRoot){let n=pt(this._container);this._cachedShadowRoot=n||this._document}return this._cachedShadowRoot}_notifyReceivingSiblings(){let n=this._sortStrategy.getActiveItemsSnapshot().filter(e=>e.isDragging());this._siblings.forEach(e=>e._startReceiving(this,n))}};function ta(a,n){let{top:e,bottom:t,height:i}=a,o=i*Jn;return n>=e-o&&n<=e+o?re.UP:n>=t-o&&n<=t+o?re.DOWN:re.NONE}function ia(a,n){let{left:e,right:t,width:i}=a,o=i*Jn;return n>=e-o&&n<=e+o?U.LEFT:n>=t-o&&n<=t+o?U.RIGHT:U.NONE}function Ho(a,n,e,t,i){let o=ta(n,i),r=ia(n,t),s=re.NONE,h=U.NONE;if(o){let p=a.scrollTop;o===re.UP?p>0&&(s=re.UP):a.scrollHeight-p>a.clientHeight&&(s=re.DOWN)}if(r){let p=a.scrollLeft;e==="rtl"?r===U.RIGHT?p<0&&(h=U.RIGHT):a.scrollWidth+p>a.clientWidth&&(h=U.LEFT):r===U.LEFT?p>0&&(h=U.LEFT):a.scrollWidth-p>a.clientWidth&&(h=U.RIGHT)}return[s,h]}var Vo=(()=>{class a{_injector=c(ce);constructor(){}createDrag(e,t){return Xn(this._injector,e,t)}createDropList(e){return ea(this._injector,e)}static \u0275fac=function(t){return new(t||a)};static \u0275prov=ke({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})(),zt=new L("CDK_DRAG_PARENT");var na=new L("CdkDragHandle"),aa=(()=>{class a{element=c(F);_parentDrag=c(zt,{optional:!0,skipSelf:!0});_dragDropRegistry=c(Ft);_stateChanges=new k;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._stateChanges.next(this)}_disabled=!1;constructor(){this._parentDrag?._addHandle(this)}ngAfterViewInit(){if(!this._parentDrag){let e=this.element.nativeElement.parentElement;for(;e;){let t=this._dragDropRegistry.getDragDirectiveForNode(e);if(t){this._parentDrag=t,t._addHandle(this);break}e=e.parentElement}}}ngOnDestroy(){this._parentDrag?._removeHandle(this),this._stateChanges.complete()}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkDragHandle",""]],hostAttrs:[1,"cdk-drag-handle"],inputs:{disabled:[2,"cdkDragHandleDisabled","disabled",g]},features:[G([{provide:na,useExisting:a}])]})}return a})(),oa=new L("CDK_DRAG_CONFIG"),ra=new L("CdkDropList"),sa=(()=>{class a{element=c(F);dropContainer=c(ra,{optional:!0,skipSelf:!0});_ngZone=c(J);_viewContainerRef=c(Fe);_dir=c(De,{optional:!0});_changeDetectorRef=c(B);_selfHandle=c(na,{optional:!0,self:!0});_parentDrag=c(zt,{optional:!0,skipSelf:!0});_dragDropRegistry=c(Ft);_destroyed=new k;_handles=new Ai([]);_previewTemplate=null;_placeholderTemplate=null;_dragRef;data;lockAxis=null;rootElementSelector;boundaryElement;dragStartDelay;freeDragPosition;get disabled(){return this._disabled||!!(this.dropContainer&&this.dropContainer.disabled)}set disabled(e){this._disabled=e,this._dragRef.disabled=this._disabled}_disabled=!1;constrainPosition;previewClass;previewContainer;scale=1;started=new C;released=new C;ended=new C;entered=new C;exited=new C;dropped=new C;moved=new Ht(e=>{let t=this._dragRef.moved.pipe(ot(i=>({source:this,pointerPosition:i.pointerPosition,event:i.event,delta:i.delta,distance:i.distance}))).subscribe(e);return()=>{t.unsubscribe()}});_injector=c(ce);constructor(){let e=this.dropContainer,t=c(oa,{optional:!0});this._dragRef=Xn(this._injector,this.element,{dragStartThreshold:t&&t.dragStartThreshold!=null?t.dragStartThreshold:5,pointerDirectionChangeThreshold:t&&t.pointerDirectionChangeThreshold!=null?t.pointerDirectionChangeThreshold:5,zIndex:t?.zIndex}),this._dragRef.data=this,this._dragDropRegistry.registerDirectiveNode(this.element.nativeElement,this),t&&this._assignDefaults(t),e&&(e.addItem(this),e._dropListRef.beforeStarted.pipe(W(this._destroyed)).subscribe(()=>{this._dragRef.scale=this.scale})),this._syncInputs(this._dragRef),this._handleEvents(this._dragRef)}getPlaceholderElement(){return this._dragRef.getPlaceholderElement()}getRootElement(){return this._dragRef.getRootElement()}reset(){this._dragRef.reset()}resetToBoundary(){this._dragRef.resetToBoundary()}getFreeDragPosition(){return this._dragRef.getFreeDragPosition()}setFreeDragPosition(e){this._dragRef.setFreeDragPosition(e)}ngAfterViewInit(){ze(()=>{this._updateRootElement(),this._setupHandlesListener(),this._dragRef.scale=this.scale,this.freeDragPosition&&this._dragRef.setFreeDragPosition(this.freeDragPosition)},{injector:this._injector})}ngOnChanges(e){let t=e.rootElementSelector,i=e.freeDragPosition;t&&!t.firstChange&&this._updateRootElement(),this._dragRef.scale=this.scale,i&&!i.firstChange&&this.freeDragPosition&&this._dragRef.setFreeDragPosition(this.freeDragPosition)}ngOnDestroy(){this.dropContainer&&this.dropContainer.removeItem(this),this._dragDropRegistry.removeDirectiveNode(this.element.nativeElement),this._ngZone.runOutsideAngular(()=>{this._handles.complete(),this._destroyed.next(),this._destroyed.complete(),this._dragRef.dispose()})}_addHandle(e){let t=this._handles.getValue();t.push(e),this._handles.next(t)}_removeHandle(e){let t=this._handles.getValue(),i=t.indexOf(e);i>-1&&(t.splice(i,1),this._handles.next(t))}_setPreviewTemplate(e){this._previewTemplate=e}_resetPreviewTemplate(e){e===this._previewTemplate&&(this._previewTemplate=null)}_setPlaceholderTemplate(e){this._placeholderTemplate=e}_resetPlaceholderTemplate(e){e===this._placeholderTemplate&&(this._placeholderTemplate=null)}_updateRootElement(){let e=this.element.nativeElement,t=e;this.rootElementSelector&&(t=e.closest!==void 0?e.closest(this.rootElementSelector):e.parentElement?.closest(this.rootElementSelector)),this._dragRef.withRootElement(t||e)}_getBoundaryElement(){let e=this.boundaryElement;return e?typeof e=="string"?this.element.nativeElement.closest(e):ve(e):null}_syncInputs(e){e.beforeStarted.subscribe(()=>{if(!e.isDragging()){let t=this._dir,i=this.dragStartDelay,o=this._placeholderTemplate?{template:this._placeholderTemplate.templateRef,context:this._placeholderTemplate.data,viewContainer:this._viewContainerRef}:null,r=this._previewTemplate?{template:this._previewTemplate.templateRef,context:this._previewTemplate.data,matchSize:this._previewTemplate.matchSize,viewContainer:this._viewContainerRef}:null;e.disabled=this.disabled,e.lockAxis=this.lockAxis,e.scale=this.scale,e.dragStartDelay=typeof i=="object"&&i?i:Wt(i),e.constrainPosition=this.constrainPosition,e.previewClass=this.previewClass,e.withBoundaryElement(this._getBoundaryElement()).withPlaceholderTemplate(o).withPreviewTemplate(r).withPreviewContainer(this.previewContainer||"global"),t&&e.withDirection(t.value)}}),e.beforeStarted.pipe(rt(1)).subscribe(()=>{if(this._parentDrag){e.withParent(this._parentDrag._dragRef);return}let t=this.element.nativeElement.parentElement;for(;t;){let i=this._dragDropRegistry.getDragDirectiveForNode(t);if(i){e.withParent(i._dragRef);break}t=t.parentElement}})}_handleEvents(e){e.started.subscribe(t=>{this.started.emit({source:this,event:t.event}),this._changeDetectorRef.markForCheck()}),e.released.subscribe(t=>{this.released.emit({source:this,event:t.event})}),e.ended.subscribe(t=>{this.ended.emit({source:this,distance:t.distance,dropPoint:t.dropPoint,event:t.event}),this._changeDetectorRef.markForCheck()}),e.entered.subscribe(t=>{this.entered.emit({container:t.container.data,item:this,currentIndex:t.currentIndex})}),e.exited.subscribe(t=>{this.exited.emit({container:t.container.data,item:this})}),e.dropped.subscribe(t=>{this.dropped.emit({previousIndex:t.previousIndex,currentIndex:t.currentIndex,previousContainer:t.previousContainer.data,container:t.container.data,isPointerOverContainer:t.isPointerOverContainer,item:this,distance:t.distance,dropPoint:t.dropPoint,event:t.event})})}_assignDefaults(e){let{lockAxis:t,dragStartDelay:i,constrainPosition:o,previewClass:r,boundaryElement:s,draggingDisabled:h,rootElementSelector:p,previewContainer:x}=e;this.disabled=h??!1,this.dragStartDelay=i||0,this.lockAxis=t||null,o&&(this.constrainPosition=o),r&&(this.previewClass=r),s&&(this.boundaryElement=s),p&&(this.rootElementSelector=p),x&&(this.previewContainer=x)}_setupHandlesListener(){this._handles.pipe(Hi(e=>{let t=e.map(i=>i.element);this._selfHandle&&this.rootElementSelector&&t.push(this.element),this._dragRef.withHandles(t)}),Me(e=>xe(...e.map(t=>t._stateChanges.pipe(Y(t))))),W(this._destroyed)).subscribe(e=>{let t=this._dragRef,i=e.element.nativeElement;e.disabled?t.disableHandle(i):t.enableHandle(i)})}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkDrag",""]],hostAttrs:[1,"cdk-drag"],hostVars:4,hostBindings:function(t,i){t&2&&E("cdk-drag-disabled",i.disabled)("cdk-drag-dragging",i._dragRef.isDragging())},inputs:{data:[0,"cdkDragData","data"],lockAxis:[0,"cdkDragLockAxis","lockAxis"],rootElementSelector:[0,"cdkDragRootElement","rootElementSelector"],boundaryElement:[0,"cdkDragBoundary","boundaryElement"],dragStartDelay:[0,"cdkDragStartDelay","dragStartDelay"],freeDragPosition:[0,"cdkDragFreeDragPosition","freeDragPosition"],disabled:[2,"cdkDragDisabled","disabled",g],constrainPosition:[0,"cdkDragConstrainPosition","constrainPosition"],previewClass:[0,"cdkDragPreviewClass","previewClass"],previewContainer:[0,"cdkDragPreviewContainer","previewContainer"],scale:[2,"cdkDragScale","scale",X]},outputs:{started:"cdkDragStarted",released:"cdkDragReleased",ended:"cdkDragEnded",entered:"cdkDragEntered",exited:"cdkDragExited",dropped:"cdkDragDropped",moved:"cdkDragMoved"},exportAs:["cdkDrag"],features:[G([{provide:zt,useExisting:a}]),ue]})}return a})(),Zn=new L("CdkDropListGroup");var ca=(()=>{class a{element=c(F);_changeDetectorRef=c(B);_scrollDispatcher=c($t);_dir=c(De,{optional:!0});_group=c(Zn,{optional:!0,skipSelf:!0});_latestSortedRefs;_destroyed=new k;_scrollableParentsResolved=!1;static _dropLists=[];_dropListRef;connectedTo=[];data;orientation="vertical";id=c(te).getId("cdk-drop-list-");lockAxis=null;get disabled(){return this._disabled||!!this._group&&this._group.disabled}set disabled(e){this._dropListRef.disabled=this._disabled=e}_disabled=!1;sortingDisabled=!1;enterPredicate=()=>!0;sortPredicate=()=>!0;autoScrollDisabled=!1;autoScrollStep;elementContainerSelector=null;hasAnchor=!1;dropped=new C;entered=new C;exited=new C;sorted=new C;_unsortedItems=new Set;constructor(){let e=c(oa,{optional:!0}),t=c(ce);this._dropListRef=ea(t,this.element),this._dropListRef.data=this,e&&this._assignDefaults(e),this._dropListRef.enterPredicate=(i,o)=>this.enterPredicate(i.data,o.data),this._dropListRef.sortPredicate=(i,o,r)=>this.sortPredicate(i,o.data,r.data),this._setupInputSyncSubscription(this._dropListRef),this._handleEvents(this._dropListRef),a._dropLists.push(this),this._group&&this._group._items.add(this)}addItem(e){this._unsortedItems.add(e),e._dragRef._withDropContainer(this._dropListRef),this._dropListRef.isDragging()&&this._syncItemsWithRef(this.getSortedItems().map(t=>t._dragRef))}removeItem(e){if(this._unsortedItems.delete(e),this._latestSortedRefs){let t=this._latestSortedRefs.indexOf(e._dragRef);t>-1&&(this._latestSortedRefs.splice(t,1),this._syncItemsWithRef(this._latestSortedRefs))}}getSortedItems(){return Array.from(this._unsortedItems).sort((e,t)=>e._dragRef.getVisibleElement().compareDocumentPosition(t._dragRef.getVisibleElement())&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)}ngOnDestroy(){let e=a._dropLists.indexOf(this);e>-1&&a._dropLists.splice(e,1),this._group&&this._group._items.delete(this),this._latestSortedRefs=void 0,this._unsortedItems.clear(),this._dropListRef.dispose(),this._destroyed.next(),this._destroyed.complete()}_setupInputSyncSubscription(e){this._dir&&this._dir.change.pipe(Y(this._dir.value),W(this._destroyed)).subscribe(t=>e.withDirection(t)),e.beforeStarted.subscribe(()=>{let t=Zi(this.connectedTo).map(i=>{if(typeof i=="string"){let o=a._dropLists.find(r=>r.id===i);return o}return i});if(this._group&&this._group._items.forEach(i=>{t.indexOf(i)===-1&&t.push(i)}),!this._scrollableParentsResolved){let i=this._scrollDispatcher.getAncestorScrollContainers(this.element).map(o=>o.getElementRef().nativeElement);this._dropListRef.withScrollableParents(i),this._scrollableParentsResolved=!0}if(this.elementContainerSelector){let i=this.element.nativeElement.querySelector(this.elementContainerSelector);e.withElementContainer(i)}e.disabled=this.disabled,e.lockAxis=this.lockAxis,e.sortingDisabled=this.sortingDisabled,e.autoScrollDisabled=this.autoScrollDisabled,e.autoScrollStep=Wt(this.autoScrollStep,2),e.hasAnchor=this.hasAnchor,e.connectedTo(t.filter(i=>i&&i!==this).map(i=>i._dropListRef)).withOrientation(this.orientation)})}_handleEvents(e){e.beforeStarted.subscribe(()=>{this._syncItemsWithRef(this.getSortedItems().map(t=>t._dragRef)),this._changeDetectorRef.markForCheck()}),e.entered.subscribe(t=>{this.entered.emit({container:this,item:t.item.data,currentIndex:t.currentIndex})}),e.exited.subscribe(t=>{this.exited.emit({container:this,item:t.item.data}),this._changeDetectorRef.markForCheck()}),e.sorted.subscribe(t=>{this.sorted.emit({previousIndex:t.previousIndex,currentIndex:t.currentIndex,container:this,item:t.item.data})}),e.dropped.subscribe(t=>{this.dropped.emit({previousIndex:t.previousIndex,currentIndex:t.currentIndex,previousContainer:t.previousContainer.data,container:t.container.data,item:t.item.data,isPointerOverContainer:t.isPointerOverContainer,distance:t.distance,dropPoint:t.dropPoint,event:t.event}),this._changeDetectorRef.markForCheck()}),xe(e.receivingStarted,e.receivingStopped).subscribe(()=>this._changeDetectorRef.markForCheck())}_assignDefaults(e){let{lockAxis:t,draggingDisabled:i,sortingDisabled:o,listAutoScrollDisabled:r,listOrientation:s}=e;this.disabled=i??!1,this.sortingDisabled=o??!1,this.autoScrollDisabled=r??!1,this.orientation=s||"vertical",this.lockAxis=t||null}_syncItemsWithRef(e){this._latestSortedRefs=e,this._dropListRef.withItems(e)}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["","cdkDropList",""],["cdk-drop-list"]],hostAttrs:[1,"cdk-drop-list"],hostVars:7,hostBindings:function(t,i){t&2&&(D("id",i.id),E("cdk-drop-list-disabled",i.disabled)("cdk-drop-list-dragging",i._dropListRef.isDragging())("cdk-drop-list-receiving",i._dropListRef.isReceiving()))},inputs:{connectedTo:[0,"cdkDropListConnectedTo","connectedTo"],data:[0,"cdkDropListData","data"],orientation:[0,"cdkDropListOrientation","orientation"],id:"id",lockAxis:[0,"cdkDropListLockAxis","lockAxis"],disabled:[2,"cdkDropListDisabled","disabled",g],sortingDisabled:[2,"cdkDropListSortingDisabled","sortingDisabled",g],enterPredicate:[0,"cdkDropListEnterPredicate","enterPredicate"],sortPredicate:[0,"cdkDropListSortPredicate","sortPredicate"],autoScrollDisabled:[2,"cdkDropListAutoScrollDisabled","autoScrollDisabled",g],autoScrollStep:[0,"cdkDropListAutoScrollStep","autoScrollStep"],elementContainerSelector:[0,"cdkDropListElementContainer","elementContainerSelector"],hasAnchor:[2,"cdkDropListHasAnchor","hasAnchor",g]},outputs:{dropped:"cdkDropListDropped",entered:"cdkDropListEntered",exited:"cdkDropListExited",sorted:"cdkDropListSorted"},exportAs:["cdkDropList"],features:[G([{provide:Zn,useValue:void 0},{provide:ra,useExisting:a}])]})}return a})();var jo=new L("CdkDragPlaceholder"),la=(()=>{class a{templateRef=c(le);_drag=c(zt,{optional:!0});data;constructor(){this._drag?._setPlaceholderTemplate(this)}ngOnDestroy(){this._drag?._resetPlaceholderTemplate(this)}static \u0275fac=function(t){return new(t||a)};static \u0275dir=O({type:a,selectors:[["ng-template","cdkDragPlaceholder",""]],inputs:{data:"data"},features:[G([{provide:jo,useExisting:a}])]})}return a})();var da=(()=>{class a{static \u0275fac=function(t){return new(t||a)};static \u0275mod=M({type:a});static \u0275inj=T({providers:[Vo],imports:[yt]})}return a})();var Qo=["fieldsList"],qo=a=>({activeCard:a}),ma=a=>({hideElement:a});function Wo(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Input"),l(),y(4,"input",19),l()())}function $o(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Textarea"),l(),y(4,"textarea",20),l()())}function Uo(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Select"),l(),d(4,"mat-select")(5,"mat-option",21),b(6,"Option 1"),l(),d(7,"mat-option",22),b(8,"Option 2"),l(),d(9,"mat-option",23),b(10,"Option 3"),l()()()())}function Yo(a,n){a&1&&(d(0,"div",18)(1,"mat-radio-group",24)(2,"mat-radio-button",25),b(3,"Option 1"),l(),d(4,"mat-radio-button",26),b(5,"Option 2"),l()()())}function Zo(a,n){if(a&1&&(d(0,"div",18)(1,"mat-form-field",27)(2,"mat-label"),b(3,"Choose a date"),l(),y(4,"input",28),d(5,"mat-hint"),b(6,"MM/DD/YYYY"),l(),y(7,"mat-datepicker-toggle",29)(8,"mat-datepicker",30,2),l()()),a&2){let e=V(9);m(4),_("matDatepicker",e),m(3),_("for",e)}}function Ko(a,n){if(a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Enter a date range"),l(),d(4,"mat-date-range-input",31),y(5,"input",32)(6,"input",33),l(),d(7,"mat-hint"),b(8,"MM/DD/YYYY \u2013 MM/DD/YYYY"),l(),y(9,"mat-datepicker-toggle",29)(10,"mat-date-range-picker",null,3),l()()),a&2){let e=V(11);m(4),_("rangePicker",e),m(5),_("for",e)}}function Xo(a,n){a&1&&(d(0,"div",18)(1,"mat-checkbox",34),b(2,"Checked"),l()())}function Jo(a,n){if(a&1){let e=Z();d(0,"div",14),w("click",function(){A(e);let i=u().$implicit,o=u();return z(o.fieldSelected(i.id))}),d(1,"mat-form-field",15)(2,"mat-label"),b(3,"Input"),l(),y(4,"input",16),l(),d(5,"div",17),f(6,Wo,5,0,"div",18),f(7,$o,5,0,"div",18),f(8,Uo,11,0,"div",18),f(9,Yo,6,0,"div",18),f(10,Zo,10,2,"div",18),f(11,Ko,12,2,"div",18),f(12,Xo,3,0,"div",18),l()()}if(a&2){let e=u().$implicit,t=u();m(4),_("value","Question "+e.id),m(),_("ngClass",fe(9,ma,t.dragging)),m(),v(e.inputType==="text"?6:-1),m(),v(e.inputType==="textarea"?7:-1),m(),v(e.inputType==="select"?8:-1),m(),v(e.inputType==="radio"?9:-1),m(),v(e.inputType==="date"?10:-1),m(),v(e.inputType==="dateRange"?11:-1),m(),v(e.inputType==="checkBox"?12:-1)}}function er(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Input"),l(),y(4,"input",19),l()())}function tr(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Textarea"),l(),y(4,"textarea",20),l()())}function ir(a,n){a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Select"),l(),d(4,"mat-select")(5,"mat-option",21),b(6,"Option 1"),l(),d(7,"mat-option",22),b(8,"Option 2"),l(),d(9,"mat-option",23),b(10,"Option 3"),l()()()())}function nr(a,n){a&1&&(d(0,"div",18)(1,"mat-radio-group",24)(2,"mat-radio-button",25),b(3,"Option 1"),l(),d(4,"mat-radio-button",26),b(5,"Option 2"),l()()())}function ar(a,n){if(a&1&&(d(0,"div",18)(1,"mat-form-field",27)(2,"mat-label"),b(3,"Choose a date"),l(),y(4,"input",28),d(5,"mat-hint"),b(6,"MM/DD/YYYY"),l(),y(7,"mat-datepicker-toggle",29)(8,"mat-datepicker",30,2),l()()),a&2){let e=V(9);m(4),_("matDatepicker",e),m(3),_("for",e)}}function or(a,n){if(a&1&&(d(0,"div",18)(1,"mat-form-field",15)(2,"mat-label"),b(3,"Enter a date range"),l(),d(4,"mat-date-range-input",31),y(5,"input",32)(6,"input",33),l(),d(7,"mat-hint"),b(8,"MM/DD/YYYY \u2013 MM/DD/YYYY"),l(),y(9,"mat-datepicker-toggle",29)(10,"mat-date-range-picker",null,3),l()()),a&2){let e=V(11);m(4),_("rangePicker",e),m(5),_("for",e)}}function rr(a,n){a&1&&(d(0,"div",18)(1,"mat-checkbox",34),b(2,"Checked"),l()())}function sr(a,n){if(a&1){let e=Z();d(0,"div",14),w("click",function(){A(e);let i=u().$implicit,o=u();return z(o.fieldSelected(i.id))}),d(1,"div",18),b(2),l(),d(3,"div",17),f(4,er,5,0,"div",18),f(5,tr,5,0,"div",18),f(6,ir,11,0,"div",18),f(7,nr,6,0,"div",18),f(8,ar,10,2,"div",18),f(9,or,12,2,"div",18),f(10,rr,3,0,"div",18),l()()}if(a&2){let e=u(),t=e.$implicit,i=e.$index,o=u();m(2),Ee("Question ",i+1),m(),_("ngClass",fe(9,ma,o.dragging)),m(),v(t.inputType==="text"?4:-1),m(),v(t.inputType==="textarea"?5:-1),m(),v(t.inputType==="select"?6:-1),m(),v(t.inputType==="radio"?7:-1),m(),v(t.inputType==="date"?8:-1),m(),v(t.inputType==="dateRange"?9:-1),m(),v(t.inputType==="checkBox"?10:-1)}}function cr(a,n){a&1&&y(0,"div",35)}function lr(a,n){if(a&1){let e=Z();d(0,"mat-card",10),w("cdkDragEnded",function(){A(e);let i=u();return z(i.dragging=!1)})("cdkDragStarted",function(){A(e);let i=u();return z(i.dragging=!0)}),d(1,"div",11)(2,"mat-icon",12),b(3,"drag_indicator"),l()(),f(4,Jo,13,11,"div")(5,sr,11,11,"div"),Ce(6,cr,1,0,"div",13),l()}if(a&2){let e=n.$implicit,t=u();_("ngClass",fe(2,qo,e.id===t.selectedFieldId())),m(4),v(e.id===t.selectedFieldId()?4:5)}}function dr(a,n){if(a&1){let e=Z();d(0,"button",36),w("click",function(){let i=A(e).$implicit,o=u();return z(o.addInput(i.inputType))}),d(1,"mat-icon"),b(2),l(),b(3),l()}if(a&2){let e=n.$implicit;m(2),ee(e.icon),m(),Ee(" ",e.label," ")}}var td=(()=>{class a{constructor(){this.jsonData=R([]),this.addJsonData=R([]),this.selectedFieldId=R(null),this.dragging=!1,this.fieldSelected=e=>{this.selectedFieldId.set(e)}}ngOnInit(){this.jsonData.set([{id:1,inputType:"text",label:"one",question:""},{id:2,inputType:"textarea",label:"two",question:""},{id:3,inputType:"select",label:"three",question:""},{id:4,inputType:"radio",label:"three",question:""},{id:5,inputType:"date",label:"three",question:""},{id:6,inputType:"dateRange",label:"three",question:""},{id:7,inputType:"checkBox",label:"three",question:""}]),this.addJsonData.set([{inputType:"text",icon:"text_fields",label:"Text"},{inputType:"phone",icon:"call",label:"Phone"},{inputType:"textarea",icon:"text_fields",label:"Text Area"},{inputType:"select",icon:"playlist_add_check",label:"Select"},{inputType:"radio",icon:"radio_button_checked",label:"Radio"},{inputType:"date",icon:"today",label:"Date"},{inputType:"dateRange",icon:"date_range",label:"Date Range"},{inputType:"checkBox",icon:"check_box",label:"Checkbox"}])}addInput(e){let t=this.addJsonData().find(i=>i.inputType===e);t&&(this.jsonData.set([...this.jsonData(),at(je({},t),{id:this.jsonData().length+1,question:"Question "+this.jsonData().length+1})]),setTimeout(()=>{this.scrollToElement()},200))}drop(e){Bt(this.jsonData(),e.previousIndex,e.currentIndex)}scrollToElement(){this.myScrollContainer.nativeElement.scroll({top:this.myScrollContainer.nativeElement.scrollHeight,left:0,behavior:"smooth"})}static{this.\u0275fac=function(t){return new(t||a)}}static{this.\u0275cmp=P({type:a,selectors:[["app-create"]],viewQuery:function(t,i){if(t&1&&K(Qo,5),t&2){let o;I(o=S())&&(i.myScrollContainer=o.first)}},decls:14,vars:1,consts:[["fieldsList",""],["menu","matMenu"],["picker",""],["rangepicker",""],["id","formDiv"],["cdkDropList","",1,"parent","mb-2","p-5","mt-2",3,"cdkDropListDropped"],["cdkDragLockAxis","y","cdkDrag","","cdkDragBoundary",".parent",1,"parentCard","px-4","pb-2",3,"ngClass"],[1,"p-2","bg-grey"],["mat-raised-button","","color","primary",1,"addBtn",3,"matMenuTriggerFor"],["mat-menu-item",""],["cdkDragLockAxis","y","cdkDrag","","cdkDragBoundary",".parent",1,"parentCard","px-4","pb-2",3,"cdkDragEnded","cdkDragStarted","ngClass"],[1,"cardPlaceholder"],["cdkDragHandle","",1,"parentHandler"],["class","custom-placeholder",4,"cdkDragPlaceholder"],[3,"click"],["appearance","fill"],["matInput","","placeholder","Input",3,"value"],[1,"dataDiv",3,"ngClass"],[1,"pb-2"],["matInput","","placeholder","Input"],["matInput","","placeholder",""],["value","Option 1"],["value","Option 2"],["value","Option 3"],["aria-label","Select an option"],["value","1"],["value","2"],["appearance","fill","appMonthYear",""],["matInput","",3,"matDatepicker"],["matSuffix","",3,"for"],["startView","multi-year"],[3,"rangePicker"],["matStartDate","","placeholder","Start date"],["matEndDate","","placeholder","End date"],[1,"example-margin"],[1,"custom-placeholder"],["mat-menu-item","",3,"click"]],template:function(t,i){if(t&1&&(d(0,"div",4)(1,"div",5,0),w("cdkDropListDropped",function(r){return i.drop(r)}),me(3,lr,7,4,"mat-card",6,de),l(),d(5,"div",7)(6,"button",8)(7,"mat-icon"),b(8,"add"),l(),b(9," Insert new "),l(),d(10,"mat-menu",null,1),me(12,dr,4,2,"button",9,de),l()()()),t&2){let o=V(11);m(3),he(i.jsonData()),m(3),_("matMenuTriggerFor",o),m(6),he(i.addJsonData())}},dependencies:[ht,Wi,An,_n,kt,ln,dn,mn,Ji,St,Dt,ai,Mt,ci,bn,gn,fn,vn,yn,xn,kn,_t,Cn,He,Je,On,da,ca,sa,aa,la],styles:[".parent[_ngcontent-%COMP%]{height:calc(100vh - 110px);overflow:auto;background-color:var(--portWhite)}.card[_ngcontent-%COMP%]{margin-bottom:15px}.custom-placeholder[_ngcontent-%COMP%]{margin-bottom:15px;background:#ededed;border:dotted 2px #999;min-height:60px;transition:transform .25s cubic-bezier(0,0,.2,1)}.parentHandler[_ngcontent-%COMP%], .childHandler[_ngcontent-%COMP%]{visibility:hidden;transform:rotate(90deg)!important}.parentCard[_ngcontent-%COMP%]:hover   .parentHandler[_ngcontent-%COMP%]{visibility:visible;cursor:move;color:#616161}.parentCard[_ngcontent-%COMP%]:hover, .activeCard[_ngcontent-%COMP%]{background-color:var(--portGrey)}.parentCard[_ngcontent-%COMP%]{margin-bottom:10px;transition:box-shadow .2s cubic-bezier(0,0,.2,1);box-shadow:0 3px 1px -2px #0003,0 2px 2px #00000024,0 1px 5px #0000001f}.cardPlaceholder[_ngcontent-%COMP%]{display:flex;flex-direction:row;justify-content:center;align-items:center}.cdk-drag-dragging.parentCard[_ngcontent-%COMP%], .cdk-drag-preview.parentCard[_ngcontent-%COMP%]{height:76px!important}.cdk-drag-dragging[_ngcontent-%COMP%]   .parentHandler[_ngcontent-%COMP%], .cdk-drag-preview[_ngcontent-%COMP%]   .parentHandler[_ngcontent-%COMP%]{visibility:visible!important}.cdk-drag-dragging[_ngcontent-%COMP%]   .dataDiv[_ngcontent-%COMP%], .cdk-drag-preview[_ngcontent-%COMP%]   .dataDiv[_ngcontent-%COMP%]{display:none!important}.hideElement[_ngcontent-%COMP%]{display:none}"]})}}return a})();export{td as CreateComponent};
