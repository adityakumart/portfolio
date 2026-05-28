import{b as ra}from"./chunk-FVJWPA23.js";import{a as nt,b as it,e as zt}from"./chunk-FHP3QEFT.js";import{B as Xt,C as Jt,h as jt,j as rt,m as ot,n as Kt,o as Wt,p as qt,q as Qt,t as $t,u as Ut,v as Gt,x as Zt}from"./chunk-G4RGFNWN.js";import{A as oa,B as sa,e as ea,f as st,h as He,j as ze,k as we,l as ta,m as aa,q as na,v as ia}from"./chunk-7URQCXHU.js";import{J as Ce,M as Lt,O as Bt,Q as Be,R as de,S as le,T as Ht,d as tt,f as Pt,j as at,k as ne,l as se,t as Nt,v as Yt,w as K,z as ie}from"./chunk-JRFUG22Z.js";import{A as fe,Ab as R,B as At,Bb as f,Cb as Ft,Db as h,Eb as G,Fb as P,G as Mt,Gb as Tt,Hb as H,Ia as d,Ib as V,Jb as E,Ka as Ze,Na as Xe,Ob as Oe,Pa as St,Pb as C,Qa as Vt,Qb as Pe,R as Ie,Rb as D,Sb as z,Tb as Z,Ua as v,Ub as et,Va as $,Wa as U,Wb as Ne,Xb as Ye,Y as $e,Yb as Le,Z as W,Za as ae,_ as q,_a as Je,_b as j,a as wt,aa as N,b as kt,ba as Fe,bb as Et,ca as s,d as x,ga as w,h as S,ha as k,hb as y,ia as be,ja as Ue,jb as L,jc as Rt,ka as ve,kb as B,la as xt,nb as Te,nc as Ot,o as Ee,oa as p,ob as Re,pa as Ge,pb as g,qb as c,rb as m,sa as u,sb as A,sc as I,tb as F,ua as Q,ub as T,uc as O,va as De,vb as It,xa as Y,zb as ye}from"./chunk-NUWCA4GH.js";var da=(()=>{class n{_animationsDisabled=Ce();state="unchecked";disabled=!1;appearance="full";constructor(){}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-pseudo-checkbox"]],hostAttrs:[1,"mat-pseudo-checkbox"],hostVars:12,hostBindings:function(t,a){t&2&&C("mat-pseudo-checkbox-indeterminate",a.state==="indeterminate")("mat-pseudo-checkbox-checked",a.state==="checked")("mat-pseudo-checkbox-disabled",a.disabled)("mat-pseudo-checkbox-minimal",a.appearance==="minimal")("mat-pseudo-checkbox-full",a.appearance==="full")("_mat-animation-noopable",a._animationsDisabled)},inputs:{state:"state",disabled:"disabled",appearance:"appearance"},decls:0,vars:0,template:function(t,a){},styles:[`.mat-pseudo-checkbox {
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  transition: border-color 90ms cubic-bezier(0, 0, 0.2, 0.1), background-color 90ms cubic-bezier(0, 0, 0.2, 0.1);
}
.mat-pseudo-checkbox::after {
  position: absolute;
  opacity: 0;
  content: "";
  border-bottom: 2px solid currentColor;
  transition: opacity 90ms cubic-bezier(0, 0, 0.2, 0.1);
}
.mat-pseudo-checkbox._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-pseudo-checkbox._mat-animation-noopable::after {
  transition: none;
}

.mat-pseudo-checkbox-disabled {
  cursor: default;
}

.mat-pseudo-checkbox-indeterminate::after {
  left: 1px;
  opacity: 1;
  border-radius: 2px;
}

.mat-pseudo-checkbox-checked::after {
  left: 1px;
  border-left: 2px solid currentColor;
  transform: rotate(-45deg);
  opacity: 1;
  box-sizing: content-box;
}

.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after, .mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after {
  color: var(--mat-pseudo-checkbox-minimal-selected-checkmark-color, var(--mat-sys-primary));
}
.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled::after, .mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled::after {
  color: var(--mat-pseudo-checkbox-minimal-disabled-selected-checkmark-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}

.mat-pseudo-checkbox-full {
  border-color: var(--mat-pseudo-checkbox-full-unselected-icon-color, var(--mat-sys-on-surface-variant));
  border-width: 2px;
  border-style: solid;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-disabled {
  border-color: var(--mat-pseudo-checkbox-full-disabled-unselected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate {
  background-color: var(--mat-pseudo-checkbox-full-selected-icon-color, var(--mat-sys-primary));
  border-color: transparent;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after {
  color: var(--mat-pseudo-checkbox-full-selected-checkmark-color, var(--mat-sys-on-primary));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled {
  background-color: var(--mat-pseudo-checkbox-full-disabled-selected-icon-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked.mat-pseudo-checkbox-disabled::after, .mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate.mat-pseudo-checkbox-disabled::after {
  color: var(--mat-pseudo-checkbox-full-disabled-selected-checkmark-color, var(--mat-sys-surface));
}

.mat-pseudo-checkbox {
  width: 18px;
  height: 18px;
}

.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-checked::after {
  width: 14px;
  height: 6px;
  transform-origin: center;
  top: -4.2426406871px;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}
.mat-pseudo-checkbox-minimal.mat-pseudo-checkbox-indeterminate::after {
  top: 8px;
  width: 16px;
}

.mat-pseudo-checkbox-full.mat-pseudo-checkbox-checked::after {
  width: 10px;
  height: 4px;
  transform-origin: center;
  top: -2.8284271247px;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}
.mat-pseudo-checkbox-full.mat-pseudo-checkbox-indeterminate::after {
  top: 6px;
  width: 12px;
}
`],encapsulation:2,changeDetection:0})}return n})();var Sa=["text"],Va=[[["mat-icon"]],"*"],Ea=["mat-icon","*"];function Ia(n,o){if(n&1&&A(0,"mat-pseudo-checkbox",1),n&2){let e=h();g("disabled",e.disabled)("state",e.selected?"checked":"unchecked")}}function Fa(n,o){if(n&1&&A(0,"mat-pseudo-checkbox",3),n&2){let e=h();g("disabled",e.disabled)}}function Ta(n,o){if(n&1&&(c(0,"span",4),D(1),m()),n&2){let e=h();d(),Z("(",e.group.label,")")}}var Ra=new N("MAT_OPTION_PARENT_COMPONENT"),Oa=new N("MatOptgroup");var dt=class{source;isUserInput;constructor(o,e=!1){this.source=o,this.isUserInput=e}},la=(()=>{class n{_element=s(Y);_changeDetectorRef=s(I);_parent=s(Ra,{optional:!0});group=s(Oa,{optional:!0});_signalDisableRipple=!1;_selected=!1;_active=!1;_mostRecentViewValue="";get multiple(){return this._parent&&this._parent.multiple}get selected(){return this._selected}value;id=s(ie).getId("mat-option-");get disabled(){return this.group&&this.group.disabled||this._disabled()}set disabled(e){this._disabled.set(e)}_disabled=u(!1);get disableRipple(){return this._signalDisableRipple?this._parent.disableRipple():!!this._parent?.disableRipple}get hideSingleSelectionIndicator(){return!!(this._parent&&this._parent.hideSingleSelectionIndicator)}onSelectionChange=new p;_text;_stateChanges=new S;constructor(){let e=s(ne);e.load(Be),e.load(se),this._signalDisableRipple=!!this._parent&&Et(this._parent.disableRipple)}get active(){return this._active}get viewValue(){return(this._text?.nativeElement.textContent||"").trim()}select(e=!0){this._selected||(this._selected=!0,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent())}deselect(e=!0){this._selected&&(this._selected=!1,this._changeDetectorRef.markForCheck(),e&&this._emitSelectionChangeEvent())}focus(e,t){let a=this._getHostElement();typeof a.focus=="function"&&a.focus(t)}setActiveStyles(){this._active||(this._active=!0,this._changeDetectorRef.markForCheck())}setInactiveStyles(){this._active&&(this._active=!1,this._changeDetectorRef.markForCheck())}getLabel(){return this.viewValue}_handleKeydown(e){(e.keyCode===13||e.keyCode===32)&&!K(e)&&(this._selectViaInteraction(),e.preventDefault())}_selectViaInteraction(){this.disabled||(this._selected=this.multiple?!this._selected:!0,this._changeDetectorRef.markForCheck(),this._emitSelectionChangeEvent(!0))}_getTabIndex(){return this.disabled?"-1":"0"}_getHostElement(){return this._element.nativeElement}ngAfterViewChecked(){if(this._selected){let e=this.viewValue;e!==this._mostRecentViewValue&&(this._mostRecentViewValue&&this._stateChanges.next(),this._mostRecentViewValue=e)}}ngOnDestroy(){this._stateChanges.complete()}_emitSelectionChangeEvent(e=!1){this.onSelectionChange.emit(new dt(this,e))}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-option"]],viewQuery:function(t,a){if(t&1&&H(Sa,7),t&2){let i;V(i=E())&&(a._text=i.first)}},hostAttrs:["role","option",1,"mat-mdc-option","mdc-list-item"],hostVars:11,hostBindings:function(t,a){t&1&&f("click",function(){return a._selectViaInteraction()})("keydown",function(r){return a._handleKeydown(r)}),t&2&&(R("id",a.id),y("aria-selected",a.selected)("aria-disabled",a.disabled.toString()),C("mdc-list-item--selected",a.selected)("mat-mdc-option-multiple",a.multiple)("mat-mdc-option-active",a.active)("mdc-list-item--disabled",a.disabled))},inputs:{value:"value",id:"id",disabled:[2,"disabled","disabled",O]},outputs:{onSelectionChange:"onSelectionChange"},exportAs:["matOption"],ngContentSelectors:Ea,decls:8,vars:5,consts:[["text",""],["aria-hidden","true",1,"mat-mdc-option-pseudo-checkbox",3,"disabled","state"],[1,"mdc-list-item__primary-text"],["state","checked","aria-hidden","true","appearance","minimal",1,"mat-mdc-option-pseudo-checkbox",3,"disabled"],[1,"cdk-visually-hidden"],["aria-hidden","true","mat-ripple","",1,"mat-mdc-option-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"]],template:function(t,a){t&1&&(G(Va),L(0,Ia,1,2,"mat-pseudo-checkbox",1),P(1),c(2,"span",2,0),P(4,1),m(),L(5,Fa,1,1,"mat-pseudo-checkbox",3),L(6,Ta,2,1,"span",4),A(7,"div",5)),t&2&&(B(a.multiple?0:-1),d(5),B(!a.multiple&&a.selected&&!a.hideSingleSelectionIndicator?5:-1),d(),B(a.group&&a.group._inert?6:-1),d(),g("matRippleTrigger",a._getHostElement())("matRippleDisabled",a.disabled||a.disableRipple))},dependencies:[da,Bt],styles:[`.mat-mdc-option {
  -webkit-user-select: none;
  user-select: none;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  min-height: 48px;
  padding: 0 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  color: var(--mat-option-label-text-color, var(--mat-sys-on-surface));
  font-family: var(--mat-option-label-text-font, var(--mat-sys-label-large-font));
  line-height: var(--mat-option-label-text-line-height, var(--mat-sys-label-large-line-height));
  font-size: var(--mat-option-label-text-size, var(--mat-sys-body-large-size));
  letter-spacing: var(--mat-option-label-text-tracking, var(--mat-sys-label-large-tracking));
  font-weight: var(--mat-option-label-text-weight, var(--mat-sys-body-large-weight));
}
.mat-mdc-option:hover:not(.mdc-list-item--disabled) {
  background-color: var(--mat-option-hover-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-option:focus.mdc-list-item, .mat-mdc-option.mat-mdc-option-active.mdc-list-item {
  background-color: var(--mat-option-focus-state-layer-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
  outline: 0;
}
.mat-mdc-option.mdc-list-item--selected:not(.mdc-list-item--disabled):not(.mat-mdc-option-active, .mat-mdc-option-multiple, :focus, :hover) {
  background-color: var(--mat-option-selected-state-layer-color, var(--mat-sys-secondary-container));
}
.mat-mdc-option.mdc-list-item--selected:not(.mdc-list-item--disabled):not(.mat-mdc-option-active, .mat-mdc-option-multiple, :focus, :hover) .mdc-list-item__primary-text {
  color: var(--mat-option-selected-state-label-text-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-option .mat-pseudo-checkbox {
  --mat-pseudo-checkbox-minimal-selected-checkmark-color: var(--mat-option-selected-state-label-text-color, var(--mat-sys-on-secondary-container));
}
.mat-mdc-option.mdc-list-item {
  align-items: center;
  background: transparent;
}
.mat-mdc-option.mdc-list-item--disabled {
  cursor: default;
  pointer-events: none;
}
.mat-mdc-option.mdc-list-item--disabled .mat-mdc-option-pseudo-checkbox, .mat-mdc-option.mdc-list-item--disabled .mdc-list-item__primary-text, .mat-mdc-option.mdc-list-item--disabled > mat-icon {
  opacity: 0.38;
}
.mat-mdc-optgroup .mat-mdc-option:not(.mat-mdc-option-multiple) {
  padding-left: 32px;
}
[dir=rtl] .mat-mdc-optgroup .mat-mdc-option:not(.mat-mdc-option-multiple) {
  padding-left: 16px;
  padding-right: 32px;
}
.mat-mdc-option .mat-icon,
.mat-mdc-option .mat-pseudo-checkbox-full {
  margin-right: 16px;
  flex-shrink: 0;
}
[dir=rtl] .mat-mdc-option .mat-icon,
[dir=rtl] .mat-mdc-option .mat-pseudo-checkbox-full {
  margin-right: 0;
  margin-left: 16px;
}
.mat-mdc-option .mat-pseudo-checkbox-minimal {
  margin-left: 16px;
  flex-shrink: 0;
}
[dir=rtl] .mat-mdc-option .mat-pseudo-checkbox-minimal {
  margin-right: 16px;
  margin-left: 0;
}
.mat-mdc-option .mat-mdc-option-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
.mat-mdc-option .mdc-list-item__primary-text {
  white-space: normal;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  font-family: inherit;
  text-decoration: inherit;
  text-transform: inherit;
  margin-right: auto;
}
[dir=rtl] .mat-mdc-option .mdc-list-item__primary-text {
  margin-right: 0;
  margin-left: auto;
}
@media (forced-colors: active) {
  .mat-mdc-option.mdc-list-item--selected:not(:has(.mat-mdc-option-pseudo-checkbox))::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 10px;
    height: 0;
    border-bottom: solid 10px;
    border-radius: 10px;
  }
  [dir=rtl] .mat-mdc-option.mdc-list-item--selected:not(:has(.mat-mdc-option-pseudo-checkbox))::after {
    right: auto;
    left: 16px;
  }
}

.mat-mdc-option-multiple {
  --mat-list-list-item-selected-container-color: var(--mat-list-list-item-container-color, transparent);
}

.mat-mdc-option-active .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2,changeDetection:0})}return n})();function Kn(n,o,e){if(e.length){let t=o.toArray(),a=e.toArray(),i=0;for(let r=0;r<n+1;r++)t[r].group&&t[r].group===a[i]&&i++;return i}return 0}function Wn(n,o,e,t){return n<e?n:n+o>e+t?Math.max(0,n-t+o):e}var lt=new N("MAT_DATE_LOCALE",{providedIn:"root",factory:()=>s(Rt)}),pe="Method not implemented",_=class{locale;_localeChanges=new S;localeChanges=this._localeChanges;setTime(o,e,t,a){throw new Error(pe)}getHours(o){throw new Error(pe)}getMinutes(o){throw new Error(pe)}getSeconds(o){throw new Error(pe)}parseTime(o,e){throw new Error(pe)}addSeconds(o,e){throw new Error(pe)}getValidDateOrNull(o){return this.isDateInstance(o)&&this.isValid(o)?o:null}deserialize(o){return o==null||this.isDateInstance(o)&&this.isValid(o)?o:this.invalid()}setLocale(o){this.locale=o,this._localeChanges.next()}compareDate(o,e){return this.getYear(o)-this.getYear(e)||this.getMonth(o)-this.getMonth(e)||this.getDate(o)-this.getDate(e)}compareTime(o,e){return this.getHours(o)-this.getHours(e)||this.getMinutes(o)-this.getMinutes(e)||this.getSeconds(o)-this.getSeconds(e)}sameDate(o,e){if(o&&e){let t=this.isValid(o),a=this.isValid(e);return t&&a?!this.compareDate(o,e):t==a}return o==e}sameTime(o,e){if(o&&e){let t=this.isValid(o),a=this.isValid(e);return t&&a?!this.compareTime(o,e):t==a}return o==e}clampDate(o,e,t){return e&&this.compareDate(o,e)<0?e:t&&this.compareDate(o,t)>0?t:o}},ee=new N("mat-date-formats");var ca=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$({type:n});static \u0275inj=q({imports:[le]})}return n})();var Pa=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$({type:n});static \u0275inj=q({imports:[Ht,ca,la,le]})}return n})();var Na=["mat-internal-form-field",""],Ya=["*"],ii=(()=>{class n{labelPosition="after";static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["div","mat-internal-form-field",""]],hostAttrs:[1,"mdc-form-field","mat-internal-form-field"],hostVars:2,hostBindings:function(t,a){t&2&&C("mdc-form-field--align-end",a.labelPosition==="before")},inputs:{labelPosition:"labelPosition"},attrs:Na,ngContentSelectors:Ya,decls:1,vars:0,template:function(t,a){t&1&&(G(),P(0))},styles:[`.mat-internal-form-field {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.mat-internal-form-field > label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
  order: 0;
}
[dir=rtl] .mat-internal-form-field > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
}

.mdc-form-field--align-end > label {
  margin-left: auto;
  margin-right: 0;
  padding-left: 0;
  padding-right: 4px;
  order: -1;
}
[dir=rtl] .mdc-form-field--align-end .mdc-form-field--align-end label {
  margin-left: 0;
  margin-right: auto;
  padding-left: 4px;
  padding-right: 0;
}
`],encapsulation:2,changeDetection:0})}return n})();var La=/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/,Ba=/^(\d?\d)[:.](\d?\d)(?:[:.](\d?\d))?\s*(AM|PM)?$/i;function ct(n,o){let e=Array(n);for(let t=0;t<n;t++)e[t]=o(t);return e}var Ha=(()=>{class n extends _{_matDateLocale=s(lt,{optional:!0});constructor(){super();let e=s(lt,{optional:!0});e!==void 0&&(this._matDateLocale=e),super.setLocale(this._matDateLocale)}getYear(e){return e.getFullYear()}getMonth(e){return e.getMonth()}getDate(e){return e.getDate()}getDayOfWeek(e){return e.getDay()}getMonthNames(e){let t=new Intl.DateTimeFormat(this.locale,{month:e,timeZone:"utc"});return ct(12,a=>this._format(t,new Date(2017,a,1)))}getDateNames(){let e=new Intl.DateTimeFormat(this.locale,{day:"numeric",timeZone:"utc"});return ct(31,t=>this._format(e,new Date(2017,0,t+1)))}getDayOfWeekNames(e){let t=new Intl.DateTimeFormat(this.locale,{weekday:e,timeZone:"utc"});return ct(7,a=>this._format(t,new Date(2017,0,a+1)))}getYearName(e){let t=new Intl.DateTimeFormat(this.locale,{year:"numeric",timeZone:"utc"});return this._format(t,e)}getFirstDayOfWeek(){if(typeof Intl<"u"&&Intl.Locale){let e=new Intl.Locale(this.locale),t=(e.getWeekInfo?.()||e.weekInfo)?.firstDay??0;return t===7?0:t}return 0}getNumDaysInMonth(e){return this.getDate(this._createDateWithOverflow(this.getYear(e),this.getMonth(e)+1,0))}clone(e){return new Date(e.getTime())}createDate(e,t,a){let i=this._createDateWithOverflow(e,t,a);return i.getMonth()!=t,i}today(){return new Date}parse(e,t){return typeof e=="number"?new Date(e):e?new Date(Date.parse(e)):null}format(e,t){if(!this.isValid(e))throw Error("NativeDateAdapter: Cannot format invalid date.");let a=new Intl.DateTimeFormat(this.locale,kt(wt({},t),{timeZone:"utc"}));return this._format(a,e)}addCalendarYears(e,t){return this.addCalendarMonths(e,t*12)}addCalendarMonths(e,t){let a=this._createDateWithOverflow(this.getYear(e),this.getMonth(e)+t,this.getDate(e));return this.getMonth(a)!=((this.getMonth(e)+t)%12+12)%12&&(a=this._createDateWithOverflow(this.getYear(a),this.getMonth(a),0)),a}addCalendarDays(e,t){return this._createDateWithOverflow(this.getYear(e),this.getMonth(e),this.getDate(e)+t)}toIso8601(e){return[e.getUTCFullYear(),this._2digit(e.getUTCMonth()+1),this._2digit(e.getUTCDate())].join("-")}deserialize(e){if(typeof e=="string"){if(!e)return null;if(La.test(e)){let t=new Date(e);if(this.isValid(t))return t}}return super.deserialize(e)}isDateInstance(e){return e instanceof Date}isValid(e){return!isNaN(e.getTime())}invalid(){return new Date(NaN)}setTime(e,t,a,i){let r=this.clone(e);return r.setHours(t,a,i,0),r}getHours(e){return e.getHours()}getMinutes(e){return e.getMinutes()}getSeconds(e){return e.getSeconds()}parseTime(e,t){if(typeof e!="string")return e instanceof Date?new Date(e.getTime()):null;let a=e.trim();if(a.length===0)return null;let i=this._parseTimeString(a);if(i===null){let r=a.replace(/[^0-9:(AM|PM)]/gi,"").trim();r.length>0&&(i=this._parseTimeString(r))}return i||this.invalid()}addSeconds(e,t){return new Date(e.getTime()+t*1e3)}_createDateWithOverflow(e,t,a){let i=new Date;return i.setFullYear(e,t,a),i.setHours(0,0,0,0),i}_2digit(e){return("00"+e).slice(-2)}_format(e,t){let a=new Date;return a.setUTCFullYear(t.getFullYear(),t.getMonth(),t.getDate()),a.setUTCHours(t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()),e.format(a)}_parseTimeString(e){let t=e.toUpperCase().match(Ba);if(t){let a=parseInt(t[1]),i=parseInt(t[2]),r=t[3]==null?void 0:parseInt(t[3]),l=t[4];if(a===12?a=l==="AM"?0:a:l==="PM"&&(a+=12),pt(a,0,23)&&pt(i,0,59)&&(r==null||pt(r,0,59)))return this.setTime(this.today(),a,i,r||0)}return null}static \u0275fac=function(t){return new(t||n)};static \u0275prov=W({token:n,factory:n.\u0275fac})}return n})();function pt(n,o,e){return!isNaN(n)&&n>=o&&n<=e}var za={parse:{dateInput:null,timeInput:null},display:{dateInput:{year:"numeric",month:"numeric",day:"numeric"},timeInput:{hour:"numeric",minute:"numeric"},monthYearLabel:{year:"numeric",month:"short"},dateA11yLabel:{year:"numeric",month:"long",day:"numeric"},monthYearA11yLabel:{year:"numeric",month:"long"},timeOptionLabel:{hour:"numeric",minute:"numeric"}}};var pi=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$({type:n});static \u0275inj=q({providers:[ja()]})}return n})();function ja(n=za){return[{provide:_,useClass:Ha},{provide:ee,useValue:n}]}var Wa=["mat-calendar-body",""];function qa(n,o){return this._trackRow(o)}var ba=(n,o)=>o.id;function Qa(n,o){if(n&1&&(F(0,"tr",0)(1,"td",3),D(2),T()()),n&2){let e=h();d(),Oe("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),y("colspan",e.numCols),d(),Z(" ",e.label," ")}}function $a(n,o){if(n&1&&(F(0,"td",3),D(1),T()),n&2){let e=h(2);Oe("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),y("colspan",e._firstRowOffset),d(),Z(" ",e._firstRowOffset>=e.labelMinRequiredCells?e.label:""," ")}}function Ua(n,o){if(n&1){let e=ye();F(0,"td",6)(1,"button",7),Ft("click",function(a){let i=w(e).$implicit,r=h(2);return k(r._cellClicked(i,a))})("focus",function(a){let i=w(e).$implicit,r=h(2);return k(r._emitActiveDateChange(i,a))}),F(2,"span",8),D(3),T(),It(4,"span",9),T()()}if(n&2){let e=o.$implicit,t=o.$index,a=h().$index,i=h();Oe("width",i._cellWidth)("padding-top",i._cellPadding)("padding-bottom",i._cellPadding),y("data-mat-row",a)("data-mat-col",t),d(),Pe(e.cssClasses),C("mat-calendar-body-disabled",!e.enabled)("mat-calendar-body-active",i._isActiveCell(a,t))("mat-calendar-body-range-start",i._isRangeStart(e.compareValue))("mat-calendar-body-range-end",i._isRangeEnd(e.compareValue))("mat-calendar-body-in-range",i._isInRange(e.compareValue))("mat-calendar-body-comparison-bridge-start",i._isComparisonBridgeStart(e.compareValue,a,t))("mat-calendar-body-comparison-bridge-end",i._isComparisonBridgeEnd(e.compareValue,a,t))("mat-calendar-body-comparison-start",i._isComparisonStart(e.compareValue))("mat-calendar-body-comparison-end",i._isComparisonEnd(e.compareValue))("mat-calendar-body-in-comparison-range",i._isInComparisonRange(e.compareValue))("mat-calendar-body-preview-start",i._isPreviewStart(e.compareValue))("mat-calendar-body-preview-end",i._isPreviewEnd(e.compareValue))("mat-calendar-body-in-preview",i._isInPreview(e.compareValue)),R("tabIndex",i._isActiveCell(a,t)?0:-1),y("aria-label",e.ariaLabel)("aria-disabled",!e.enabled||null)("aria-pressed",i._isSelected(e.compareValue))("aria-current",i.todayValue===e.compareValue?"date":null)("aria-describedby",i._getDescribedby(e.compareValue)),d(),C("mat-calendar-body-selected",i._isSelected(e.compareValue))("mat-calendar-body-comparison-identical",i._isComparisonIdentical(e.compareValue))("mat-calendar-body-today",i.todayValue===e.compareValue),d(),Z(" ",e.displayValue," ")}}function Ga(n,o){if(n&1&&(F(0,"tr",1),L(1,$a,2,6,"td",4),Te(2,Ua,5,49,"td",5,ba),T()),n&2){let e=o.$implicit,t=o.$index,a=h();d(),B(t===0&&a._firstRowOffset?1:-1),d(),Re(e)}}function Za(n,o){if(n&1&&(c(0,"th",2)(1,"span",6),D(2),m(),c(3,"span",3),D(4),m()()),n&2){let e=o.$implicit;d(2),z(e.long),d(2),z(e.narrow)}}var Xa=["*"];function Ja(n,o){}function en(n,o){if(n&1){let e=ye();c(0,"mat-month-view",4),Le("activeDateChange",function(a){w(e);let i=h();return Ye(i.activeDate,a)||(i.activeDate=a),k(a)}),f("_userSelection",function(a){w(e);let i=h();return k(i._dateSelected(a))})("dragStarted",function(a){w(e);let i=h();return k(i._dragStarted(a))})("dragEnded",function(a){w(e);let i=h();return k(i._dragEnded(a))}),m()}if(n&2){let e=h();Ne("activeDate",e.activeDate),g("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)("comparisonStart",e.comparisonStart)("comparisonEnd",e.comparisonEnd)("startDateAccessibleName",e.startDateAccessibleName)("endDateAccessibleName",e.endDateAccessibleName)("activeDrag",e._activeDrag)}}function tn(n,o){if(n&1){let e=ye();c(0,"mat-year-view",5),Le("activeDateChange",function(a){w(e);let i=h();return Ye(i.activeDate,a)||(i.activeDate=a),k(a)}),f("monthSelected",function(a){w(e);let i=h();return k(i._monthSelectedInYearView(a))})("selectedChange",function(a){w(e);let i=h();return k(i._goToDateInView(a,"month"))}),m()}if(n&2){let e=h();Ne("activeDate",e.activeDate),g("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function an(n,o){if(n&1){let e=ye();c(0,"mat-multi-year-view",6),Le("activeDateChange",function(a){w(e);let i=h();return Ye(i.activeDate,a)||(i.activeDate=a),k(a)}),f("yearSelected",function(a){w(e);let i=h();return k(i._yearSelectedInMultiYearView(a))})("selectedChange",function(a){w(e);let i=h();return k(i._goToDateInView(a,"year"))}),m()}if(n&2){let e=h();Ne("activeDate",e.activeDate),g("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function nn(n,o){}var rn=["button"],on=[[["","matDatepickerToggleIcon",""]]],sn=["[matDatepickerToggleIcon]"];function dn(n,o){n&1&&(be(),c(0,"svg",2),A(1,"path",3),m())}var ln=[[["input","matStartDate",""]],[["input","matEndDate",""]]],cn=["input[matStartDate]","input[matEndDate]"];var ge=(()=>{class n{changes=new S;calendarLabel="Calendar";openCalendarLabel="Open calendar";closeCalendarLabel="Close calendar";prevMonthLabel="Previous month";nextMonthLabel="Next month";prevYearLabel="Previous year";nextYearLabel="Next year";prevMultiYearLabel="Previous 24 years";nextMultiYearLabel="Next 24 years";switchToMonthViewLabel="Choose date";switchToMultiYearViewLabel="Choose month and year";startDateLabel="Start date";endDateLabel="End date";comparisonDateLabel="Comparison range";formatYearRange(e,t){return`${e} \u2013 ${t}`}formatYearRangeLabel(e,t){return`${e} to ${t}`}static \u0275fac=function(t){return new(t||n)};static \u0275prov=W({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),pn=0,Me=class{value;displayValue;ariaLabel;enabled;compareValue;rawValue;id=pn++;cssClasses;constructor(o,e,t,a,i,r=o,l){this.value=o,this.displayValue=e,this.ariaLabel=t,this.enabled=a,this.compareValue=r,this.rawValue=l,this.cssClasses=i instanceof Set?Array.from(i):i}},mn={passive:!1,capture:!0},je={passive:!0,capture:!0},pa={passive:!0},ue=(()=>{class n{_elementRef=s(Y);_ngZone=s(Ge);_platform=s(Pt);_intl=s(ge);_eventCleanups;_skipNextFocus=!1;_focusActiveCellAfterViewChecked=!1;label;rows;todayValue;startValue;endValue;labelMinRequiredCells;numCols=7;activeCell=0;ngAfterViewChecked(){this._focusActiveCellAfterViewChecked&&(this._focusActiveCell(),this._focusActiveCellAfterViewChecked=!1)}isRange=!1;cellAspectRatio=1;comparisonStart=null;comparisonEnd=null;previewStart=null;previewEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedValueChange=new p;previewChange=new p;activeDateChange=new p;dragStarted=new p;dragEnded=new p;_firstRowOffset;_cellPadding;_cellWidth;_startDateLabelId;_endDateLabelId;_comparisonStartDateLabelId;_comparisonEndDateLabelId;_didDragSinceMouseDown=!1;_injector=s(ve);comparisonDateAccessibleName=this._intl.comparisonDateLabel;_trackRow=e=>e;constructor(){let e=s(Xe),t=s(ie);this._startDateLabelId=t.getId("mat-calendar-body-start-"),this._endDateLabelId=t.getId("mat-calendar-body-end-"),this._comparisonStartDateLabelId=t.getId("mat-calendar-body-comparison-start-"),this._comparisonEndDateLabelId=t.getId("mat-calendar-body-comparison-end-"),s(ne).load(Be),this._ngZone.runOutsideAngular(()=>{let a=this._elementRef.nativeElement,i=[e.listen(a,"touchmove",this._touchmoveHandler,mn),e.listen(a,"mouseenter",this._enterHandler,je),e.listen(a,"focus",this._enterHandler,je),e.listen(a,"mouseleave",this._leaveHandler,je),e.listen(a,"blur",this._leaveHandler,je),e.listen(a,"mousedown",this._mousedownHandler,pa),e.listen(a,"touchstart",this._mousedownHandler,pa)];this._platform.isBrowser&&i.push(e.listen("window","mouseup",this._mouseupHandler),e.listen("window","touchend",this._touchendHandler)),this._eventCleanups=i})}_cellClicked(e,t){this._didDragSinceMouseDown||e.enabled&&this.selectedValueChange.emit({value:e.value,event:t})}_emitActiveDateChange(e,t){e.enabled&&this.activeDateChange.emit({value:e.value,event:t})}_isSelected(e){return this.startValue===e||this.endValue===e}ngOnChanges(e){let t=e.numCols,{rows:a,numCols:i}=this;(e.rows||t)&&(this._firstRowOffset=a&&a.length&&a[0].length?i-a[0].length:0),(e.cellAspectRatio||t||!this._cellPadding)&&(this._cellPadding=`${50*this.cellAspectRatio/i}%`),(t||!this._cellWidth)&&(this._cellWidth=`${100/i}%`)}ngOnDestroy(){this._eventCleanups.forEach(e=>e())}_isActiveCell(e,t){let a=e*this.numCols+t;return e&&(a-=this._firstRowOffset),a==this.activeCell}_focusActiveCell(e=!0){Ze(()=>{setTimeout(()=>{let t=this._elementRef.nativeElement.querySelector(".mat-calendar-body-active");t&&(e||(this._skipNextFocus=!0),t.focus())})},{injector:this._injector})}_scheduleFocusActiveCellAfterViewChecked(){this._focusActiveCellAfterViewChecked=!0}_isRangeStart(e){return ht(e,this.startValue,this.endValue)}_isRangeEnd(e){return _t(e,this.startValue,this.endValue)}_isInRange(e){return gt(e,this.startValue,this.endValue,this.isRange)}_isComparisonStart(e){return ht(e,this.comparisonStart,this.comparisonEnd)}_isComparisonBridgeStart(e,t,a){if(!this._isComparisonStart(e)||this._isRangeStart(e)||!this._isInRange(e))return!1;let i=this.rows[t][a-1];if(!i){let r=this.rows[t-1];i=r&&r[r.length-1]}return i&&!this._isRangeEnd(i.compareValue)}_isComparisonBridgeEnd(e,t,a){if(!this._isComparisonEnd(e)||this._isRangeEnd(e)||!this._isInRange(e))return!1;let i=this.rows[t][a+1];if(!i){let r=this.rows[t+1];i=r&&r[0]}return i&&!this._isRangeStart(i.compareValue)}_isComparisonEnd(e){return _t(e,this.comparisonStart,this.comparisonEnd)}_isInComparisonRange(e){return gt(e,this.comparisonStart,this.comparisonEnd,this.isRange)}_isComparisonIdentical(e){return this.comparisonStart===this.comparisonEnd&&e===this.comparisonStart}_isPreviewStart(e){return ht(e,this.previewStart,this.previewEnd)}_isPreviewEnd(e){return _t(e,this.previewStart,this.previewEnd)}_isInPreview(e){return gt(e,this.previewStart,this.previewEnd,this.isRange)}_getDescribedby(e){if(!this.isRange)return null;if(this.startValue===e&&this.endValue===e)return`${this._startDateLabelId} ${this._endDateLabelId}`;if(this.startValue===e)return this._startDateLabelId;if(this.endValue===e)return this._endDateLabelId;if(this.comparisonStart!==null&&this.comparisonEnd!==null){if(e===this.comparisonStart&&e===this.comparisonEnd)return`${this._comparisonStartDateLabelId} ${this._comparisonEndDateLabelId}`;if(e===this.comparisonStart)return this._comparisonStartDateLabelId;if(e===this.comparisonEnd)return this._comparisonEndDateLabelId}return null}_enterHandler=e=>{if(this._skipNextFocus&&e.type==="focus"){this._skipNextFocus=!1;return}if(e.target&&this.isRange){let t=this._getCellFromElement(e.target);t&&this._ngZone.run(()=>this.previewChange.emit({value:t.enabled?t:null,event:e}))}};_touchmoveHandler=e=>{if(!this.isRange)return;let t=ma(e),a=t?this._getCellFromElement(t):null;t!==e.target&&(this._didDragSinceMouseDown=!0),ut(e.target)&&e.preventDefault(),this._ngZone.run(()=>this.previewChange.emit({value:a?.enabled?a:null,event:e}))};_leaveHandler=e=>{this.previewEnd!==null&&this.isRange&&(e.type!=="blur"&&(this._didDragSinceMouseDown=!0),e.target&&this._getCellFromElement(e.target)&&!(e.relatedTarget&&this._getCellFromElement(e.relatedTarget))&&this._ngZone.run(()=>this.previewChange.emit({value:null,event:e})))};_mousedownHandler=e=>{if(!this.isRange)return;this._didDragSinceMouseDown=!1;let t=e.target&&this._getCellFromElement(e.target);!t||!this._isInRange(t.compareValue)||this._ngZone.run(()=>{this.dragStarted.emit({value:t.rawValue,event:e})})};_mouseupHandler=e=>{if(!this.isRange)return;let t=ut(e.target);if(!t){this._ngZone.run(()=>{this.dragEnded.emit({value:null,event:e})});return}t.closest(".mat-calendar-body")===this._elementRef.nativeElement&&this._ngZone.run(()=>{let a=this._getCellFromElement(t);this.dragEnded.emit({value:a?.rawValue??null,event:e})})};_touchendHandler=e=>{let t=ma(e);t&&this._mouseupHandler({target:t})};_getCellFromElement(e){let t=ut(e);if(t){let a=t.getAttribute("data-mat-row"),i=t.getAttribute("data-mat-col");if(a&&i)return this.rows[parseInt(a)]?.[parseInt(i)]||null}return null}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["","mat-calendar-body",""]],hostAttrs:[1,"mat-calendar-body"],inputs:{label:"label",rows:"rows",todayValue:"todayValue",startValue:"startValue",endValue:"endValue",labelMinRequiredCells:"labelMinRequiredCells",numCols:"numCols",activeCell:"activeCell",isRange:"isRange",cellAspectRatio:"cellAspectRatio",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",previewStart:"previewStart",previewEnd:"previewEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedValueChange:"selectedValueChange",previewChange:"previewChange",activeDateChange:"activeDateChange",dragStarted:"dragStarted",dragEnded:"dragEnded"},exportAs:["matCalendarBody"],features:[Q],attrs:Wa,decls:11,vars:11,consts:[["aria-hidden","true"],["role","row"],[1,"mat-calendar-body-hidden-label",3,"id"],[1,"mat-calendar-body-label"],[1,"mat-calendar-body-label",3,"paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container",3,"width","paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container"],["type","button",1,"mat-calendar-body-cell",3,"click","focus","tabindex"],[1,"mat-calendar-body-cell-content","mat-focus-indicator"],["aria-hidden","true",1,"mat-calendar-body-cell-preview"]],template:function(t,a){t&1&&(L(0,Qa,3,6,"tr",0),Te(1,Ga,4,1,"tr",1,qa,!0),F(3,"span",2),D(4),T(),F(5,"span",2),D(6),T(),F(7,"span",2),D(8),T(),F(9,"span",2),D(10),T()),t&2&&(B(a._firstRowOffset<a.labelMinRequiredCells?0:-1),d(),Re(a.rows),d(2),R("id",a._startDateLabelId),d(),Z(" ",a.startDateAccessibleName,`
`),d(),R("id",a._endDateLabelId),d(),Z(" ",a.endDateAccessibleName,`
`),d(),R("id",a._comparisonStartDateLabelId),d(),et(" ",a.comparisonDateAccessibleName," ",a.startDateAccessibleName,`
`),d(),R("id",a._comparisonEndDateLabelId),d(),et(" ",a.comparisonDateAccessibleName," ",a.endDateAccessibleName,`
`))},styles:[`.mat-calendar-body {
  min-width: 224px;
}

.mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  border-color: var(--mat-datepicker-calendar-date-today-outline-color, var(--mat-sys-primary));
}

.mat-calendar-body-label {
  height: 0;
  line-height: 0;
  text-align: start;
  padding-left: 4.7142857143%;
  padding-right: 4.7142857143%;
  font-size: var(--mat-datepicker-calendar-body-label-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-body-label-text-weight, var(--mat-sys-title-small-weight));
  color: var(--mat-datepicker-calendar-body-label-text-color, var(--mat-sys-on-surface));
}

.mat-calendar-body-hidden-label {
  display: none;
}

.mat-calendar-body-cell-container {
  position: relative;
  height: 0;
  line-height: 0;
}

.mat-calendar-body-cell {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  text-align: center;
  outline: none;
  margin: 0;
  font-family: var(--mat-datepicker-calendar-text-font, var(--mat-sys-body-medium-font));
  font-size: var(--mat-datepicker-calendar-text-size, var(--mat-sys-body-medium-size));
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-calendar-body-cell::-moz-focus-inner {
  border: 0;
}

.mat-calendar-body-cell::before,
.mat-calendar-body-cell::after,
.mat-calendar-body-cell-preview {
  content: "";
  position: absolute;
  top: 5%;
  left: 0;
  z-index: 0;
  box-sizing: border-box;
  display: block;
  height: 90%;
  width: 100%;
}

.mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,
.mat-calendar-body-range-start::after,
.mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,
.mat-calendar-body-comparison-start::after,
.mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  left: 5%;
  width: 95%;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}
[dir=rtl] .mat-calendar-body-range-start:not(.mat-calendar-body-in-comparison-range)::before,
[dir=rtl] .mat-calendar-body-range-start::after,
[dir=rtl] .mat-calendar-body-comparison-start:not(.mat-calendar-body-comparison-bridge-start)::before,
[dir=rtl] .mat-calendar-body-comparison-start::after,
[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  left: 0;
  border-radius: 0;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,
.mat-calendar-body-range-end::after,
.mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,
.mat-calendar-body-comparison-end::after,
.mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  width: 95%;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}
[dir=rtl] .mat-calendar-body-range-end:not(.mat-calendar-body-in-comparison-range)::before,
[dir=rtl] .mat-calendar-body-range-end::after,
[dir=rtl] .mat-calendar-body-comparison-end:not(.mat-calendar-body-comparison-bridge-end)::before,
[dir=rtl] .mat-calendar-body-comparison-end::after,
[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  left: 5%;
  border-radius: 0;
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

[dir=rtl] .mat-calendar-body-comparison-bridge-start.mat-calendar-body-range-end::after,
[dir=rtl] .mat-calendar-body-comparison-bridge-end.mat-calendar-body-range-start::after {
  width: 95%;
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.mat-calendar-body-comparison-start.mat-calendar-body-range-end::after, [dir=rtl] .mat-calendar-body-comparison-start.mat-calendar-body-range-end::after,
.mat-calendar-body-comparison-end.mat-calendar-body-range-start::after,
[dir=rtl] .mat-calendar-body-comparison-end.mat-calendar-body-range-start::after {
  width: 90%;
}

.mat-calendar-body-in-preview {
  color: var(--mat-datepicker-calendar-date-preview-state-outline-color, var(--mat-sys-primary));
}
.mat-calendar-body-in-preview .mat-calendar-body-cell-preview {
  border-top: dashed 1px;
  border-bottom: dashed 1px;
}

.mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  border-left: dashed 1px;
}
[dir=rtl] .mat-calendar-body-preview-start .mat-calendar-body-cell-preview {
  border-left: 0;
  border-right: dashed 1px;
}

.mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  border-right: dashed 1px;
}
[dir=rtl] .mat-calendar-body-preview-end .mat-calendar-body-cell-preview {
  border-right: 0;
  border-left: dashed 1px;
}

.mat-calendar-body-disabled {
  cursor: default;
}
.mat-calendar-body-disabled > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  color: var(--mat-datepicker-calendar-date-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-calendar-body-disabled > .mat-calendar-body-today:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  border-color: var(--mat-datepicker-calendar-date-today-disabled-state-outline-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
@media (forced-colors: active) {
  .mat-calendar-body-disabled {
    opacity: 0.5;
  }
}

.mat-calendar-body-cell-content {
  top: 5%;
  left: 5%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 90%;
  height: 90%;
  line-height: 1;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  color: var(--mat-datepicker-calendar-date-text-color, var(--mat-sys-on-surface));
  border-color: var(--mat-datepicker-calendar-date-outline-color, transparent);
}
.mat-calendar-body-cell-content.mat-focus-indicator {
  position: absolute;
}
@media (forced-colors: active) {
  .mat-calendar-body-cell-content {
    border: none;
  }
}

.cdk-keyboard-focused .mat-calendar-body-active > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical), .cdk-program-focused .mat-calendar-body-active > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
  background-color: var(--mat-datepicker-calendar-date-focus-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-focus-state-layer-opacity) * 100%), transparent));
}

@media (hover: hover) {
  .mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected):not(.mat-calendar-body-comparison-identical) {
    background-color: var(--mat-datepicker-calendar-date-hover-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) calc(var(--mat-sys-hover-state-layer-opacity) * 100%), transparent));
  }
}
.mat-calendar-body-selected {
  background-color: var(--mat-datepicker-calendar-date-selected-state-background-color, var(--mat-sys-primary));
  color: var(--mat-datepicker-calendar-date-selected-state-text-color, var(--mat-sys-on-primary));
}
.mat-calendar-body-disabled > .mat-calendar-body-selected {
  background-color: var(--mat-datepicker-calendar-date-selected-disabled-state-background-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-calendar-body-selected.mat-calendar-body-today {
  box-shadow: inset 0 0 0 1px var(--mat-datepicker-calendar-date-today-selected-state-outline-color, var(--mat-sys-primary));
}

.mat-calendar-body-in-range::before {
  background: var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container));
}

.mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range::before {
  background: var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container));
}

.mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range::before {
  background: var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container));
}

.mat-calendar-body-comparison-bridge-start::before,
[dir=rtl] .mat-calendar-body-comparison-bridge-end::before {
  background: linear-gradient(to right, var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container)) 50%, var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container)) 50%);
}

.mat-calendar-body-comparison-bridge-end::before,
[dir=rtl] .mat-calendar-body-comparison-bridge-start::before {
  background: linear-gradient(to left, var(--mat-datepicker-calendar-date-in-range-state-background-color, var(--mat-sys-primary-container)) 50%, var(--mat-datepicker-calendar-date-in-comparison-range-state-background-color, var(--mat-sys-tertiary-container)) 50%);
}

.mat-calendar-body-in-range > .mat-calendar-body-comparison-identical,
.mat-calendar-body-in-comparison-range.mat-calendar-body-in-range::after {
  background: var(--mat-datepicker-calendar-date-in-overlap-range-state-background-color, var(--mat-sys-secondary-container));
}

.mat-calendar-body-comparison-identical.mat-calendar-body-selected,
.mat-calendar-body-in-comparison-range > .mat-calendar-body-selected {
  background: var(--mat-datepicker-calendar-date-in-overlap-range-selected-state-background-color, var(--mat-sys-secondary));
}

