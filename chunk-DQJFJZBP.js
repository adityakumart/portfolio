import{h as ye}from"./chunk-SCM5YCQX.js";import{d as we,f as Oe}from"./chunk-XERAEYVW.js";import{a as Ie,d as Te}from"./chunk-73YCOXIF.js";import{d as Me}from"./chunk-AO7PFW3M.js";import{c as Se}from"./chunk-UTTKJ4VE.js";import{b as Ee}from"./chunk-IX67HKRR.js";import{l as ve}from"./chunk-5GPG3DRY.js";import{d as ke}from"./chunk-2F2PXSMT.js";import{c as _e,l as ge}from"./chunk-X5ZGNSDJ.js";import{b as Ce}from"./chunk-MMP5TSYE.js";import{b as De}from"./chunk-ZQVBSK2V.js";import{a as be}from"./chunk-5MQEKBNR.js";import{i as xe}from"./chunk-KQL6CAWH.js";import{l as _t,o as gt,p as vt}from"./chunk-NUILELRG.js";import{f as fe}from"./chunk-BCBOFYED.js";import{a as ct,b as Q}from"./chunk-VXUVPFNK.js";import{e as he}from"./chunk-X4XKRH3M.js";import{K as me,L as X,R as ue,n as mt}from"./chunk-36BCSJLF.js";import{A as st,B as lt,D as dt,E as F,P as pt,T as ht,U as ut,V as ft,d as tt,f as nt,j as it,l as rt,m as at,y as ot}from"./chunk-OS7RU7CO.js";import{h as ce,m as et}from"./chunk-56CJBQFD.js";import{$ as x,Ac as de,Bb as N,Cb as $,Cc as V,Db as Ge,Dc as Ze,Fa as ae,Ga as oe,Ia as se,Ib as E,Ic as pe,Ja as L,Jb as h,Ka as H,Kb as u,Mb as q,Nb as U,Nc as Z,Ob as G,Pb as m,Qb as p,R as w,Rb as c,S as Qe,Sb as le,T as y,Uc as Je,Yb as v,Zb as Ke,a as Ne,ab as o,ba as je,bc as K,bd as J,da as l,dc as d,dd as P,e as j,ec as z,ed as Xe,fc as A,gb as O,gc as R,hc as W,ia as ie,ib as qe,ic as f,ja as re,jc as _,l as Be,nc as B,ob as Ue,oc as We,pc as C,q as Ve,qa as T,qc as Y,ra as $e,rc as M,sc as D,ua as g,ub as I,vb as S,wb as b,zc as Ye}from"./chunk-CLIOPF5A.js";var Mt=["*"];function Dt(t,a){t&1&&A(0)}var Ae=(()=>{class t{_elementRef=l(L);focus(){this._elementRef.nativeElement.focus()}static \u0275fac=function(n){return new(n||t)};static \u0275dir=b({type:t,selectors:[["","cdkStepHeader",""]],hostAttrs:["role","tab"]})}return t})(),Re=(()=>{class t{template=l(O);static \u0275fac=function(n){return new(n||t)};static \u0275dir=b({type:t,selectors:[["","cdkStepLabel",""]]})}return t})();var k={NUMBER:"number",EDIT:"edit",DONE:"done",ERROR:"error"},wt=new je("STEPPER_GLOBAL_OPTIONS"),ee=(()=>{class t{_stepperOptions;_stepper=l(te);_displayDefaultIndicatorType;stepLabel;_childForms;content;stepControl;get interacted(){return this._interacted()}set interacted(e){this._interacted.set(e)}_interacted=g(!1);interactedStream=new T;label;errorMessage;ariaLabel;ariaLabelledby;get state(){return this._state()}set state(e){this._state.set(e)}_state=g(void 0);get editable(){return this._editable()}set editable(e){this._editable.set(e)}_editable=g(!0);optional=!1;get completed(){let e=this._completedOverride(),n=this._interacted();return e??(n&&(!this.stepControl||this.stepControl.valid))}set completed(e){this._completedOverride.set(e)}_completedOverride=g(null);index=g(-1);isSelected=Z(()=>this._stepper.selectedIndex===this.index());indicatorType=Z(()=>{let e=this.isSelected(),n=this.completed,i=this._state()??k.NUMBER,r=this._editable();return this._showError()&&this.hasError&&!e?k.ERROR:this._displayDefaultIndicatorType?!n||e?k.NUMBER:r?k.EDIT:k.DONE:n&&!e?k.DONE:n&&e?i:r&&e?k.EDIT:i});isNavigable=Z(()=>{let e=this.isSelected();return this.completed||e||!this._stepper.linear});get hasError(){let e=this._customError();return e??this._getDefaultError()}set hasError(e){this._customError.set(e)}_customError=g(null);_getDefaultError(){return this.interacted&&!!this.stepControl?.invalid}constructor(){let e=l(wt,{optional:!0});this._stepperOptions=e||{},this._displayDefaultIndicatorType=this._stepperOptions.displayDefaultIndicatorType!==!1}select(){this._stepper.selected=this}reset(){this._interacted.set(!1),this._completedOverride()!=null&&this._completedOverride.set(!1),this._customError()!=null&&this._customError.set(!1),this.stepControl&&(this._childForms?.forEach(e=>e.resetForm?.()),this.stepControl.reset())}ngOnChanges(){this._stepper._stateChanged()}_markAsInteracted(){this._interacted()||(this._interacted.set(!0),this.interactedStream.emit(this))}_showError(){return this._stepperOptions.showError??this._customError()!=null}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=I({type:t,selectors:[["cdk-step"]],contentQueries:function(n,i,r){if(n&1&&R(r,Re,5)(r,mt,5),n&2){let s;f(s=_())&&(i.stepLabel=s.first),f(s=_())&&(i._childForms=s)}},viewQuery:function(n,i){if(n&1&&W(O,7),n&2){let r;f(r=_())&&(i.content=r.first)}},inputs:{stepControl:"stepControl",label:"label",errorMessage:"errorMessage",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],state:"state",editable:[2,"editable","editable",P],optional:[2,"optional","optional",P],completed:[2,"completed","completed",P],hasError:[2,"hasError","hasError",P]},outputs:{interactedStream:"interacted"},exportAs:["cdkStep"],features:[ae],ngContentSelectors:Mt,decls:1,vars:0,template:function(n,i){n&1&&(z(),Ge(0,Dt,1,0,"ng-template"))},encapsulation:2})}return t})(),te=(()=>{class t{_dir=l(dt,{optional:!0});_changeDetectorRef=l(J);_elementRef=l(L);_destroyed=new j;_keyManager;_steps;steps=new H;_stepHeader;_sortedHeaders=new H;get linear(){return this._linear()}set linear(e){this._linear.set(e)}_linear=g(!1);get selectedIndex(){return this._selectedIndex()}set selectedIndex(e){this._steps?(this._isValidIndex(e),this.selectedIndex!==e&&(this.selected?._markAsInteracted(),!this._anyControlsInvalidOrPending(e)&&(e>=this.selectedIndex||this.steps.toArray()[e].editable)&&this._updateSelectedItemIndex(e))):this._selectedIndex.set(e)}_selectedIndex=g(0);get selected(){return this.steps?this.steps.toArray()[this.selectedIndex]:void 0}set selected(e){this.selectedIndex=e&&this.steps?this.steps.toArray().indexOf(e):-1}selectionChange=new T;selectedIndexChange=new T;_groupId=l(lt).getId("cdk-stepper-");get orientation(){return this._orientation}set orientation(e){this._orientation=e,this._keyManager&&this._keyManager.withVerticalOrientation(e==="vertical")}_orientation="horizontal";ngAfterContentInit(){this._steps.changes.pipe(w(this._steps),y(this._destroyed)).subscribe(e=>{this.steps.reset(e.filter(n=>n._stepper===this)),this.steps.forEach((n,i)=>n.index.set(i)),this.steps.notifyOnChanges()})}ngAfterViewInit(){if(this._stepHeader.changes.pipe(w(this._stepHeader),y(this._destroyed)).subscribe(e=>{this._sortedHeaders.reset(e.toArray().sort((n,i)=>n._elementRef.nativeElement.compareDocumentPosition(i._elementRef.nativeElement)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)),this._sortedHeaders.notifyOnChanges()}),this._keyManager=new st(this._sortedHeaders).withWrap().withHomeAndEnd().withVerticalOrientation(this._orientation==="vertical"),this._keyManager.updateActiveItem(this.selectedIndex),(this._dir?this._dir.change:Be()).pipe(w(this._layoutDirection()),y(this._destroyed)).subscribe(e=>this._keyManager?.withHorizontalOrientation(e)),this._keyManager.updateActiveItem(this.selectedIndex),this.steps.changes.subscribe(()=>{this.selected||this._selectedIndex.set(Math.max(this.selectedIndex-1,0))}),this._isValidIndex(this.selectedIndex)||this._selectedIndex.set(0),this.linear&&this.selectedIndex>0){let e=this.steps.toArray().slice(0,this._selectedIndex());for(let n of e)n._markAsInteracted()}}ngOnDestroy(){this._keyManager?.destroy(),this.steps.destroy(),this._sortedHeaders.destroy(),this._destroyed.next(),this._destroyed.complete()}next(){this.selectedIndex=Math.min(this._selectedIndex()+1,this.steps.length-1)}previous(){this.selectedIndex=Math.max(this._selectedIndex()-1,0)}reset(){this._updateSelectedItemIndex(0),this.steps.forEach(e=>e.reset()),this._stateChanged()}_getStepLabelId(e){return`${this._groupId}-label-${e}`}_getStepContentId(e){return`${this._groupId}-content-${e}`}_stateChanged(){this._changeDetectorRef.markForCheck()}_getAnimationDirection(e){let n=e-this._selectedIndex();return n<0?this._layoutDirection()==="rtl"?"next":"previous":n>0?this._layoutDirection()==="rtl"?"previous":"next":"current"}_getFocusIndex(){return this._keyManager?this._keyManager.activeItemIndex:this._selectedIndex()}_updateSelectedItemIndex(e){let n=this.steps.toArray(),i=this._selectedIndex();this.selectionChange.emit({selectedIndex:e,previouslySelectedIndex:i,selectedStep:n[e],previouslySelectedStep:n[i]}),this._keyManager&&(this._containsFocus()?this._keyManager.setActiveItem(e):this._keyManager.updateActiveItem(e)),this._selectedIndex.set(e),this.selectedIndexChange.emit(e),this._stateChanged()}_onKeydown(e){let n=ot(e),i=e.keyCode,r=this._keyManager;r?.activeItemIndex!=null&&!n&&(i===32||i===13)?(this.selectedIndex=r.activeItemIndex,e.preventDefault()):r?.setFocusOrigin("keyboard").onKeydown(e)}_anyControlsInvalidOrPending(e){return this.linear&&e>=0?this.steps.toArray().slice(0,e).some(n=>{let i=n.stepControl;return(i?i.invalid||i.pending||!n.interacted:!n.completed)&&!n.optional&&!n._completedOverride()}):!1}_layoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_containsFocus(){let e=this._elementRef.nativeElement,n=tt();return e===n||e.contains(n)}_isValidIndex(e){return e>-1&&(!this.steps||e<this.steps.length)}static \u0275fac=function(n){return new(n||t)};static \u0275dir=b({type:t,selectors:[["","cdkStepper",""]],contentQueries:function(n,i,r){if(n&1&&R(r,ee,5)(r,Ae,5),n&2){let s;f(s=_())&&(i._steps=s),f(s=_())&&(i._stepHeader=s)}},inputs:{linear:[2,"linear","linear",P],selectedIndex:[2,"selectedIndex","selectedIndex",Xe],selected:"selected",orientation:"orientation"},outputs:{selectionChange:"selectionChange",selectedIndexChange:"selectedIndexChange"},exportAs:["cdkStepper"]})}return t})();var bt=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=S({type:t});static \u0275inj=x({imports:[F]})}return t})();var It=(t,a,e)=>({index:t,active:a,optional:e});function Et(t,a){if(t&1&&v(0,2),t&2){let e=d();m("ngTemplateOutlet",e.iconOverrides[e.state])("ngTemplateOutletContext",Ze(2,It,e.index,e.active,e.optional))}}function kt(t,a){if(t&1&&(p(0,"span",7),M(1),c()),t&2){let e=d(2);o(),D(e._getDefaultTextForState(e.state))}}function Tt(t,a){if(t&1&&(p(0,"span",8),M(1),c()),t&2){let e=d(3);o(),D(e._intl.completedLabel)}}function Ot(t,a){if(t&1&&(p(0,"span",8),M(1),c()),t&2){let e=d(3);o(),D(e._intl.editableLabel)}}function zt(t,a){if(t&1&&(h(0,Tt,2,1,"span",8)(1,Ot,2,1,"span",8),p(2,"mat-icon",7),M(3),c()),t&2){let e=d(2);u(e.state==="done"?0:e.state==="edit"?1:-1),o(3),D(e._getDefaultTextForState(e.state))}}function At(t,a){if(t&1&&h(0,kt,2,1,"span",7)(1,zt,4,2),t&2){let e,n=d();u((e=n.state)==="number"?0:1)}}function Rt(t,a){t&1&&(p(0,"div",4),v(1,9),c()),t&2&&(o(),m("ngTemplateOutlet",a.template))}function Pt(t,a){if(t&1&&(p(0,"div",4),M(1),c()),t&2){let e=d();o(),D(e.label)}}function Ft(t,a){if(t&1&&(p(0,"div",5),M(1),c()),t&2){let e=d();o(),D(e._intl.optionalLabel)}}function Lt(t,a){if(t&1&&(p(0,"div",6),M(1),c()),t&2){let e=d();o(),D(e.errorMessage)}}var yt=["*"];function Ht(t,a){}function Nt(t,a){if(t&1&&(A(0),$(1,Ht,0,0,"ng-template",0)),t&2){let e=d();o(),m("cdkPortalOutlet",e._portal)}}var Bt=["animatedContainer"],xt=t=>({steps:t}),St=t=>({step:t});function Vt(t,a){t&1&&A(0)}function Qt(t,a){if(t&1&&(p(0,"div",5),v(1,9)(2,6),c()),t&2){let e=d(2),n=B(6);o(),m("ngTemplateOutlet",e.headerPrefix()),o(),m("ngTemplateOutlet",n)("ngTemplateOutletContext",V(3,xt,e.steps))}}function jt(t,a){if(t&1&&v(0,6),t&2){let e=d(2),n=B(6);m("ngTemplateOutlet",n)("ngTemplateOutletContext",V(2,xt,e.steps))}}function $t(t,a){if(t&1&&(p(0,"div",10,2),v(2,9),c()),t&2){let e=a.$implicit,n=a.$index,i=d(2);Y("mat-horizontal-stepper-content-"+i._getAnimationDirection(n)),m("id",i._getStepContentId(n)),E("aria-labelledby",i._getStepLabelId(n))("inert",i.selectedIndex===n?null:""),o(2),m("ngTemplateOutlet",e.content)}}function qt(t,a){if(t&1&&(p(0,"div",3),h(1,Qt,3,5,"div",5)(2,jt,1,4,"ng-container",6),p(3,"div",7),U(4,$t,3,6,"div",8,q),c()()),t&2){let e=d();o(),u(e.headerPrefix()?1:2),o(3),G(e.steps)}}function Ut(t,a){if(t&1&&v(0,9),t&2){let e=d(2);m("ngTemplateOutlet",e.headerPrefix())}}function Gt(t,a){if(t&1&&(p(0,"div",11),v(1,6),p(2,"div",12,2)(4,"div",13)(5,"div",14),v(6,9),c()()()()),t&2){let e=a.$implicit,n=a.$index,i=a.$index,r=a.$count,s=d(2),ne=B(4);o(),m("ngTemplateOutlet",ne)("ngTemplateOutletContext",V(11,St,e)),o(),C("mat-stepper-vertical-line",i!==r-1)("mat-vertical-content-container-active",s.selectedIndex===n),E("inert",s.selectedIndex===n?null:"")("aria-label",s.ariaLabel),o(2),m("id",s._getStepContentId(n)),E("aria-labelledby",s._getStepLabelId(n)),o(2),m("ngTemplateOutlet",e.content)}}function Kt(t,a){if(t&1&&(p(0,"div",4),h(1,Ut,1,1,"ng-container",9),U(2,Gt,7,13,"div",11,q),c()),t&2){let e=d();o(),u(e.headerPrefix()?1:-1),o(),G(e.steps)}}function Wt(t,a){if(t&1){let e=Ke();p(0,"mat-step-header",15),K("click",function(){let i=ie(e).step;return re(i.select())})("keydown",function(i){ie(e);let r=d();return re(r._onKeydown(i))}),c()}if(t&2){let e=a.step,n=d();C("mat-horizontal-stepper-header",n.orientation==="horizontal")("mat-vertical-stepper-header",n.orientation==="vertical"),m("tabIndex",n._getFocusIndex()===e.index()?0:-1)("id",n._getStepLabelId(e.index()))("index",e.index())("state",e.indicatorType())("label",e.stepLabel||e.label)("selected",e.isSelected())("active",e.isNavigable())("optional",e.optional)("errorMessage",e.errorMessage)("iconOverrides",n._iconOverrides)("disableRipple",n.disableRipple||!e.isNavigable())("color",e.color||n.color),E("role",n.orientation==="horizontal"?"tab":"button")("aria-posinset",n.orientation==="horizontal"?e.index()+1:null)("aria-setsize",n.orientation==="horizontal"?n.steps.length:null)("aria-selected",n.orientation==="horizontal"?e.isSelected():null)("aria-current",n.orientation==="vertical"&&e.isSelected()?"step":null)("aria-disabled",n.orientation==="vertical"&&e.isSelected()?"true":null)("aria-expanded",n.orientation==="vertical"?e.isSelected():null)("aria-controls",n._getStepContentId(e.index()))("aria-label",e.ariaLabel||null)("aria-labelledby",!e.ariaLabel&&e.ariaLabelledby?e.ariaLabelledby:null)("aria-disabled",e.isNavigable()?null:!0)}}function Yt(t,a){t&1&&le(0,"div",17)}function Zt(t,a){if(t&1&&(v(0,6),h(1,Yt,1,0,"div",17)),t&2){let e=a.$implicit,n=a.$index,i=a.$count;d(2);let r=B(4);m("ngTemplateOutlet",r)("ngTemplateOutletContext",V(3,St,e)),o(),u(n!==i-1?1:-1)}}function Jt(t,a){if(t&1&&(p(0,"div",16),U(1,Zt,2,5,null,null,q),c()),t&2){let e=a.steps,n=d();E("aria-label",n.ariaLabel),o(),G(e)}}var Pe=(()=>{class t extends Re{static \u0275fac=(()=>{let e;return function(i){return(e||(e=oe(t)))(i||t)}})();static \u0275dir=b({type:t,selectors:[["","matStepLabel",""]],features:[N]})}return t})(),Xt=(()=>{class t{changes=new j;optionalLabel="Optional";completedLabel="Completed";editableLabel="Editable";static \u0275fac=function(n){return new(n||t)};static \u0275prov=se({token:t,factory:t.\u0275fac})}return t})(),Fe=(()=>{class t extends Ae{_intl=l(Xt);_focusMonitor=l(it);_intlSubscription;state;label;errorMessage;iconOverrides;index;selected=!1;active=!1;optional=!1;disableRipple=!1;color;constructor(){super();let e=l(rt);e.load(ut),e.load(at);let n=l(J);this._intlSubscription=this._intl.changes.subscribe(()=>n.markForCheck())}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0)}ngOnDestroy(){this._intlSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._elementRef)}focus(e,n){e?this._focusMonitor.focusVia(this._elementRef,e,n):this._elementRef.nativeElement.focus(n)}_stringLabel(){return this.label instanceof Pe?null:this.label}_templateLabel(){return this.label instanceof Pe?this.label:null}_getHostElement(){return this._elementRef.nativeElement}_getDefaultTextForState(e){return e=="number"?`${this.index+1}`:e=="edit"?"create":e=="error"?"warning":e}_hasEmptyLabel(){return!this._stringLabel()&&!this._templateLabel()&&!this._hasOptionalLabel()&&!this._hasErrorLabel()}_hasOptionalLabel(){return this.optional&&this.state!=="error"}_hasErrorLabel(){return this.state==="error"}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=I({type:t,selectors:[["mat-step-header"]],hostAttrs:["role","",1,"mat-step-header"],hostVars:4,hostBindings:function(n,i){n&2&&(Y("mat-"+(i.color||"primary")),C("mat-step-header-empty-label",i._hasEmptyLabel()))},inputs:{state:"state",label:"label",errorMessage:"errorMessage",iconOverrides:"iconOverrides",index:"index",selected:"selected",active:"active",optional:"optional",disableRipple:"disableRipple",color:"color"},features:[N],decls:10,vars:17,consts:[["matRipple","",1,"mat-step-header-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"],[1,"mat-step-icon-content"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-step-label"],[1,"mat-step-text-label"],[1,"mat-step-optional"],[1,"mat-step-sub-label-error"],["aria-hidden","true"],[1,"cdk-visually-hidden"],[3,"ngTemplateOutlet"]],template:function(n,i){if(n&1&&(le(0,"div",0),p(1,"div")(2,"div",1),h(3,Et,1,6,"ng-container",2)(4,At,2,1),c()(),p(5,"div",3),h(6,Rt,2,1,"div",4)(7,Pt,2,1,"div",4),h(8,Ft,2,1,"div",5),h(9,Lt,2,1,"div",6),c()),n&2){let r;m("matRippleTrigger",i._getHostElement())("matRippleDisabled",i.disableRipple),o(),Y(Ye("mat-step-icon-state-",i.state," mat-step-icon")),C("mat-step-icon-selected",i.selected),o(2),u(i.iconOverrides&&i.iconOverrides[i.state]?3:4),o(2),C("mat-step-label-active",i.active)("mat-step-label-selected",i.selected)("mat-step-label-error",i.state=="error"),o(),u((r=i._templateLabel())?6:i._stringLabel()?7:-1,r),o(2),u(i._hasOptionalLabel()?8:-1),o(),u(i._hasErrorLabel()?9:-1)}},dependencies:[ht,ce,ct],styles:[`.mat-step-header {
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
`],encapsulation:2})}return t})(),en=(()=>{class t{templateRef=l(O);name;static \u0275fac=function(n){return new(n||t)};static \u0275dir=b({type:t,selectors:[["ng-template","matStepperIcon",""]],inputs:{name:[0,"matStepperIcon","name"]}})}return t})(),tn=(()=>{class t{_template=l(O);static \u0275fac=function(n){return new(n||t)};static \u0275dir=b({type:t,selectors:[["ng-template","matStepContent",""]]})}return t})(),nn=(()=>{class t extends ee{_errorStateMatcher=l(X,{skipSelf:!0});_viewContainerRef=l(Ue);_isSelected=Ne.EMPTY;stepLabel=void 0;color;_lazyContent;_portal;ngAfterContentInit(){this._isSelected=this._stepper.steps.changes.pipe(Qe(()=>this._stepper.selectionChange.pipe(Ve(e=>e.selectedStep===this),w(this._stepper.selected===this)))).subscribe(e=>{e&&this._lazyContent&&!this._portal&&(this._portal=new _t(this._lazyContent._template,this._viewContainerRef))})}ngOnDestroy(){this._isSelected.unsubscribe()}isErrorState(e,n){let i=this._errorStateMatcher.isErrorState(e,n),r=!!(e&&e.invalid&&this.interacted);return i||r}static \u0275fac=(()=>{let e;return function(i){return(e||(e=oe(t)))(i||t)}})();static \u0275cmp=I({type:t,selectors:[["mat-step"]],contentQueries:function(n,i,r){if(n&1&&R(r,Pe,5)(r,tn,5),n&2){let s;f(s=_())&&(i.stepLabel=s.first),f(s=_())&&(i._lazyContent=s.first)}},hostAttrs:["hidden",""],inputs:{color:"color"},exportAs:["matStep"],features:[de([{provide:X,useExisting:t},{provide:ee,useExisting:t}]),N],ngContentSelectors:yt,decls:1,vars:0,consts:[[3,"cdkPortalOutlet"]],template:function(n,i){n&1&&(z(),$(0,Nt,2,1,"ng-template"))},dependencies:[gt],encapsulation:2})}return t})(),rn=(()=>{class t extends te{_ngZone=l($e);_renderer=l(qe);_animationsDisabled=pt();_cleanupTransition;_isAnimating=g(!1);_stepHeader=void 0;_animatedContainers;_steps=void 0;steps=new H;_icons;animationDone=new T;disableRipple=!1;color;labelPosition="end";headerPosition="top";ariaLabel=null;headerPrefix=Je(null);_iconOverrides={};get animationDuration(){return this._animationDuration}set animationDuration(e){this._animationDuration=/^\d+$/.test(e)?e+"ms":e}_animationDuration="";_isServer=!l(nt).isBrowser;constructor(){super();let n=l(L).nativeElement.nodeName.toLowerCase();this.orientation=n==="mat-vertical-stepper"?"vertical":"horizontal"}ngAfterContentInit(){super.ngAfterContentInit(),this._icons.forEach(({name:e,templateRef:n})=>this._iconOverrides[e]=n),this.steps.changes.pipe(y(this._destroyed)).subscribe(()=>this._stateChanged()),this.selectedIndexChange.pipe(y(this._destroyed)).subscribe(()=>{let e=this._getAnimationDuration();e==="0ms"||e==="0s"?this._onAnimationDone():this._isAnimating.set(!0)}),this._ngZone.runOutsideAngular(()=>{this._animationsDisabled||setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-stepper-animations-enabled"),this._cleanupTransition=this._renderer.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionend)},200)})}ngAfterViewInit(){if(super.ngAfterViewInit(),typeof queueMicrotask=="function"){let e=!1;this._animatedContainers.changes.pipe(w(null),y(this._destroyed)).subscribe(()=>queueMicrotask(()=>{e||(e=!0,this.animationDone.emit()),this._stateChanged()}))}}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransition?.()}_getAnimationDuration(){return this._animationsDisabled?"0ms":this.animationDuration?this.animationDuration:this.orientation==="horizontal"?"500ms":"225ms"}_handleTransitionend=e=>{let n=e.target;if(!n)return;let i=this.orientation==="horizontal"&&e.propertyName==="transform"&&n.classList.contains("mat-horizontal-stepper-content-current"),r=this.orientation==="vertical"&&e.propertyName==="grid-template-rows"&&n.classList.contains("mat-vertical-content-container-active");(i||r)&&this._animatedContainers.find(ne=>ne.nativeElement===n)&&this._onAnimationDone()};_onAnimationDone(){this._isAnimating.set(!1),this.animationDone.emit()}static \u0275fac=function(n){return new(n||t)};static \u0275cmp=I({type:t,selectors:[["mat-stepper"],["mat-vertical-stepper"],["mat-horizontal-stepper"],["","matStepper",""]],contentQueries:function(n,i,r){if(n&1&&R(r,nn,5)(r,en,5),n&2){let s;f(s=_())&&(i._steps=s),f(s=_())&&(i._icons=s)}},viewQuery:function(n,i){if(n&1&&W(Fe,5)(Bt,5),n&2){let r;f(r=_())&&(i._stepHeader=r),f(r=_())&&(i._animatedContainers=r)}},hostVars:14,hostBindings:function(n,i){n&2&&(We("--mat-stepper-animation-duration",i._getAnimationDuration()),C("mat-stepper-horizontal",i.orientation==="horizontal")("mat-stepper-vertical",i.orientation==="vertical")("mat-stepper-label-position-end",i.orientation==="horizontal"&&i.labelPosition=="end")("mat-stepper-label-position-bottom",i.orientation==="horizontal"&&i.labelPosition=="bottom")("mat-stepper-header-position-bottom",i.headerPosition==="bottom")("mat-stepper-animating",i._isAnimating()))},inputs:{disableRipple:"disableRipple",color:"color",labelPosition:"labelPosition",headerPosition:"headerPosition",ariaLabel:[0,"aria-label","ariaLabel"],headerPrefix:[1,"headerPrefix"],animationDuration:"animationDuration"},outputs:{animationDone:"animationDone"},exportAs:["matStepper","matVerticalStepper","matHorizontalStepper"],features:[de([{provide:te,useExisting:t}]),N],ngContentSelectors:yt,decls:7,vars:2,consts:[["stepTemplate",""],["horizontalStepsTemplate",""],["animatedContainer",""],[1,"mat-horizontal-stepper-wrapper"],[1,"mat-vertical-stepper-wrapper"],[1,"mat-horizontal-stepper-header-wrapper"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-horizontal-content-container"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id","class"],[3,"ngTemplateOutlet"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id"],[1,"mat-step"],[1,"mat-vertical-content-container"],["role","region",1,"mat-vertical-stepper-content",3,"id"],[1,"mat-vertical-content"],[3,"click","keydown","tabIndex","id","index","state","label","selected","active","optional","errorMessage","iconOverrides","disableRipple","color"],["aria-orientation","horizontal","role","tablist",1,"mat-horizontal-stepper-header-container"],[1,"mat-stepper-horizontal-line"]],template:function(n,i){if(n&1&&(z(),h(0,Vt,1,0),h(1,qt,6,1,"div",3)(2,Kt,4,1,"div",4),$(3,Wt,1,27,"ng-template",null,0,pe)(5,Jt,3,1,"ng-template",null,1,pe)),n&2){let r;u(i._isServer?0:-1),o(),u((r=i.orientation)==="horizontal"?1:r==="vertical"?2:-1)}},dependencies:[ce,Fe],styles:[`.mat-stepper-vertical,
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
`],encapsulation:2})}return t})();var Le=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=S({type:t});static \u0275inj=x({providers:[X],imports:[vt,bt,Q,ft,rn,Fe,F]})}return t})();var He=(()=>{class t{static \u0275fac=function(n){return new(n||t)};static \u0275mod=S({type:t});static \u0275inj=x({imports:[F]})}return t})();var Ai=(()=>{class t{static{this.\u0275fac=function(n){return new(n||t)}}static{this.\u0275mod=S({type:t})}static{this.\u0275inj=x({imports:[et,me,he,ue,xe,Se,Me,Ce,_e,ge,Le,ve,De,Q,be,we,Ie,fe,Ee,He,ke,ye,Te,Oe,me,he,ue,xe,Se,Me,Ce,_e,ge,Le,ve,De,Q,be,we,Ie,fe,Ee,He,ke,ye,Te,Oe]})}}return t})();export{Ai as a};