@media (forced-colors: active) {
  .mat-datepicker-popup:not(:empty),
  .mat-calendar-body-cell:not(.mat-calendar-body-in-range) .mat-calendar-body-selected {
    outline: solid 1px;
  }
  .mat-calendar-body-today {
    outline: dotted 1px;
  }
  .mat-calendar-body-cell::before,
  .mat-calendar-body-cell::after,
  .mat-calendar-body-selected {
    background: none;
  }
  .mat-calendar-body-in-range::before,
  .mat-calendar-body-comparison-bridge-start::before,
  .mat-calendar-body-comparison-bridge-end::before {
    border-top: solid 1px;
    border-bottom: solid 1px;
  }
  .mat-calendar-body-range-start::before {
    border-left: solid 1px;
  }
  [dir=rtl] .mat-calendar-body-range-start::before {
    border-left: 0;
    border-right: solid 1px;
  }
  .mat-calendar-body-range-end::before {
    border-right: solid 1px;
  }
  [dir=rtl] .mat-calendar-body-range-end::before {
    border-right: 0;
    border-left: solid 1px;
  }
  .mat-calendar-body-in-comparison-range::before {
    border-top: dashed 1px;
    border-bottom: dashed 1px;
  }
  .mat-calendar-body-comparison-start::before {
    border-left: dashed 1px;
  }
  [dir=rtl] .mat-calendar-body-comparison-start::before {
    border-left: 0;
    border-right: dashed 1px;
  }
  .mat-calendar-body-comparison-end::before {
    border-right: dashed 1px;
  }
  [dir=rtl] .mat-calendar-body-comparison-end::before {
    border-right: 0;
    border-left: dashed 1px;
  }
}
`],encapsulation:2,changeDetection:0})}return n})();function mt(n){return n?.nodeName==="TD"}function ut(n){let o;return mt(n)?o=n:mt(n.parentNode)?o=n.parentNode:mt(n.parentNode?.parentNode)&&(o=n.parentNode.parentNode),o?.getAttribute("data-mat-row")!=null?o:null}function ht(n,o,e){return e!==null&&o!==e&&n<e&&n===o}function _t(n,o,e){return o!==null&&o!==e&&n>=o&&n===e}function gt(n,o,e,t){return t&&o!==null&&e!==null&&o!==e&&n>=o&&n<=e}function ma(n){let o=n.changedTouches[0];return document.elementFromPoint(o.clientX,o.clientY)}var b=class{start;end;_disableStructuralEquivalency;constructor(o,e){this.start=o,this.end=e}},te=(()=>{class n{selection;_adapter;_selectionChanged=new S;selectionChanged=this._selectionChanged;constructor(e,t){this.selection=e,this._adapter=t,this.selection=e}updateSelection(e,t){let a=this.selection;this.selection=e,this._selectionChanged.next({selection:e,source:t,oldValue:a})}ngOnDestroy(){this._selectionChanged.complete()}_isValidDateInstance(e){return this._adapter.isDateInstance(e)&&this._adapter.isValid(e)}static \u0275fac=function(t){St()};static \u0275prov=W({token:n,factory:n.\u0275fac})}return n})(),un=(()=>{class n extends te{constructor(e){super(null,e)}add(e){super.updateSelection(e,this)}isValid(){return this.selection!=null&&this._isValidDateInstance(this.selection)}isComplete(){return this.selection!=null}clone(){let e=new n(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||n)(Fe(_))};static \u0275prov=W({token:n,factory:n.\u0275fac})}return n})(),hn=(()=>{class n extends te{constructor(e){super(new b(null,null),e)}add(e){let{start:t,end:a}=this.selection;t==null?t=e:a==null?a=e:(t=e,a=null),super.updateSelection(new b(t,a),this)}isValid(){let{start:e,end:t}=this.selection;return e==null&&t==null?!0:e!=null&&t!=null?this._isValidDateInstance(e)&&this._isValidDateInstance(t)&&this._adapter.compareDate(e,t)<=0:(e==null||this._isValidDateInstance(e))&&(t==null||this._isValidDateInstance(t))}isComplete(){return this.selection.start!=null&&this.selection.end!=null}clone(){let e=new n(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||n)(Fe(_))};static \u0275prov=W({token:n,factory:n.\u0275fac})}return n})(),va={provide:te,useFactory:()=>s(te,{optional:!0,skipSelf:!0})||new un(s(_))},_n={provide:te,useFactory:()=>s(te,{optional:!0,skipSelf:!0})||new hn(s(_))},Ke=new N("MAT_DATE_RANGE_SELECTION_STRATEGY"),gn=(()=>{class n{_dateAdapter;constructor(e){this._dateAdapter=e}selectionFinished(e,t){let{start:a,end:i}=t;return a==null?a=e:i==null&&e&&this._dateAdapter.compareDate(e,a)>=0?i=e:(a=e,i=null),new b(a,i)}createPreview(e,t){let a=null,i=null;return t.start&&!t.end&&e&&(a=t.start,i=e),new b(a,i)}createDrag(e,t,a){let i=t.start,r=t.end;if(!i||!r)return null;let l=this._dateAdapter,Se=l.compareDate(i,r)!==0,re=l.getYear(a)-l.getYear(e),oe=l.getMonth(a)-l.getMonth(e),Ve=l.getDate(a)-l.getDate(e);return Se&&l.sameDate(e,t.start)?(i=a,l.compareDate(a,r)>0&&(r=l.addCalendarYears(r,re),r=l.addCalendarMonths(r,oe),r=l.addCalendarDays(r,Ve))):Se&&l.sameDate(e,t.end)?(r=a,l.compareDate(a,i)<0&&(i=l.addCalendarYears(i,re),i=l.addCalendarMonths(i,oe),i=l.addCalendarDays(i,Ve))):(i=l.addCalendarYears(i,re),i=l.addCalendarMonths(i,oe),i=l.addCalendarDays(i,Ve),r=l.addCalendarYears(r,re),r=l.addCalendarMonths(r,oe),r=l.addCalendarDays(r,Ve)),new b(i,r)}static \u0275fac=function(t){return new(t||n)(Fe(_))};static \u0275prov=W({token:n,factory:n.\u0275fac})}return n})(),ft=7,fn=0,ua=(()=>{class n{_changeDetectorRef=s(I);_dateFormats=s(ee,{optional:!0});_dateAdapter=s(_,{optional:!0});_dir=s(de,{optional:!0});_rangeStrategy=s(Ke,{optional:!0});_rerenderSubscription=x.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._hasSameMonthAndYear(t,this._activeDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof b?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setRanges(this._selected)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;activeDrag=null;selectedChange=new p;_userSelection=new p;dragStarted=new p;dragEnded=new p;activeDateChange=new p;_matCalendarBody;_monthLabel=u("");_weeks=u([]);_firstWeekOffset=u(0);_rangeStart=u(null);_rangeEnd=u(null);_comparisonRangeStart=u(null);_comparisonRangeEnd=u(null);_previewStart=u(null);_previewEnd=u(null);_isRange=u(!1);_todayDate=u(null);_weekdays=u([]);constructor(){s(ne).load(se),this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ie(null)).subscribe(()=>this._init())}ngOnChanges(e){let t=e.comparisonStart||e.comparisonEnd;t&&!t.firstChange&&this._setRanges(this.selected),e.activeDrag&&!this.activeDrag&&this._clearPreview()}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_dateSelected(e){let t=e.value,a=this._getDateFromDayOfMonth(t),i,r;this._selected instanceof b?(i=this._getDateInCurrentMonth(this._selected.start),r=this._getDateInCurrentMonth(this._selected.end)):i=r=this._getDateInCurrentMonth(this._selected),(i!==t||r!==t)&&this.selectedChange.emit(a),this._userSelection.emit({value:a,event:e.event}),this._clearPreview(),this._changeDetectorRef.markForCheck()}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromDayOfMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this._activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,-7);break;case 40:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,7);break;case 36:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,1-this._dateAdapter.getDate(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,this._dateAdapter.getNumDaysInMonth(this._activeDate)-this._dateAdapter.getDate(this._activeDate));break;case 33:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,-1):this._dateAdapter.addCalendarMonths(this._activeDate,-1);break;case 34:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,1):this._dateAdapter.addCalendarMonths(this._activeDate,1);break;case 13:case 32:this._selectionKeyPressed=!0,this._canSelect(this._activeDate)&&e.preventDefault();return;case 27:this._previewEnd()!=null&&!K(e)&&(this._clearPreview(),this.activeDrag?this.dragEnded.emit({value:null,event:e}):(this.selectedChange.emit(null),this._userSelection.emit({value:null,event:e})),e.preventDefault(),e.stopPropagation());return;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._canSelect(this._activeDate)&&this._dateSelected({value:this._dateAdapter.getDate(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setRanges(this.selected),this._todayDate.set(this._getCellCompareValue(this._dateAdapter.today())),this._monthLabel.set(this._dateFormats.display.monthLabel?this._dateAdapter.format(this.activeDate,this._dateFormats.display.monthLabel):this._dateAdapter.getMonthNames("short")[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase());let e=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),1);this._firstWeekOffset.set((ft+this._dateAdapter.getDayOfWeek(e)-this._dateAdapter.getFirstDayOfWeek())%ft),this._initWeekdays(),this._createWeekCells(),this._changeDetectorRef.markForCheck()}_focusActiveCell(e){this._matCalendarBody._focusActiveCell(e)}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_previewChanged({event:e,value:t}){if(this._rangeStrategy){let a=t?t.rawValue:null,i=this._rangeStrategy.createPreview(a,this.selected,e);if(this._previewStart.set(this._getCellCompareValue(i.start)),this._previewEnd.set(this._getCellCompareValue(i.end)),this.activeDrag&&a){let r=this._rangeStrategy.createDrag?.(this.activeDrag.value,this.selected,a,e);r&&(this._previewStart.set(this._getCellCompareValue(r.start)),this._previewEnd.set(this._getCellCompareValue(r.end)))}}}_dragEnded(e){if(this.activeDrag)if(e.value){let t=this._rangeStrategy?.createDrag?.(this.activeDrag.value,this.selected,e.value,e.event);this.dragEnded.emit({value:t??null,event:e.event})}else this.dragEnded.emit({value:null,event:e.event})}_getDateFromDayOfMonth(e){return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),e)}_initWeekdays(){let e=this._dateAdapter.getFirstDayOfWeek(),t=this._dateAdapter.getDayOfWeekNames("narrow"),i=this._dateAdapter.getDayOfWeekNames("long").map((r,l)=>({long:r,narrow:t[l],id:fn++}));this._weekdays.set(i.slice(e).concat(i.slice(0,e)))}_createWeekCells(){let e=this._dateAdapter.getNumDaysInMonth(this.activeDate),t=this._dateAdapter.getDateNames(),a=[[]];for(let i=0,r=this._firstWeekOffset();i<e;i++,r++){r==ft&&(a.push([]),r=0);let l=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),i+1),Se=this._shouldEnableDate(l),re=this._dateAdapter.format(l,this._dateFormats.display.dateA11yLabel),oe=this.dateClass?this.dateClass(l,"month"):void 0;a[a.length-1].push(new Me(i+1,t[i],re,Se,oe,this._getCellCompareValue(l),l))}this._weeks.set(a)}_shouldEnableDate(e){return!!e&&(!this.minDate||this._dateAdapter.compareDate(e,this.minDate)>=0)&&(!this.maxDate||this._dateAdapter.compareDate(e,this.maxDate)<=0)&&(!this.dateFilter||this.dateFilter(e))}_getDateInCurrentMonth(e){return e&&this._hasSameMonthAndYear(e,this.activeDate)?this._dateAdapter.getDate(e):null}_hasSameMonthAndYear(e,t){return!!(e&&t&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t)&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t))}_getCellCompareValue(e){if(e){let t=this._dateAdapter.getYear(e),a=this._dateAdapter.getMonth(e),i=this._dateAdapter.getDate(e);return new Date(t,a,i).getTime()}return null}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setRanges(e){e instanceof b?(this._rangeStart.set(this._getCellCompareValue(e.start)),this._rangeEnd.set(this._getCellCompareValue(e.end)),this._isRange.set(!0)):(this._rangeStart.set(this._getCellCompareValue(e)),this._rangeEnd.set(this._rangeStart()),this._isRange.set(!1)),this._comparisonRangeStart.set(this._getCellCompareValue(this.comparisonStart)),this._comparisonRangeEnd.set(this._getCellCompareValue(this.comparisonEnd))}_canSelect(e){return!this.dateFilter||this.dateFilter(e)}_clearPreview(){this._previewStart.set(null),this._previewEnd.set(null)}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-month-view"]],viewQuery:function(t,a){if(t&1&&H(ue,5),t&2){let i;V(i=E())&&(a._matCalendarBody=i.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName",activeDrag:"activeDrag"},outputs:{selectedChange:"selectedChange",_userSelection:"_userSelection",dragStarted:"dragStarted",dragEnded:"dragEnded",activeDateChange:"activeDateChange"},exportAs:["matMonthView"],features:[Q],decls:8,vars:14,consts:[["role","grid",1,"mat-calendar-table"],[1,"mat-calendar-table-header"],["scope","col"],["aria-hidden","true"],["colspan","7",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","previewChange","dragStarted","dragEnded","keyup","keydown","label","rows","todayValue","startValue","endValue","comparisonStart","comparisonEnd","previewStart","previewEnd","isRange","labelMinRequiredCells","activeCell","startDateAccessibleName","endDateAccessibleName"],[1,"cdk-visually-hidden"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),Te(3,Za,5,2,"th",2,ba),m(),c(5,"tr",3),A(6,"th",4),m()(),c(7,"tbody",5),f("selectedValueChange",function(r){return a._dateSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("previewChange",function(r){return a._previewChanged(r)})("dragStarted",function(r){return a.dragStarted.emit(r)})("dragEnded",function(r){return a._dragEnded(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),m()()),t&2&&(d(3),Re(a._weekdays()),d(4),g("label",a._monthLabel())("rows",a._weeks())("todayValue",a._todayDate())("startValue",a._rangeStart())("endValue",a._rangeEnd())("comparisonStart",a._comparisonRangeStart())("comparisonEnd",a._comparisonRangeEnd())("previewStart",a._previewStart())("previewEnd",a._previewEnd())("isRange",a._isRange())("labelMinRequiredCells",3)("activeCell",a._dateAdapter.getDate(a.activeDate)-1)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName))},dependencies:[ue],encapsulation:2,changeDetection:0})}return n})(),M=24,bt=4,ha=(()=>{class n{_changeDetectorRef=s(I);_dateAdapter=s(_,{optional:!0});_dir=s(de,{optional:!0});_rerenderSubscription=x.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),Da(this._dateAdapter,t,this._activeDate,this.minDate,this.maxDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof b?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedYear(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new p;yearSelected=new p;activeDateChange=new p;_matCalendarBody;_years=u([]);_todayYear=u(0);_selectedYear=u(null);constructor(){this._dateAdapter,this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ie(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_init(){this._todayYear.set(this._dateAdapter.getYear(this._dateAdapter.today()));let t=this._dateAdapter.getYear(this._activeDate)-ke(this._dateAdapter,this.activeDate,this.minDate,this.maxDate),a=[];for(let i=0,r=[];i<M;i++)r.push(t+i),r.length==bt&&(a.push(r.map(l=>this._createCellForYear(l))),r=[]);this._years.set(a),this._changeDetectorRef.markForCheck()}_yearSelected(e){let t=e.value,a=this._dateAdapter.createDate(t,0,1),i=this._getDateFromYear(t);this.yearSelected.emit(a),this.selectedChange.emit(i)}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromYear(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-bt);break;case 40:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,bt);break;case 36:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-ke(this._dateAdapter,this.activeDate,this.minDate,this.maxDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,M-ke(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)-1);break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-M*10:-M);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?M*10:M);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked(),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._yearSelected({value:this._dateAdapter.getYear(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_getActiveCell(){return ke(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getDateFromYear(e){let t=this._dateAdapter.getMonth(this.activeDate),a=this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(e,t,1));return this._dateAdapter.createDate(e,t,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForYear(e){let t=this._dateAdapter.createDate(e,0,1),a=this._dateAdapter.getYearName(t),i=this.dateClass?this.dateClass(t,"multi-year"):void 0;return new Me(e,a,a,this._shouldEnableYear(e),i)}_shouldEnableYear(e){if(e==null||this.maxDate&&e>this._dateAdapter.getYear(this.maxDate)||this.minDate&&e<this._dateAdapter.getYear(this.minDate))return!1;if(!this.dateFilter)return!0;let t=this._dateAdapter.createDate(e,0,1);for(let a=t;this._dateAdapter.getYear(a)==e;a=this._dateAdapter.addCalendarDays(a,1))if(this.dateFilter(a))return!0;return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedYear(e){if(this._selectedYear.set(null),e instanceof b){let t=e.start||e.end;t&&this._selectedYear.set(this._dateAdapter.getYear(t))}else e&&this._selectedYear.set(this._dateAdapter.getYear(e))}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-multi-year-view"]],viewQuery:function(t,a){if(t&1&&H(ue,5),t&2){let i;V(i=E())&&(a._matCalendarBody=i.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",activeDateChange:"activeDateChange"},exportAs:["matMultiYearView"],decls:5,vars:7,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","rows","todayValue","startValue","endValue","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),A(3,"th",2),m()(),c(4,"tbody",3),f("selectedValueChange",function(r){return a._yearSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),m()()),t&2&&(d(4),g("rows",a._years())("todayValue",a._todayYear())("startValue",a._selectedYear())("endValue",a._selectedYear())("numCols",4)("cellAspectRatio",4/7)("activeCell",a._getActiveCell()))},dependencies:[ue],encapsulation:2,changeDetection:0})}return n})();function Da(n,o,e,t,a){let i=n.getYear(o),r=n.getYear(e),l=ya(n,t,a);return Math.floor((i-l)/M)===Math.floor((r-l)/M)}function ke(n,o,e,t){let a=n.getYear(o);return bn(a-ya(n,e,t),M)}function ya(n,o,e){let t=0;return e?t=n.getYear(e)-M+1:o&&(t=n.getYear(o)),t}function bn(n,o){return(n%o+o)%o}var _a=(()=>{class n{_changeDetectorRef=s(I);_dateFormats=s(ee,{optional:!0});_dateAdapter=s(_,{optional:!0});_dir=s(de,{optional:!0});_rerenderSubscription=x.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._dateAdapter.getYear(t)!==this._dateAdapter.getYear(this._activeDate)&&this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof b?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedMonth(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new p;monthSelected=new p;activeDateChange=new p;_matCalendarBody;_months=u([]);_yearLabel=u("");_todayMonth=u(null);_selectedMonth=u(null);constructor(){this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ie(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_monthSelected(e){let t=e.value,a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),t,1);this.monthSelected.emit(a);let i=this._getDateFromMonth(t);this.selectedChange.emit(i)}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-4);break;case 40:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,4);break;case 36:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-this._dateAdapter.getMonth(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,11-this._dateAdapter.getMonth(this._activeDate));break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-10:-1);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?10:1);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._monthSelected({value:this._dateAdapter.getMonth(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setSelectedMonth(this.selected),this._todayMonth.set(this._getMonthInCurrentYear(this._dateAdapter.today())),this._yearLabel.set(this._dateAdapter.getYearName(this.activeDate));let e=this._dateAdapter.getMonthNames("short");this._months.set([[0,1,2,3],[4,5,6,7],[8,9,10,11]].map(t=>t.map(a=>this._createCellForMonth(a,e[a])))),this._changeDetectorRef.markForCheck()}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getMonthInCurrentYear(e){return e&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(this.activeDate)?this._dateAdapter.getMonth(e):null}_getDateFromMonth(e){let t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),a=this._dateAdapter.getNumDaysInMonth(t);return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForMonth(e,t){let a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),i=this._dateAdapter.format(a,this._dateFormats.display.monthYearA11yLabel),r=this.dateClass?this.dateClass(a,"year"):void 0;return new Me(e,t.toLocaleUpperCase(),i,this._shouldEnableMonth(e),r)}_shouldEnableMonth(e){let t=this._dateAdapter.getYear(this.activeDate);if(e==null||this._isYearAndMonthAfterMaxDate(t,e)||this._isYearAndMonthBeforeMinDate(t,e))return!1;if(!this.dateFilter)return!0;let a=this._dateAdapter.createDate(t,e,1);for(let i=a;this._dateAdapter.getMonth(i)==e;i=this._dateAdapter.addCalendarDays(i,1))if(this.dateFilter(i))return!0;return!1}_isYearAndMonthAfterMaxDate(e,t){if(this.maxDate){let a=this._dateAdapter.getYear(this.maxDate),i=this._dateAdapter.getMonth(this.maxDate);return e>a||e===a&&t>i}return!1}_isYearAndMonthBeforeMinDate(e,t){if(this.minDate){let a=this._dateAdapter.getYear(this.minDate),i=this._dateAdapter.getMonth(this.minDate);return e<a||e===a&&t<i}return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedMonth(e){e instanceof b?this._selectedMonth.set(this._getMonthInCurrentYear(e.start)||this._getMonthInCurrentYear(e.end)):this._selectedMonth.set(this._getMonthInCurrentYear(e))}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-year-view"]],viewQuery:function(t,a){if(t&1&&H(ue,5),t&2){let i;V(i=E())&&(a._matCalendarBody=i.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",monthSelected:"monthSelected",activeDateChange:"activeDateChange"},exportAs:["matYearView"],decls:5,vars:9,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","label","rows","todayValue","startValue","endValue","labelMinRequiredCells","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),A(3,"th",2),m()(),c(4,"tbody",3),f("selectedValueChange",function(r){return a._monthSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),m()()),t&2&&(d(4),g("label",a._yearLabel())("rows",a._months())("todayValue",a._todayMonth())("startValue",a._selectedMonth())("endValue",a._selectedMonth())("labelMinRequiredCells",2)("numCols",4)("cellAspectRatio",4/7)("activeCell",a._dateAdapter.getMonth(a.activeDate)))},dependencies:[ue],encapsulation:2,changeDetection:0})}return n})(),Ca=(()=>{class n{_intl=s(ge);calendar=s(vt);_dateAdapter=s(_,{optional:!0});_dateFormats=s(ee,{optional:!0});_periodButtonText;_periodButtonDescription;_periodButtonLabel;_prevButtonLabel;_nextButtonLabel;constructor(){s(ne).load(se);let e=s(I);this._updateLabels(),this.calendar.stateChanges.subscribe(()=>{this._updateLabels(),e.markForCheck()})}get periodButtonText(){return this._periodButtonText}get periodButtonDescription(){return this._periodButtonDescription}get periodButtonLabel(){return this._periodButtonLabel}get prevButtonLabel(){return this._prevButtonLabel}get nextButtonLabel(){return this._nextButtonLabel}currentPeriodClicked(){this.calendar.currentView=this.calendar.currentView=="month"?"multi-year":"month"}previousClicked(){this.previousEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,-1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?-1:-M))}nextClicked(){this.nextEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?1:M))}previousEnabled(){return this.calendar.minDate?!this.calendar.minDate||!this._isSameView(this.calendar.activeDate,this.calendar.minDate):!0}nextEnabled(){return!this.calendar.maxDate||!this._isSameView(this.calendar.activeDate,this.calendar.maxDate)}_updateLabels(){let e=this.calendar,t=this._intl,a=this._dateAdapter;e.currentView==="month"?(this._periodButtonText=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonDescription=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonLabel=t.switchToMultiYearViewLabel,this._prevButtonLabel=t.prevMonthLabel,this._nextButtonLabel=t.nextMonthLabel):e.currentView==="year"?(this._periodButtonText=a.getYearName(e.activeDate),this._periodButtonDescription=a.getYearName(e.activeDate),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevYearLabel,this._nextButtonLabel=t.nextYearLabel):(this._periodButtonText=t.formatYearRange(...this._formatMinAndMaxYearLabels()),this._periodButtonDescription=t.formatYearRangeLabel(...this._formatMinAndMaxYearLabels()),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevMultiYearLabel,this._nextButtonLabel=t.nextMultiYearLabel)}_isSameView(e,t){return this.calendar.currentView=="month"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t)&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t):this.calendar.currentView=="year"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t):Da(this._dateAdapter,e,t,this.calendar.minDate,this.calendar.maxDate)}_formatMinAndMaxYearLabels(){let t=this._dateAdapter.getYear(this.calendar.activeDate)-ke(this._dateAdapter,this.calendar.activeDate,this.calendar.minDate,this.calendar.maxDate),a=t+M-1,i=this._dateAdapter.getYearName(this._dateAdapter.createDate(t,0,1)),r=this._dateAdapter.getYearName(this._dateAdapter.createDate(a,0,1));return[i,r]}_periodButtonLabelId=s(ie).getId("mat-calendar-period-label-");static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-calendar-header"]],exportAs:["matCalendarHeader"],ngContentSelectors:Xa,decls:17,vars:13,consts:[[1,"mat-calendar-header"],[1,"mat-calendar-controls"],["aria-live","polite",1,"cdk-visually-hidden",3,"id"],["matButton","","type","button",1,"mat-calendar-period-button",3,"click"],["aria-hidden","true"],["viewBox","0 0 10 5","focusable","false","aria-hidden","true",1,"mat-calendar-arrow"],["points","0,0 5,5 10,0"],[1,"mat-calendar-spacer"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-previous-button",3,"click","disabled","matTooltip"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-next-button",3,"click","disabled","matTooltip"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"]],template:function(t,a){t&1&&(G(),c(0,"div",0)(1,"div",1)(2,"span",2),D(3),m(),c(4,"button",3),f("click",function(){return a.currentPeriodClicked()}),c(5,"span",4),D(6),m(),be(),c(7,"svg",5),A(8,"polygon",6),m()(),Ue(),A(9,"div",7),P(10),c(11,"button",8),f("click",function(){return a.previousClicked()}),be(),c(12,"svg",9),A(13,"path",10),m()(),Ue(),c(14,"button",11),f("click",function(){return a.nextClicked()}),be(),c(15,"svg",9),A(16,"path",12),m()()()()),t&2&&(d(2),g("id",a._periodButtonLabelId),d(),z(a.periodButtonDescription),d(),y("aria-label",a.periodButtonLabel)("aria-describedby",a._periodButtonLabelId),d(2),z(a.periodButtonText),d(),C("mat-calendar-invert",a.calendar.currentView!=="month"),d(4),g("disabled",!a.previousEnabled())("matTooltip",a.prevButtonLabel),y("aria-label",a.prevButtonLabel),d(3),g("disabled",!a.nextEnabled())("matTooltip",a.nextButtonLabel),y("aria-label",a.nextButtonLabel))},dependencies:[it,nt,Jt],encapsulation:2,changeDetection:0})}return n})(),vt=(()=>{class n{_dateAdapter=s(_,{optional:!0});_dateFormats=s(ee,{optional:!0});_changeDetectorRef=s(I);_elementRef=s(Y);headerComponent;_calendarHeaderPortal;_intlChanges;_moveFocusOnNextTick=!1;get startAt(){return this._startAt}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_startAt=null;startView="month";get selected(){return this._selected}set selected(e){e instanceof b?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedChange=new p;yearSelected=new p;monthSelected=new p;viewChanged=new p(!0);_userSelection=new p;_userDragDrop=new p;monthView;yearView;multiYearView;get activeDate(){return this._clampedActiveDate}set activeDate(e){this._clampedActiveDate=this._dateAdapter.clampDate(e,this.minDate,this.maxDate),this.stateChanges.next(),this._changeDetectorRef.markForCheck()}_clampedActiveDate;get currentView(){return this._currentView}set currentView(e){let t=this._currentView!==e?e:null;this._currentView=e,this._moveFocusOnNextTick=!0,this._changeDetectorRef.markForCheck(),t&&(this.stateChanges.next(),this.viewChanged.emit(t))}_currentView;_activeDrag=null;stateChanges=new S;constructor(){this._intlChanges=s(ge).changes.subscribe(()=>{this._changeDetectorRef.markForCheck(),this.stateChanges.next()})}ngAfterContentInit(){this._calendarHeaderPortal=new rt(this.headerComponent||Ca),this.activeDate=this.startAt||this._dateAdapter.today(),this._currentView=this.startView}ngAfterViewChecked(){this._moveFocusOnNextTick&&(this._moveFocusOnNextTick=!1,this.focusActiveCell())}ngOnDestroy(){this._intlChanges.unsubscribe(),this.stateChanges.complete()}ngOnChanges(e){let t=e.minDate&&!this._dateAdapter.sameDate(e.minDate.previousValue,e.minDate.currentValue)?e.minDate:void 0,a=e.maxDate&&!this._dateAdapter.sameDate(e.maxDate.previousValue,e.maxDate.currentValue)?e.maxDate:void 0,i=t||a||e.dateFilter;if(i&&!i.firstChange){let r=this._getCurrentViewComponent();r&&(this._elementRef.nativeElement.contains(tt())&&(this._moveFocusOnNextTick=!0),this._changeDetectorRef.detectChanges(),r._init())}this.stateChanges.next()}focusActiveCell(){this._getCurrentViewComponent()?._focusActiveCell(!1)}updateTodaysDate(){this._getCurrentViewComponent()?._init()}_dateSelected(e){let t=e.value;(this.selected instanceof b||t&&!this._dateAdapter.sameDate(t,this.selected))&&this.selectedChange.emit(t),this._userSelection.emit(e)}_yearSelectedInMultiYearView(e){this.yearSelected.emit(e)}_monthSelectedInYearView(e){this.monthSelected.emit(e)}_goToDateInView(e,t){this.activeDate=e,this.currentView=t}_dragStarted(e){this._activeDrag=e}_dragEnded(e){this._activeDrag&&(e.value&&this._userDragDrop.emit(e),this._activeDrag=null)}_getCurrentViewComponent(){return this.monthView||this.yearView||this.multiYearView}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-calendar"]],viewQuery:function(t,a){if(t&1&&H(ua,5)(_a,5)(ha,5),t&2){let i;V(i=E())&&(a.monthView=i.first),V(i=E())&&(a.yearView=i.first),V(i=E())&&(a.multiYearView=i.first)}},hostAttrs:[1,"mat-calendar"],inputs:{headerComponent:"headerComponent",startAt:"startAt",startView:"startView",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",_userSelection:"_userSelection",_userDragDrop:"_userDragDrop"},exportAs:["matCalendar"],features:[j([va]),Q],decls:5,vars:2,consts:[[3,"cdkPortalOutlet"],["cdkMonitorSubtreeFocus","","tabindex","-1",1,"mat-calendar-content"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","_userSelection","dragStarted","dragEnded","activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDateChange","monthSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","yearSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"]],template:function(t,a){if(t&1&&(Je(0,Ja,0,0,"ng-template",0),c(1,"div",1),L(2,en,1,11,"mat-month-view",2)(3,tn,1,6,"mat-year-view",3)(4,an,1,6,"mat-multi-year-view",3),m()),t&2){let i;g("cdkPortalOutlet",a._calendarHeaderPortal),d(2),B((i=a.currentView)==="month"?2:i==="year"?3:i==="multi-year"?4:-1)}},dependencies:[ot,at,ua,_a,ha],styles:[`.mat-calendar {
  display: block;
  line-height: normal;
  font-family: var(--mat-datepicker-calendar-text-font, var(--mat-sys-body-medium-font));
  font-size: var(--mat-datepicker-calendar-text-size, var(--mat-sys-body-medium-size));
}

.mat-calendar-header {
  padding: 8px 8px 0 8px;
}

.mat-calendar-content {
  padding: 0 8px 8px 8px;
  outline: none;
}

.mat-calendar-controls {
  display: flex;
  align-items: center;
  margin: 5% calc(4.7142857143% - 16px);
}

.mat-calendar-spacer {
  flex: 1 1 auto;
}

.mat-calendar-period-button {
  min-width: 0;
  margin: 0 8px;
  font-size: var(--mat-datepicker-calendar-period-button-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-period-button-text-weight, var(--mat-sys-title-small-weight));
  --mat-button-text-label-text-color: var(--mat-datepicker-calendar-period-button-text-color, var(--mat-sys-on-surface-variant));
}

.mat-calendar-arrow {
  display: inline-block;
  width: 10px;
  height: 5px;
  margin: 0 0 0 5px;
  vertical-align: middle;
  fill: var(--mat-datepicker-calendar-period-button-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-calendar-arrow.mat-calendar-invert {
  transform: rotate(180deg);
}
[dir=rtl] .mat-calendar-arrow {
  margin: 0 5px 0 0;
}
@media (forced-colors: active) {
  .mat-calendar-arrow {
    fill: CanvasText;
  }
}

.mat-datepicker-content .mat-calendar-previous-button:not(.mat-mdc-button-disabled),
.mat-datepicker-content .mat-calendar-next-button:not(.mat-mdc-button-disabled) {
  color: var(--mat-datepicker-calendar-navigation-button-icon-color, var(--mat-sys-on-surface-variant));
}
[dir=rtl] .mat-calendar-previous-button,
[dir=rtl] .mat-calendar-next-button {
  transform: rotate(180deg);
}

.mat-calendar-table {
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
}

.mat-calendar-table-header th {
  text-align: center;
  padding: 0 0 8px 0;
  color: var(--mat-datepicker-calendar-header-text-color, var(--mat-sys-on-surface-variant));
  font-size: var(--mat-datepicker-calendar-header-text-size, var(--mat-sys-title-small-size));
  font-weight: var(--mat-datepicker-calendar-header-text-weight, var(--mat-sys-title-small-weight));
}

.mat-calendar-table-header-divider {
  position: relative;
  height: 1px;
}
.mat-calendar-table-header-divider::after {
  content: "";
  position: absolute;
  top: 0;
  left: -8px;
  right: -8px;
  height: 1px;
  background: var(--mat-datepicker-calendar-header-divider-color, transparent);
}

.mat-calendar-body-cell-content::before {
  margin: calc(calc(var(--mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-calendar-body-cell:focus-visible .mat-focus-indicator::before {
  content: "";
}
`],encapsulation:2,changeDetection:0})}return n})(),vn=new N("mat-datepicker-scroll-strategy",{providedIn:"root",factory:()=>{let n=s(ve);return()=>qt(n)}}),wa=(()=>{class n{_elementRef=s(Y);_animationsDisabled=Ce();_changeDetectorRef=s(I);_globalModel=s(te);_dateAdapter=s(_);_ngZone=s(Ge);_rangeSelectionStrategy=s(Ke,{optional:!0});_stateChanges;_model;_eventCleanups;_animationFallback;_calendar;color;datepicker;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;_isAbove=!1;_animationDone=new S;_isAnimating=!1;_closeButtonText;_closeButtonFocused=!1;_actionsPortal=null;_dialogLabelId=null;constructor(){if(s(ne).load(se),this._closeButtonText=s(ge).closeCalendarLabel,!this._animationsDisabled){let e=this._elementRef.nativeElement,t=s(Xe);this._eventCleanups=this._ngZone.runOutsideAngular(()=>[t.listen(e,"animationstart",this._handleAnimationEvent),t.listen(e,"animationend",this._handleAnimationEvent),t.listen(e,"animationcancel",this._handleAnimationEvent)])}}ngAfterViewInit(){this._stateChanges=this.datepicker.stateChanges.subscribe(()=>{this._changeDetectorRef.markForCheck()}),this._calendar.focusActiveCell()}ngOnDestroy(){clearTimeout(this._animationFallback),this._eventCleanups?.forEach(e=>e()),this._stateChanges?.unsubscribe(),this._animationDone.complete()}_handleUserSelection(e){let t=this._model.selection,a=e.value,i=t instanceof b;if(i&&this._rangeSelectionStrategy){let r=this._rangeSelectionStrategy.selectionFinished(a,t,e.event);this._model.updateSelection(r,this)}else a&&(i||!this._dateAdapter.sameDate(a,t))&&this._model.add(a);(!this._model||this._model.isComplete())&&!this._actionsPortal&&this.datepicker.close()}_handleUserDragDrop(e){this._model.updateSelection(e.value,this)}_startExitAnimation(){this._elementRef.nativeElement.classList.add("mat-datepicker-content-exit"),this._animationsDisabled?this._animationDone.next():(clearTimeout(this._animationFallback),this._animationFallback=setTimeout(()=>{this._isAnimating||this._animationDone.next()},200))}_handleAnimationEvent=e=>{let t=this._elementRef.nativeElement;e.target!==t||!e.animationName.startsWith("_mat-datepicker-content")||(clearTimeout(this._animationFallback),this._isAnimating=e.type==="animationstart",t.classList.toggle("mat-datepicker-content-animating",this._isAnimating),this._isAnimating||this._animationDone.next())};_getSelected(){return this._model.selection}_applyPendingSelection(){this._model!==this._globalModel&&this._globalModel.updateSelection(this._model.selection,this)}_assignActions(e,t){this._model=e?this._globalModel.clone():this._globalModel,this._actionsPortal=e,t&&this._changeDetectorRef.detectChanges()}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-datepicker-content"]],viewQuery:function(t,a){if(t&1&&H(vt,5),t&2){let i;V(i=E())&&(a._calendar=i.first)}},hostAttrs:[1,"mat-datepicker-content"],hostVars:6,hostBindings:function(t,a){t&2&&(Pe(a.color?"mat-"+a.color:""),C("mat-datepicker-content-touch",a.datepicker.touchUi)("mat-datepicker-content-animations-enabled",!a._animationsDisabled))},inputs:{color:"color"},exportAs:["matDatepickerContent"],decls:5,vars:26,consts:[["cdkTrapFocus","","role","dialog",1,"mat-datepicker-content-container"],[3,"yearSelected","monthSelected","viewChanged","_userSelection","_userDragDrop","id","startAt","startView","minDate","maxDate","dateFilter","headerComponent","selected","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName"],[3,"cdkPortalOutlet"],["type","button","matButton","elevated",1,"mat-datepicker-close-button",3,"focus","blur","click","color"]],template:function(t,a){t&1&&(c(0,"div",0)(1,"mat-calendar",1),f("yearSelected",function(r){return a.datepicker._selectYear(r)})("monthSelected",function(r){return a.datepicker._selectMonth(r)})("viewChanged",function(r){return a.datepicker._viewChanged(r)})("_userSelection",function(r){return a._handleUserSelection(r)})("_userDragDrop",function(r){return a._handleUserDragDrop(r)}),m(),Je(2,nn,0,0,"ng-template",2),c(3,"button",3),f("focus",function(){return a._closeButtonFocused=!0})("blur",function(){return a._closeButtonFocused=!1})("click",function(){return a.datepicker.close()}),D(4),m()()),t&2&&(C("mat-datepicker-content-container-with-custom-header",a.datepicker.calendarHeaderComponent)("mat-datepicker-content-container-with-actions",a._actionsPortal),y("aria-modal",!0)("aria-labelledby",a._dialogLabelId??void 0),d(),Pe(a.datepicker.panelClass),g("id",a.datepicker.id)("startAt",a.datepicker.startAt)("startView",a.datepicker.startView)("minDate",a.datepicker._getMinDate())("maxDate",a.datepicker._getMaxDate())("dateFilter",a.datepicker._getDateFilter())("headerComponent",a.datepicker.calendarHeaderComponent)("selected",a._getSelected())("dateClass",a.datepicker.dateClass)("comparisonStart",a.comparisonStart)("comparisonEnd",a.comparisonEnd)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName),d(),g("cdkPortalOutlet",a._actionsPortal),d(),C("cdk-visually-hidden",!a._closeButtonFocused),g("color",a.color||"primary"),d(),z(a._closeButtonText))},dependencies:[Nt,vt,ot,it],styles:[`@keyframes _mat-datepicker-content-dropdown-enter {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-datepicker-content-dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-datepicker-content-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-datepicker-content {
  display: block;
  background-color: var(--mat-datepicker-calendar-container-background-color, var(--mat-sys-surface-container-high));
  color: var(--mat-datepicker-calendar-container-text-color, var(--mat-sys-on-surface));
  box-shadow: var(--mat-datepicker-calendar-container-elevation-shadow, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12));
  border-radius: var(--mat-datepicker-calendar-container-shape, var(--mat-sys-corner-large));
}
.mat-datepicker-content.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-dropdown-enter 120ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-datepicker-content .mat-calendar {
  width: 296px;
  height: 354px;
}
.mat-datepicker-content .mat-datepicker-content-container-with-custom-header .mat-calendar {
  height: auto;
}
.mat-datepicker-content .mat-datepicker-close-button {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
}
.mat-datepicker-content-animating .mat-datepicker-content .mat-datepicker-close-button {
  display: none;
}

.mat-datepicker-content-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mat-datepicker-content-touch {
  display: block;
  max-height: 80vh;
  box-shadow: var(--mat-datepicker-calendar-container-touch-elevation-shadow, 0px 0px 0px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12));
  border-radius: var(--mat-datepicker-calendar-container-touch-shape, var(--mat-sys-corner-extra-large));
  position: relative;
  overflow: visible;
  min-height: fit-content;
}
.mat-datepicker-content-touch.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-dialog-enter 150ms cubic-bezier(0, 0, 0.2, 1);
}
.mat-datepicker-content-touch .mat-datepicker-content-container {
  min-height: 312px;
  max-height: 788px;
  min-width: 250px;
  max-width: 750px;
}
.mat-datepicker-content-touch .mat-calendar {
  width: 100%;
  height: auto;
}

.mat-datepicker-content-exit.mat-datepicker-content-animations-enabled {
  animation: _mat-datepicker-content-exit 100ms linear;
}

@media all and (orientation: landscape) {
  .mat-datepicker-content-touch .mat-datepicker-content-container {
    width: 64vh;
    height: 80vh;
  }
}
@media all and (orientation: portrait) {
  .mat-datepicker-content-touch .mat-datepicker-content-container {
    width: 80vw;
    height: 100vw;
  }
  .mat-datepicker-content-touch .mat-datepicker-content-container-with-actions {
    height: 115vw;
  }
}
`],encapsulation:2,changeDetection:0})}return n})(),We=(()=>{class n{_injector=s(ve);_viewContainerRef=s(Vt);_dateAdapter=s(_,{optional:!0});_dir=s(de,{optional:!0});_model=s(te);_animationsDisabled=Ce();_scrollStrategy=s(vn);_inputStateChanges=x.EMPTY;_document=s(xt);calendarHeaderComponent;get startAt(){return this._startAt||(this.datepickerInput?this.datepickerInput.getStartValue():null)}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_startAt=null;startView="month";get color(){return this._color||(this.datepickerInput?this.datepickerInput.getThemePalette():void 0)}set color(e){this._color=e}_color;touchUi=!1;get disabled(){return this._disabled===void 0&&this.datepickerInput?this.datepickerInput.disabled:!!this._disabled}set disabled(e){e!==this._disabled&&(this._disabled=e,this.stateChanges.next(void 0))}_disabled;xPosition="start";yPosition="below";restoreFocus=!0;yearSelected=new p;monthSelected=new p;viewChanged=new p(!0);dateClass;openedStream=new p;closedStream=new p;get panelClass(){return this._panelClass}set panelClass(e){this._panelClass=Lt(e)}_panelClass;get opened(){return this._opened}set opened(e){e?this.open():this.close()}_opened=!1;id=s(ie).getId("mat-datepicker-");_getMinDate(){return this.datepickerInput&&this.datepickerInput.min}_getMaxDate(){return this.datepickerInput&&this.datepickerInput.max}_getDateFilter(){return this.datepickerInput&&this.datepickerInput.dateFilter}_overlayRef=null;_componentRef=null;_focusedElementBeforeOpen=null;_backdropHarnessClass=`${this.id}-backdrop`;_actionsPortal=null;datepickerInput;stateChanges=new S;_changeDetectorRef=s(I);constructor(){this._dateAdapter,this._model.selectionChanged.subscribe(()=>{this._changeDetectorRef.markForCheck()})}ngOnChanges(e){let t=e.xPosition||e.yPosition;if(t&&!t.firstChange&&this._overlayRef){let a=this._overlayRef.getConfig().positionStrategy;a instanceof Ut&&(this._setConnectedPositions(a),this.opened&&this._overlayRef.updatePosition())}this.stateChanges.next(void 0)}ngOnDestroy(){this._destroyOverlay(),this.close(),this._inputStateChanges.unsubscribe(),this.stateChanges.complete()}select(e){this._model.add(e)}_selectYear(e){this.yearSelected.emit(e)}_selectMonth(e){this.monthSelected.emit(e)}_viewChanged(e){this.viewChanged.emit(e)}registerInput(e){return this.datepickerInput,this._inputStateChanges.unsubscribe(),this.datepickerInput=e,this._inputStateChanges=e.stateChanges.subscribe(()=>this.stateChanges.next(void 0)),this._model}registerActions(e){this._actionsPortal,this._actionsPortal=e,this._componentRef?.instance._assignActions(e,!0)}removeActions(e){e===this._actionsPortal&&(this._actionsPortal=null,this._componentRef?.instance._assignActions(null,!0))}open(){this._opened||this.disabled||this._componentRef?.instance._isAnimating||(this.datepickerInput,this._focusedElementBeforeOpen=tt(),this._openOverlay(),this._opened=!0,this.openedStream.emit())}close(){if(!this._opened||this._componentRef?.instance._isAnimating)return;let e=this.restoreFocus&&this._focusedElementBeforeOpen&&typeof this._focusedElementBeforeOpen.focus=="function",t=()=>{this._opened&&(this._opened=!1,this.closedStream.emit())};if(this._componentRef){let{instance:a,location:i}=this._componentRef;a._animationDone.pipe(Mt(1)).subscribe(()=>{let r=this._document.activeElement;e&&(!r||r===this._document.activeElement||i.nativeElement.contains(r))&&this._focusedElementBeforeOpen.focus(),this._focusedElementBeforeOpen=null,this._destroyOverlay()}),a._startExitAnimation()}e?setTimeout(t):t()}_applyPendingSelection(){this._componentRef?.instance?._applyPendingSelection()}_forwardContentValues(e){e.datepicker=this,e.color=this.color,e._dialogLabelId=this.datepickerInput.getOverlayLabelId(),e._assignActions(this._actionsPortal,!1)}_openOverlay(){this._destroyOverlay();let e=this.touchUi,t=new rt(wa,this._viewContainerRef),a=this._overlayRef=Zt(this._injector,new Qt({positionStrategy:e?this._getDialogStrategy():this._getDropdownStrategy(),hasBackdrop:!0,backdropClass:[e?"cdk-overlay-dark-backdrop":"mat-overlay-transparent-backdrop",this._backdropHarnessClass],direction:this._dir||"ltr",scrollStrategy:e?Wt(this._injector):this._scrollStrategy(),panelClass:`mat-datepicker-${e?"dialog":"popup"}`,disableAnimations:this._animationsDisabled}));this._getCloseStream(a).subscribe(i=>{i&&i.preventDefault(),this.close()}),a.keydownEvents().subscribe(i=>{let r=i.keyCode;(r===38||r===40||r===37||r===39||r===33||r===34)&&i.preventDefault()}),this._componentRef=a.attach(t),this._forwardContentValues(this._componentRef.instance),e||Ze(()=>{a.updatePosition()},{injector:this._injector})}_destroyOverlay(){this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=this._componentRef=null)}_getDialogStrategy(){return Gt(this._injector).centerHorizontally().centerVertically()}_getDropdownStrategy(){let e=$t(this._injector,this.datepickerInput.getConnectedOverlayOrigin()).withTransformOriginOn(".mat-datepicker-content").withFlexibleDimensions(!1).withViewportMargin(8).withLockedPosition();return this._setConnectedPositions(e)}_setConnectedPositions(e){let t=this.xPosition==="end"?"end":"start",a=t==="start"?"end":"start",i=this.yPosition==="above"?"bottom":"top",r=i==="top"?"bottom":"top";return e.withPositions([{originX:t,originY:r,overlayX:t,overlayY:i},{originX:t,originY:i,overlayX:t,overlayY:r},{originX:a,originY:r,overlayX:a,overlayY:i},{originX:a,originY:i,overlayX:a,overlayY:r}])}_getCloseStream(e){let t=["ctrlKey","shiftKey","metaKey"];return fe(e.backdropClick(),e.detachments(),e.keydownEvents().pipe(At(a=>a.keyCode===27&&!K(a)||this.datepickerInput&&K(a,"altKey")&&a.keyCode===38&&t.every(i=>!K(a,i)))))}static \u0275fac=function(t){return new(t||n)};static \u0275dir=U({type:n,inputs:{calendarHeaderComponent:"calendarHeaderComponent",startAt:"startAt",startView:"startView",color:"color",touchUi:[2,"touchUi","touchUi",O],disabled:[2,"disabled","disabled",O],xPosition:"xPosition",yPosition:"yPosition",restoreFocus:[2,"restoreFocus","restoreFocus",O],dateClass:"dateClass",panelClass:"panelClass",opened:[2,"opened","opened",O]},outputs:{yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",openedStream:"opened",closedStream:"closed"},features:[Q]})}return n})(),Zi=(()=>{class n extends We{static \u0275fac=(()=>{let e;return function(a){return(e||(e=De(n)))(a||n)}})();static \u0275cmp=v({type:n,selectors:[["mat-datepicker"]],exportAs:["matDatepicker"],features:[j([va,{provide:We,useExisting:n}]),ae],decls:0,vars:0,template:function(t,a){},encapsulation:2,changeDetection:0})}return n})(),me=class{target;targetElement;value=null;constructor(o,e){this.target=o,this.targetElement=e,this.value=this.target.value}},ka=(()=>{class n{_elementRef=s(Y);_dateAdapter=s(_,{optional:!0});_dateFormats=s(ee,{optional:!0});_isInitialized=!1;get value(){return this._model?this._getValueFromModel(this._model.selection):this._pendingValue}set value(e){this._assignValueProgrammatically(e,!0)}_model;get disabled(){return!!this._disabled||this._parentDisabled()}set disabled(e){let t=e,a=this._elementRef.nativeElement;this._disabled!==t&&(this._disabled=t,this.stateChanges.next(void 0)),t&&this._isInitialized&&a.blur&&a.blur()}_disabled;dateChange=new p;dateInput=new p;stateChanges=new S;_onTouched=()=>{};_validatorOnChange=()=>{};_cvaOnChange=()=>{};_valueChangesSubscription=x.EMPTY;_localeSubscription=x.EMPTY;_pendingValue=null;_parseValidator=()=>this._lastValueValid?null:{matDatepickerParse:{text:this._elementRef.nativeElement.value}};_filterValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value));return!t||this._matchesFilter(t)?null:{matDatepickerFilter:!0}};_minValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._getMinDate();return!a||!t||this._dateAdapter.compareDate(a,t)<=0?null:{matDatepickerMin:{min:a,actual:t}}};_maxValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._getMaxDate();return!a||!t||this._dateAdapter.compareDate(a,t)>=0?null:{matDatepickerMax:{max:a,actual:t}}};_getValidators(){return[this._parseValidator,this._minValidator,this._maxValidator,this._filterValidator]}_registerModel(e){this._model=e,this._valueChangesSubscription.unsubscribe(),this._pendingValue&&this._assignValue(this._pendingValue),this._valueChangesSubscription=this._model.selectionChanged.subscribe(t=>{if(this._shouldHandleChangeEvent(t)){let a=this._getValueFromModel(t.selection);this._lastValueValid=this._isValidValue(a),this._cvaOnChange(a),this._onTouched(),this._formatValue(a),this.dateInput.emit(new me(this,this._elementRef.nativeElement)),this.dateChange.emit(new me(this,this._elementRef.nativeElement))}})}_lastValueValid=!1;constructor(){this._localeSubscription=this._dateAdapter.localeChanges.subscribe(()=>{this._assignValueProgrammatically(this.value,!0)})}ngAfterViewInit(){this._isInitialized=!0}ngOnChanges(e){Aa(e,this._dateAdapter)&&this.stateChanges.next(void 0)}ngOnDestroy(){this._valueChangesSubscription.unsubscribe(),this._localeSubscription.unsubscribe(),this.stateChanges.complete()}registerOnValidatorChange(e){this._validatorOnChange=e}validate(e){return this._validator?this._validator(e):null}writeValue(e){this._assignValueProgrammatically(e,e!==this.value)}registerOnChange(e){this._cvaOnChange=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this.disabled=e}_onKeydown(e){let t=["ctrlKey","shiftKey","metaKey"];K(e,"altKey")&&e.keyCode===40&&t.every(i=>!K(e,i))&&!this._elementRef.nativeElement.readOnly&&(this._openPopup(),e.preventDefault())}_onInput(e){let t=e.target.value,a=this._lastValueValid,i=this._dateAdapter.parse(t,this._dateFormats.parse.dateInput);this._lastValueValid=this._isValidValue(i),i=this._dateAdapter.getValidDateOrNull(i);let r=!this._dateAdapter.sameDate(i,this.value);!i||r?this._cvaOnChange(i):(t&&!this.value&&this._cvaOnChange(i),a!==this._lastValueValid&&this._validatorOnChange()),r&&(this._assignValue(i),this.dateInput.emit(new me(this,this._elementRef.nativeElement)))}_onChange(){this.dateChange.emit(new me(this,this._elementRef.nativeElement))}_onBlur(){this.value&&this._formatValue(this.value),this._onTouched()}_formatValue(e){this._elementRef.nativeElement.value=e!=null?this._dateAdapter.format(e,this._dateFormats.display.dateInput):""}_assignValue(e){this._model?(this._assignValueToModel(e),this._pendingValue=null):this._pendingValue=e}_isValidValue(e){return!e||this._dateAdapter.isValid(e)}_parentDisabled(){return!1}_assignValueProgrammatically(e,t){e=this._dateAdapter.deserialize(e),this._lastValueValid=this._isValidValue(e),e=this._dateAdapter.getValidDateOrNull(e),this._assignValue(e),t&&this._formatValue(e)}_matchesFilter(e){let t=this._getDateFilter();return!t||t(e)}static \u0275fac=function(t){return new(t||n)};static \u0275dir=U({type:n,inputs:{value:"value",disabled:[2,"disabled","disabled",O]},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[Q]})}return n})();function Aa(n,o){let e=Object.keys(n);for(let t of e){let{previousValue:a,currentValue:i}=n[t];if(o.isDateInstance(a)&&o.isDateInstance(i)){if(!o.sameDate(a,i))return!0}else return!0}return!1}var Dn={provide:He,useExisting:$e(()=>Ma),multi:!0},yn={provide:ze,useExisting:$e(()=>Ma),multi:!0},Ma=(()=>{class n extends ka{_formField=s(st,{optional:!0});_closedSubscription=x.EMPTY;_openedSubscription=x.EMPTY;set matDatepicker(e){e&&(this._datepicker=e,this._ariaOwns.set(e.opened?e.id:null),this._closedSubscription=e.closedStream.subscribe(()=>{this._onTouched(),this._ariaOwns.set(null)}),this._openedSubscription=e.openedStream.subscribe(()=>{this._ariaOwns.set(e.id)}),this._registerModel(e.registerInput(this)))}_datepicker;_ariaOwns=u(null);get min(){return this._min}set min(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._min)||(this._min=t,this._validatorOnChange())}_min=null;get max(){return this._max}set max(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._max)||(this._max=t,this._validatorOnChange())}_max=null;get dateFilter(){return this._dateFilter}set dateFilter(e){let t=this._matchesFilter(this.value);this._dateFilter=e,this._matchesFilter(this.value)!==t&&this._validatorOnChange()}_dateFilter;_validator=null;constructor(){super(),this._validator=we.compose(super._getValidators())}getConnectedOverlayOrigin(){return this._formField?this._formField.getConnectedOverlayOrigin():this._elementRef}getOverlayLabelId(){return this._formField?this._formField.getLabelId():this._elementRef.nativeElement.getAttribute("aria-labelledby")}getThemePalette(){return this._formField?this._formField.color:void 0}getStartValue(){return this.value}ngOnDestroy(){super.ngOnDestroy(),this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe()}_openPopup(){this._datepicker&&this._datepicker.open()}_getValueFromModel(e){return e}_assignValueToModel(e){this._model&&this._model.updateSelection(e,this)}_getMinDate(){return this._min}_getMaxDate(){return this._max}_getDateFilter(){return this._dateFilter}_shouldHandleChangeEvent(e){return e.source!==this}static \u0275fac=function(t){return new(t||n)};static \u0275dir=U({type:n,selectors:[["input","matDatepicker",""]],hostAttrs:[1,"mat-datepicker-input"],hostVars:6,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("blur",function(){return a._onBlur()})("keydown",function(r){return a._onKeydown(r)}),t&2&&(R("disabled",a.disabled),y("aria-haspopup",a._datepicker?"dialog":null)("aria-owns",a._ariaOwns())("min",a.min?a._dateAdapter.toIso8601(a.min):null)("max",a.max?a._dateAdapter.toIso8601(a.max):null)("data-mat-calendar",a._datepicker?a._datepicker.id:null))},inputs:{matDatepicker:"matDatepicker",min:"min",max:"max",dateFilter:[0,"matDatepickerFilter","dateFilter"]},exportAs:["matDatepickerInput"],features:[j([Dn,yn,{provide:ra,useExisting:n}]),ae]})}return n})(),Cn=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275dir=U({type:n,selectors:[["","matDatepickerToggleIcon",""]]})}return n})(),wn=(()=>{class n{_intl=s(ge);_changeDetectorRef=s(I);_stateChanges=x.EMPTY;datepicker;tabIndex=null;ariaLabel;get disabled(){return this._disabled===void 0&&this.datepicker?this.datepicker.disabled:!!this._disabled}set disabled(e){this._disabled=e}_disabled;disableRipple=!1;_customIcon;_button;constructor(){let e=s(new Ot("tabindex"),{optional:!0}),t=Number(e);this.tabIndex=t||t===0?t:null}ngOnChanges(e){e.datepicker&&this._watchStateChanges()}ngOnDestroy(){this._stateChanges.unsubscribe()}ngAfterContentInit(){this._watchStateChanges()}_open(e){this.datepicker&&!this.disabled&&(this.datepicker.open(),e.stopPropagation())}_watchStateChanges(){let e=this.datepicker?this.datepicker.stateChanges:Ee(),t=this.datepicker&&this.datepicker.datepickerInput?this.datepicker.datepickerInput.stateChanges:Ee(),a=this.datepicker?fe(this.datepicker.openedStream,this.datepicker.closedStream):Ee();this._stateChanges.unsubscribe(),this._stateChanges=fe(this._intl.changes,e,t,a).subscribe(()=>this._changeDetectorRef.markForCheck())}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-datepicker-toggle"]],contentQueries:function(t,a,i){if(t&1&&Tt(i,Cn,5),t&2){let r;V(r=E())&&(a._customIcon=r.first)}},viewQuery:function(t,a){if(t&1&&H(rn,5),t&2){let i;V(i=E())&&(a._button=i.first)}},hostAttrs:[1,"mat-datepicker-toggle"],hostVars:8,hostBindings:function(t,a){t&1&&f("click",function(r){return a._open(r)}),t&2&&(y("tabindex",null)("data-mat-calendar",a.datepicker?a.datepicker.id:null),C("mat-datepicker-toggle-active",a.datepicker&&a.datepicker.opened)("mat-accent",a.datepicker&&a.datepicker.color==="accent")("mat-warn",a.datepicker&&a.datepicker.color==="warn"))},inputs:{datepicker:[0,"for","datepicker"],tabIndex:"tabIndex",ariaLabel:[0,"aria-label","ariaLabel"],disabled:[2,"disabled","disabled",O],disableRipple:"disableRipple"},exportAs:["matDatepickerToggle"],features:[Q],ngContentSelectors:sn,decls:4,vars:7,consts:[["button",""],["matIconButton","","type","button",3,"tabIndex","disabled","disableRipple"],["viewBox","0 0 24 24","width","24px","height","24px","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-datepicker-toggle-default-icon"],["d","M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"]],template:function(t,a){t&1&&(G(on),c(0,"button",1,0),L(2,dn,2,0,":svg:svg",2),P(3),m()),t&2&&(g("tabIndex",a.disabled?-1:a.tabIndex)("disabled",a.disabled)("disableRipple",a.disableRipple),y("aria-haspopup",a.datepicker?"dialog":null)("aria-label",a.ariaLabel||a._intl.openCalendarLabel)("aria-expanded",a.datepicker?a.datepicker.opened:null),d(2),B(a._customIcon?-1:2))},dependencies:[nt],styles:[`.mat-datepicker-toggle {
  pointer-events: auto;
  color: var(--mat-datepicker-toggle-icon-color, var(--mat-sys-on-surface-variant));
}
.mat-datepicker-toggle button {
  color: inherit;
}

.mat-datepicker-toggle-active {
  color: var(--mat-datepicker-toggle-active-state-icon-color, var(--mat-sys-primary));
}

@media (forced-colors: active) {
  .mat-datepicker-toggle-default-icon {
    color: CanvasText;
  }
}
`],encapsulation:2,changeDetection:0})}return n})(),kn=(()=>{class n{_changeDetectorRef=s(I);_elementRef=s(Y);_dateAdapter=s(_,{optional:!0});_formField=s(st,{optional:!0});_closedSubscription=x.EMPTY;_openedSubscription=x.EMPTY;_startInput;_endInput;get value(){return this._model?this._model.selection:null}id=s(ie).getId("mat-date-range-input-");focused=!1;get shouldLabelFloat(){return this.focused||!this.empty}controlType="mat-date-range-input";get placeholder(){let e=this._startInput?._getPlaceholder()||"",t=this._endInput?._getPlaceholder()||"";return e||t?`${e} ${this.separator} ${t}`:""}get rangePicker(){return this._rangePicker}set rangePicker(e){e&&(this._model=e.registerInput(this),this._rangePicker=e,this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe(),this._ariaOwns.set(this.rangePicker.opened?e.id:null),this._closedSubscription=e.closedStream.subscribe(()=>{this._startInput?._onTouched(),this._endInput?._onTouched(),this._ariaOwns.set(null)}),this._openedSubscription=e.openedStream.subscribe(()=>{this._ariaOwns.set(e.id)}),this._registerModel(this._model))}_rangePicker;_ariaOwns=u(null);get required(){return this._required??(this._isTargetRequired(this)||this._isTargetRequired(this._startInput)||this._isTargetRequired(this._endInput))??!1}set required(e){this._required=e}_required;get dateFilter(){return this._dateFilter}set dateFilter(e){let t=this._startInput,a=this._endInput,i=t&&t._matchesFilter(t.value),r=a&&a._matchesFilter(t.value);this._dateFilter=e,t&&t._matchesFilter(t.value)!==i&&t._validatorOnChange(),a&&a._matchesFilter(a.value)!==r&&a._validatorOnChange()}_dateFilter;get min(){return this._min}set min(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._min)||(this._min=t,this._revalidate())}_min=null;get max(){return this._max}set max(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._max)||(this._max=t,this._revalidate())}_max=null;get disabled(){return this._startInput&&this._endInput?this._startInput.disabled&&this._endInput.disabled:this._groupDisabled}set disabled(e){e!==this._groupDisabled&&(this._groupDisabled=e,this.stateChanges.next(void 0))}_groupDisabled=!1;get errorState(){return this._startInput&&this._endInput?this._startInput.errorState||this._endInput.errorState:!1}get empty(){let e=this._startInput?this._startInput.isEmpty():!1,t=this._endInput?this._endInput.isEmpty():!1;return e&&t}_ariaDescribedBy=null;_model;separator="\u2013";comparisonStart=null;comparisonEnd=null;ngControl;stateChanges=new S;disableAutomaticLabeling=!0;constructor(){this._dateAdapter,this._formField?._elementRef.nativeElement.classList.contains("mat-mdc-form-field")&&this._elementRef.nativeElement.classList.add("mat-mdc-input-element","mat-mdc-form-field-input-control","mdc-text-field__input"),this.ngControl=s(ta,{optional:!0,self:!0})}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){this._ariaDescribedBy=e.length?e.join(" "):null}onContainerClick(){!this.focused&&!this.disabled&&(!this._model||!this._model.selection.start?this._startInput.focus():this._endInput.focus())}ngAfterContentInit(){this._model&&this._registerModel(this._model),fe(this._startInput.stateChanges,this._endInput.stateChanges).subscribe(()=>{this.stateChanges.next(void 0)})}ngOnChanges(e){Aa(e,this._dateAdapter)&&this.stateChanges.next(void 0)}ngOnDestroy(){this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe(),this.stateChanges.complete()}getStartValue(){return this.value?this.value.start:null}getThemePalette(){return this._formField?this._formField.color:void 0}getConnectedOverlayOrigin(){return this._formField?this._formField.getConnectedOverlayOrigin():this._elementRef}getOverlayLabelId(){return this._formField?this._formField.getLabelId():null}_getInputMirrorValue(e){let t=e==="start"?this._startInput:this._endInput;return t?t.getMirrorValue():""}_shouldHidePlaceholders(){return this._startInput?!this._startInput.isEmpty():!1}_handleChildValueChange(){this.stateChanges.next(void 0),this._changeDetectorRef.markForCheck()}_openDatepicker(){this._rangePicker&&this._rangePicker.open()}_shouldHideSeparator(){return(!this._formField||this._formField.getLabelId()&&!this._formField._shouldLabelFloat())&&this.empty}_getAriaLabelledby(){let e=this._formField;return e&&e._hasFloatingLabel()?e._labelId:null}_getStartDateAccessibleName(){return this._startInput._getAccessibleName()}_getEndDateAccessibleName(){return this._endInput._getAccessibleName()}_updateFocus(e){this.focused=e!==null,this.stateChanges.next()}_revalidate(){this._startInput&&this._startInput._validatorOnChange(),this._endInput&&this._endInput._validatorOnChange()}_registerModel(e){this._startInput&&this._startInput._registerModel(e),this._endInput&&this._endInput._registerModel(e)}_isTargetRequired(e){return e?.ngControl?.control?.hasValidator(we.required)}static \u0275fac=function(t){return new(t||n)};static \u0275cmp=v({type:n,selectors:[["mat-date-range-input"]],hostAttrs:["role","group",1,"mat-date-range-input"],hostVars:8,hostBindings:function(t,a){t&2&&(y("id",a.id)("aria-labelledby",a._getAriaLabelledby())("aria-describedby",a._ariaDescribedBy)("data-mat-calendar",a.rangePicker?a.rangePicker.id:null),C("mat-date-range-input-hide-placeholders",a._shouldHidePlaceholders())("mat-date-range-input-required",a.required))},inputs:{rangePicker:"rangePicker",required:[2,"required","required",O],dateFilter:"dateFilter",min:"min",max:"max",disabled:[2,"disabled","disabled",O],separator:"separator",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd"},exportAs:["matDateRangeInput"],features:[j([{provide:ea,useExisting:n}]),Q],ngContentSelectors:cn,decls:11,vars:5,consts:[["cdkMonitorSubtreeFocus","",1,"mat-date-range-input-container",3,"cdkFocusChange"],[1,"mat-date-range-input-wrapper"],["aria-hidden","true",1,"mat-date-range-input-mirror"],[1,"mat-date-range-input-separator"],[1,"mat-date-range-input-wrapper","mat-date-range-input-end-wrapper"]],template:function(t,a){t&1&&(G(ln),c(0,"div",0),f("cdkFocusChange",function(r){return a._updateFocus(r)}),c(1,"div",1),P(2),c(3,"span",2),D(4),m()(),c(5,"span",3),D(6),m(),c(7,"div",4),P(8,1),c(9,"span",2),D(10),m()()()),t&2&&(d(4),z(a._getInputMirrorValue("start")),d(),C("mat-date-range-input-separator-hidden",a._shouldHideSeparator()),d(),z(a.separator),d(4),z(a._getInputMirrorValue("end")))},dependencies:[at],styles:[`.mat-date-range-input {
  display: block;
  width: 100%;
}

.mat-date-range-input-container {
  display: flex;
  align-items: center;
}

.mat-date-range-input-separator {
  transition: opacity 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
  margin: 0 4px;
  color: var(--mat-datepicker-range-input-separator-color, var(--mat-sys-on-surface));
}
.mat-form-field-disabled .mat-date-range-input-separator {
  color: var(--mat-datepicker-range-input-disabled-state-separator-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
._mat-animation-noopable .mat-date-range-input-separator {
  transition: none;
}

.mat-date-range-input-separator-hidden {
  -webkit-user-select: none;
  user-select: none;
  opacity: 0;
  transition: none;
}

.mat-date-range-input-wrapper {
  position: relative;
  overflow: hidden;
  max-width: calc(50% - 4px);
}

.mat-date-range-input-end-wrapper {
  flex-grow: 1;
}

.mat-date-range-input-inner {
  position: absolute;
  top: 0;
  left: 0;
  font: inherit;
  background: transparent;
  color: currentColor;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  vertical-align: bottom;
  text-align: inherit;
  -webkit-appearance: none;
  width: 100%;
  height: 100%;
}
.mat-date-range-input-inner:-moz-ui-invalid {
  box-shadow: none;
}
.mat-date-range-input-inner::placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-date-range-input-inner::-moz-placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-date-range-input-inner::-webkit-input-placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-date-range-input-inner:-ms-input-placeholder {
  transition: color 400ms 133.3333333333ms cubic-bezier(0.25, 0.8, 0.25, 1);
}
.mat-date-range-input-inner[disabled] {
  color: var(--mat-datepicker-range-input-disabled-state-text-color, color-mix(in srgb, var(--mat-sys-on-surface) 38%, transparent));
}
.mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder {
  -webkit-user-select: none;
  user-select: none;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  transition: none;
}
@media (forced-colors: active) {
  .mat-form-field-hide-placeholder .mat-date-range-input-inner::placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::placeholder {
    opacity: 0;
  }
}
.mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder {
  -webkit-user-select: none;
  user-select: none;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  transition: none;
}
@media (forced-colors: active) {
  .mat-form-field-hide-placeholder .mat-date-range-input-inner::-moz-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-moz-placeholder {
    opacity: 0;
  }
}
.mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder {
  -webkit-user-select: none;
  user-select: none;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  transition: none;
}
@media (forced-colors: active) {
  .mat-form-field-hide-placeholder .mat-date-range-input-inner::-webkit-input-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner::-webkit-input-placeholder {
    opacity: 0;
  }
}
.mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder {
  -webkit-user-select: none;
  user-select: none;
  color: transparent !important;
  -webkit-text-fill-color: transparent;
  transition: none;
}
@media (forced-colors: active) {
  .mat-form-field-hide-placeholder .mat-date-range-input-inner:-ms-input-placeholder, .mat-date-range-input-hide-placeholders .mat-date-range-input-inner:-ms-input-placeholder {
    opacity: 0;
  }
}
._mat-animation-noopable .mat-date-range-input-inner::placeholder {
  transition: none;
}
._mat-animation-noopable .mat-date-range-input-inner::-moz-placeholder {
  transition: none;
}
._mat-animation-noopable .mat-date-range-input-inner::-webkit-input-placeholder {
  transition: none;
}
._mat-animation-noopable .mat-date-range-input-inner:-ms-input-placeholder {
  transition: none;
}

.mat-date-range-input-mirror {
  -webkit-user-select: none;
  user-select: none;
  visibility: hidden;
  white-space: nowrap;
  display: inline-block;
  min-width: 2px;
}

.mat-mdc-form-field-type-mat-date-range-input .mat-mdc-form-field-infix {
  width: 200px;
}
`],encapsulation:2,changeDetection:0})}return n})();function An(n){return Dt(n,!0)}function ga(n){return n.nodeType===Node.ELEMENT_NODE}function Mn(n){return n.nodeName==="INPUT"}function xn(n){return n.nodeName==="TEXTAREA"}function Dt(n,o){if(ga(n)&&o){let t=(n.getAttribute?.("aria-labelledby")?.split(/\s+/g)||[]).reduce((a,i)=>{let r=document.getElementById(i);return r&&a.push(r),a},[]);if(t.length)return t.map(a=>Dt(a,!1)).join(" ")}if(ga(n)){let e=n.getAttribute("aria-label")?.trim();if(e)return e}if(Mn(n)||xn(n)){if(n.labels?.length)return Array.from(n.labels).map(a=>Dt(a,!1)).join(" ");let e=n.getAttribute("placeholder")?.trim();if(e)return e;let t=n.getAttribute("title")?.trim();if(t)return t}return(n.textContent||"").replace(/\s+/g," ").trim()}var xa=(()=>{class n extends ka{_rangeInput=s(kn);_elementRef=s(Y);_defaultErrorStateMatcher=s(oa);_injector=s(ve);_rawValue=u("");_parentForm=s(na,{optional:!0});_parentFormGroup=s(ia,{optional:!0});ngControl;_dir=s(de,{optional:!0});_errorStateTracker;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e}get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e}constructor(){super(),this._errorStateTracker=new sa(this._defaultErrorStateMatcher,null,this._parentFormGroup,this._parentForm,this.stateChanges)}ngOnInit(){let e=this._injector.get(aa,null,{optional:!0,self:!0});e&&(this.ngControl=e,this._errorStateTracker.ngControl=e)}ngAfterContentInit(){this._register()}ngDoCheck(){this.ngControl&&this.updateErrorState(),this._rawValue.set(this._elementRef.nativeElement.value)}isEmpty(){return this._rawValue().length===0}_getPlaceholder(){return this._elementRef.nativeElement.placeholder}focus(){this._elementRef.nativeElement.focus()}getMirrorValue(){let e=this._rawValue();return e.length>0?e:this._getPlaceholder()}updateErrorState(){this._errorStateTracker.updateErrorState()}_onInput(e){super._onInput(e),this._rangeInput._handleChildValueChange()}_openPopup(){this._rangeInput._openDatepicker()}_getMinDate(){return this._rangeInput.min}_getMaxDate(){return this._rangeInput.max}_getDateFilter(){return this._rangeInput.dateFilter}_parentDisabled(){return this._rangeInput._groupDisabled}_shouldHandleChangeEvent({source:e}){return e!==this._rangeInput._startInput&&e!==this._rangeInput._endInput}_assignValueProgrammatically(e,t){super._assignValueProgrammatically(e,t),(this===this._rangeInput._startInput?this._rangeInput._endInput:this._rangeInput._startInput)?._validatorOnChange(),this._rawValue.set(this._elementRef.nativeElement.value)}_formatValue(e){super._formatValue(e),this._rangeInput._handleChildValueChange()}_getAccessibleName(){return An(this._elementRef.nativeElement)}static \u0275fac=function(t){return new(t||n)};static \u0275dir=U({type:n,inputs:{errorStateMatcher:"errorStateMatcher"},features:[ae]})}return n})(),Xi=(()=>{class n extends xa{_startValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._model?this._model.selection.end:null;return!t||!a||this._dateAdapter.compareDate(t,a)<=0?null:{matStartDateInvalid:{end:a,actual:t}}};_validator=we.compose([...super._getValidators(),this._startValidator]);_register(){this._rangeInput._startInput=this}_getValueFromModel(e){return e.start}_shouldHandleChangeEvent(e){return super._shouldHandleChangeEvent(e)?e.oldValue?.start?!e.selection.start||!!this._dateAdapter.compareDate(e.oldValue.start,e.selection.start):!!e.selection.start:!1}_assignValueToModel(e){if(this._model){let t=new b(e,this._model.selection.end);this._model.updateSelection(t,this),this._rangeInput._handleChildValueChange()}}_onKeydown(e){let t=this._rangeInput._endInput,a=this._elementRef.nativeElement,i=this._dir?.value!=="rtl";(e.keyCode===39&&i||e.keyCode===37&&!i)&&a.selectionStart===a.value.length&&a.selectionEnd===a.value.length?(e.preventDefault(),t._elementRef.nativeElement.setSelectionRange(0,0),t.focus()):super._onKeydown(e)}static \u0275fac=(()=>{let e;return function(a){return(e||(e=De(n)))(a||n)}})();static \u0275dir=U({type:n,selectors:[["input","matStartDate",""]],hostAttrs:["type","text",1,"mat-start-date","mat-date-range-input-inner"],hostVars:5,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("keydown",function(r){return a._onKeydown(r)})("blur",function(){return a._onBlur()}),t&2&&(R("disabled",a.disabled),y("aria-haspopup",a._rangeInput.rangePicker?"dialog":null)("aria-owns",a._rangeInput._ariaOwns()||null)("min",a._getMinDate()?a._dateAdapter.toIso8601(a._getMinDate()):null)("max",a._getMaxDate()?a._dateAdapter.toIso8601(a._getMaxDate()):null))},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[j([{provide:He,useExisting:n,multi:!0},{provide:ze,useExisting:n,multi:!0}]),ae]})}return n})(),Ji=(()=>{class n extends xa{_endValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._model?this._model.selection.start:null;return!t||!a||this._dateAdapter.compareDate(t,a)>=0?null:{matEndDateInvalid:{start:a,actual:t}}};_register(){this._rangeInput._endInput=this}_validator=we.compose([...super._getValidators(),this._endValidator]);_getValueFromModel(e){return e.end}_shouldHandleChangeEvent(e){return super._shouldHandleChangeEvent(e)?e.oldValue?.end?!e.selection.end||!!this._dateAdapter.compareDate(e.oldValue.end,e.selection.end):!!e.selection.end:!1}_assignValueToModel(e){if(this._model){let t=new b(this._model.selection.start,e);this._model.updateSelection(t,this)}}_moveCaretToEndOfStartInput(){let e=this._rangeInput._startInput._elementRef.nativeElement,t=e.value;t.length>0&&e.setSelectionRange(t.length,t.length),e.focus()}_onKeydown(e){let t=this._elementRef.nativeElement,a=this._dir?.value!=="rtl";e.keyCode===8&&!t.value?this._moveCaretToEndOfStartInput():(e.keyCode===37&&a||e.keyCode===39&&!a)&&t.selectionStart===0&&t.selectionEnd===0?(e.preventDefault(),this._moveCaretToEndOfStartInput()):super._onKeydown(e)}static \u0275fac=(()=>{let e;return function(a){return(e||(e=De(n)))(a||n)}})();static \u0275dir=U({type:n,selectors:[["input","matEndDate",""]],hostAttrs:["type","text",1,"mat-end-date","mat-date-range-input-inner"],hostVars:5,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("keydown",function(r){return a._onKeydown(r)})("blur",function(){return a._onBlur()}),t&2&&(R("disabled",a.disabled),y("aria-haspopup",a._rangeInput.rangePicker?"dialog":null)("aria-owns",a._rangeInput._ariaOwns()||null)("min",a._getMinDate()?a._dateAdapter.toIso8601(a._getMinDate()):null)("max",a._getMaxDate()?a._dateAdapter.toIso8601(a._getMaxDate()):null))},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[j([{provide:He,useExisting:n,multi:!0},{provide:ze,useExisting:n,multi:!0}]),ae]})}return n})(),er=(()=>{class n extends We{_forwardContentValues(e){super._forwardContentValues(e);let t=this.datepickerInput;t&&(e.comparisonStart=t.comparisonStart,e.comparisonEnd=t.comparisonEnd,e.startDateAccessibleName=t._getStartDateAccessibleName(),e.endDateAccessibleName=t._getEndDateAccessibleName())}static \u0275fac=(()=>{let e;return function(a){return(e||(e=De(n)))(a||n)}})();static \u0275cmp=v({type:n,selectors:[["mat-date-range-picker"]],exportAs:["matDateRangePicker"],features:[j([_n,{provide:Ke,useFactory:()=>s(Ke,{optional:!0,skipSelf:!0})||new gn(s(_))},{provide:We,useExisting:n}]),ae],decls:0,vars:0,template:function(t,a){},encapsulation:2,changeDetection:0})}return n})();var tr=(()=>{class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=$({type:n});static \u0275inj=q({providers:[ge],imports:[zt,Xt,Yt,Kt,wa,wn,Ca,le,jt]})}return n})();export{Ra as a,Oa as b,dt as c,la as d,Kn as e,Wn as f,ca as g,Pa as h,ii as i,pi as j,ja as k,Zi as l,Ma as m,wn as n,kn as o,Xi as p,Ji as q,er as r,tr as s};
