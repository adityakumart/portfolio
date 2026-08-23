import{h as Dt}from"./chunk-HXRF7BGY.js";import{a as At,d as Ft}from"./chunk-L6HMNOXB.js";import{d as Ot}from"./chunk-O2PMQPWH.js";import{c as Et}from"./chunk-Y6MPOLLX.js";import{b as zt}from"./chunk-SLE6E2E6.js";import{k as Mt}from"./chunk-CZHESNCT.js";import{d as Lt}from"./chunk-UYMTELIL.js";import{c as wt,l as Ct}from"./chunk-XXLHUKOC.js";import{b as Tt}from"./chunk-TJI2MU6O.js";import{b as U}from"./chunk-TEZEFABM.js";import{a as St}from"./chunk-7XNWPGSG.js";import{g as be,j as It}from"./chunk-FZG2SMHY.js";import{i as kt,l as ve,o as xe,p as ye}from"./chunk-6HYBAN6L.js";import{f as yt}from"./chunk-22PO5DXM.js";import{a as _e,b as Z}from"./chunk-OA2IFNBI.js";import{e as vt,i as xt}from"./chunk-4654RMUJ.js";import{A as me,B as pe,Ca as ge,D as ft,E as k,Ea as fe,Fa as ct,Q as he,ba as ue,d as ae,f as re,j as oe,l as se,m as le,s as ce,y as de,ya as bt,za as lt}from"./chunk-AVFDWKF4.js";import{i as gt,n as ne}from"./chunk-NCU73T75.js";import{$a as o,Ab as z,Bb as G,Bc as W,Cb as Xt,Cc as te,Ea as J,Fa as H,Ha as ht,Hb as M,Hc as rt,Ia as V,Ib as h,Ja as Q,Jb as _,Lb as tt,Mb as et,Mc as ot,Nb as it,Ob as p,Pb as d,Q as A,Qb as m,R as Zt,Rb as nt,S,Tc as ee,Xb as y,Yb as _t,_ as f,a as Gt,aa as Ut,ac as P,ad as st,ca as c,cc as l,cd as j,dc as D,dd as ie,e as K,ec as I,fb as R,fc as E,gc as B,ha as Y,hb as Kt,hc as u,ia as X,ic as g,l as qt,mc as N,nb as Yt,nc as ut,oc as w,pa as F,pc as at,q as Wt,qa as $t,qc as T,rc as O,ta as v,tb as C,ub as b,vb as x,yc as Jt,zc as q}from"./chunk-RQ5ZPS73.js";var De=["*"];function Ie(e,r){e&1&&I(0)}var Rt=(()=>{class e{_elementRef=c(V);focus(){this._elementRef.nativeElement.focus()}static \u0275fac=function(i){return new(i||e)};static \u0275dir=x({type:e,selectors:[["","cdkStepHeader",""]],hostAttrs:["role","tab"]})}return e})(),Pt=(()=>{class e{template=c(R);static \u0275fac=function(i){return new(i||e)};static \u0275dir=x({type:e,selectors:[["","cdkStepLabel",""]]})}return e})();var L={NUMBER:"number",EDIT:"edit",DONE:"done",ERROR:"error"},Ee=new Ut("STEPPER_GLOBAL_OPTIONS"),dt=(()=>{class e{_stepperOptions;_stepper=c(mt);_displayDefaultIndicatorType;stepLabel;_childForms;content;stepControl;get interacted(){return this._interacted()}set interacted(t){this._interacted.set(t)}_interacted=v(!1);interactedStream=new F;label;errorMessage;ariaLabel;ariaLabelledby;get state(){return this._state()}set state(t){this._state.set(t)}_state=v(void 0);get editable(){return this._editable()}set editable(t){this._editable.set(t)}_editable=v(!0);optional=!1;get completed(){let t=this._completedOverride(),i=this._interacted();return t??(i&&(!this.stepControl||this.stepControl.valid))}set completed(t){this._completedOverride.set(t)}_completedOverride=v(null);index=v(-1);isSelected=ot(()=>this._stepper.selectedIndex===this.index());indicatorType=ot(()=>{let t=this.isSelected(),i=this.completed,n=this._state()??L.NUMBER,a=this._editable();return this._showError()&&this.hasError&&!t?L.ERROR:this._displayDefaultIndicatorType?!i||t?L.NUMBER:a?L.EDIT:L.DONE:i&&!t?L.DONE:i&&t?n:a&&t?L.EDIT:n});isNavigable=ot(()=>{let t=this.isSelected();return this.completed||t||!this._stepper.linear});get hasError(){let t=this._customError();return t??this._getDefaultError()}set hasError(t){this._customError.set(t)}_customError=v(null);_getDefaultError(){return this.interacted&&!!this.stepControl?.invalid}constructor(){let t=c(Ee,{optional:!0});this._stepperOptions=t||{},this._displayDefaultIndicatorType=this._stepperOptions.displayDefaultIndicatorType!==!1}select(){this._stepper.selected=this}reset(){this._interacted.set(!1),this._completedOverride()!=null&&this._completedOverride.set(!1),this._customError()!=null&&this._customError.set(!1),this.stepControl&&(this._childForms?.forEach(t=>t.resetForm?.()),this.stepControl.reset())}ngOnChanges(){this._stepper._stateChanged()}_markAsInteracted(){this._interacted()||(this._interacted.set(!0),this.interactedStream.emit(this))}_showError(){return this._stepperOptions.showError??this._customError()!=null}static \u0275fac=function(i){return new(i||e)};static \u0275cmp=C({type:e,selectors:[["cdk-step"]],contentQueries:function(i,n,a){if(i&1&&E(a,Pt,5)(a,ue,5),i&2){let s;u(s=g())&&(n.stepLabel=s.first),u(s=g())&&(n._childForms=s)}},viewQuery:function(i,n){if(i&1&&B(R,7),i&2){let a;u(a=g())&&(n.content=a.first)}},inputs:{stepControl:"stepControl",label:"label",errorMessage:"errorMessage",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],state:"state",editable:[2,"editable","editable",j],optional:[2,"optional","optional",j],completed:[2,"completed","completed",j],hasError:[2,"hasError","hasError",j]},outputs:{interactedStream:"interacted"},exportAs:["cdkStep"],features:[J],ngContentSelectors:De,decls:1,vars:0,template:function(i,n){i&1&&(D(),Xt(0,Ie,1,0,"ng-template"))},encapsulation:2})}return e})(),mt=(()=>{class e{_dir=c(ft,{optional:!0});_changeDetectorRef=c(st);_elementRef=c(V);_destroyed=new K;_keyManager;_steps;steps=new Q;_stepHeader;_sortedHeaders=new Q;get linear(){return this._linear()}set linear(t){this._linear.set(t)}_linear=v(!1);get selectedIndex(){return this._selectedIndex()}set selectedIndex(t){this._steps?(this._isValidIndex(t),this.selectedIndex!==t&&(this.selected?._markAsInteracted(),!this._anyControlsInvalidOrPending(t)&&(t>=this.selectedIndex||this.steps.toArray()[t].editable)&&this._updateSelectedItemIndex(t))):this._selectedIndex.set(t)}_selectedIndex=v(0);get selected(){return this.steps?this.steps.toArray()[this.selectedIndex]:void 0}set selected(t){this.selectedIndex=t&&this.steps?this.steps.toArray().indexOf(t):-1}selectionChange=new F;selectedIndexChange=new F;_groupId=c(pe).getId("cdk-stepper-");get orientation(){return this._orientation}set orientation(t){this._orientation=t,this._keyManager&&this._keyManager.withVerticalOrientation(t==="vertical")}_orientation="horizontal";ngAfterContentInit(){this._steps.changes.pipe(A(this._steps),S(this._destroyed)).subscribe(t=>{this.steps.reset(t.filter(i=>i._stepper===this)),this.steps.forEach((i,n)=>i.index.set(n)),this.steps.notifyOnChanges()})}ngAfterViewInit(){if(this._stepHeader.changes.pipe(A(this._stepHeader),S(this._destroyed)).subscribe(t=>{this._sortedHeaders.reset(t.toArray().sort((i,n)=>i._elementRef.nativeElement.compareDocumentPosition(n._elementRef.nativeElement)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)),this._sortedHeaders.notifyOnChanges()}),this._keyManager=new me(this._sortedHeaders).withWrap().withHomeAndEnd().withVerticalOrientation(this._orientation==="vertical"),this._keyManager.updateActiveItem(this.selectedIndex),(this._dir?this._dir.change:qt()).pipe(A(this._layoutDirection()),S(this._destroyed)).subscribe(t=>this._keyManager?.withHorizontalOrientation(t)),this._keyManager.updateActiveItem(this.selectedIndex),this.steps.changes.subscribe(()=>{this.selected||this._selectedIndex.set(Math.max(this.selectedIndex-1,0))}),this._isValidIndex(this.selectedIndex)||this._selectedIndex.set(0),this.linear&&this.selectedIndex>0){let t=this.steps.toArray().slice(0,this._selectedIndex());for(let i of t)i._markAsInteracted()}}ngOnDestroy(){this._keyManager?.destroy(),this.steps.destroy(),this._sortedHeaders.destroy(),this._destroyed.next(),this._destroyed.complete()}next(){this.selectedIndex=Math.min(this._selectedIndex()+1,this.steps.length-1)}previous(){this.selectedIndex=Math.max(this._selectedIndex()-1,0)}reset(){this._updateSelectedItemIndex(0),this.steps.forEach(t=>t.reset()),this._stateChanged()}_getStepLabelId(t){return`${this._groupId}-label-${t}`}_getStepContentId(t){return`${this._groupId}-content-${t}`}_stateChanged(){this._changeDetectorRef.markForCheck()}_getAnimationDirection(t){let i=t-this._selectedIndex();return i<0?this._layoutDirection()==="rtl"?"next":"previous":i>0?this._layoutDirection()==="rtl"?"previous":"next":"current"}_getFocusIndex(){return this._keyManager?this._keyManager.activeItemIndex:this._selectedIndex()}_updateSelectedItemIndex(t){let i=this.steps.toArray(),n=this._selectedIndex();this.selectionChange.emit({selectedIndex:t,previouslySelectedIndex:n,selectedStep:i[t],previouslySelectedStep:i[n]}),this._keyManager&&(this._containsFocus()?this._keyManager.setActiveItem(t):this._keyManager.updateActiveItem(t)),this._selectedIndex.set(t),this.selectedIndexChange.emit(t),this._stateChanged()}_onKeydown(t){let i=de(t),n=t.keyCode,a=this._keyManager;a?.activeItemIndex!=null&&!i&&(n===32||n===13)?(this.selectedIndex=a.activeItemIndex,t.preventDefault()):a?.setFocusOrigin("keyboard").onKeydown(t)}_anyControlsInvalidOrPending(t){return this.linear&&t>=0?this.steps.toArray().slice(0,t).some(i=>{let n=i.stepControl;return(n?n.invalid||n.pending||!i.interacted:!i.completed)&&!i.optional&&!i._completedOverride()}):!1}_layoutDirection(){return this._dir&&this._dir.value==="rtl"?"rtl":"ltr"}_containsFocus(){let t=this._elementRef.nativeElement,i=ae();return t===i||t.contains(i)}_isValidIndex(t){return t>-1&&(!this.steps||t<this.steps.length)}static \u0275fac=function(i){return new(i||e)};static \u0275dir=x({type:e,selectors:[["","cdkStepper",""]],contentQueries:function(i,n,a){if(i&1&&E(a,dt,5)(a,Rt,5),i&2){let s;u(s=g())&&(n._steps=s),u(s=g())&&(n._stepHeader=s)}},inputs:{linear:[2,"linear","linear",j],selectedIndex:[2,"selectedIndex","selectedIndex",ie],selected:"selected",orientation:"orientation"},outputs:{selectionChange:"selectionChange",selectedIndexChange:"selectedIndexChange"},exportAs:["cdkStepper"]})}return e})();var we=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=b({type:e});static \u0275inj=f({imports:[k]})}return e})();var Te=(e,r,t)=>({index:e,active:r,optional:t});function Oe(e,r){if(e&1&&y(0,2),e&2){let t=l();p("ngTemplateOutlet",t.iconOverrides[t.state])("ngTemplateOutletContext",te(2,Te,t.index,t.active,t.optional))}}function Ae(e,r){if(e&1&&(d(0,"span",7),T(1),m()),e&2){let t=l(2);o(),O(t._getDefaultTextForState(t.state))}}function ze(e,r){if(e&1&&(d(0,"span",8),T(1),m()),e&2){let t=l(3);o(),O(t._intl.completedLabel)}}function Le(e,r){if(e&1&&(d(0,"span",8),T(1),m()),e&2){let t=l(3);o(),O(t._intl.editableLabel)}}function Fe(e,r){if(e&1&&(h(0,ze,2,1,"span",8)(1,Le,2,1,"span",8),d(2,"mat-icon",7),T(3),m()),e&2){let t=l(2);_(t.state==="done"?0:t.state==="edit"?1:-1),o(3),O(t._getDefaultTextForState(t.state))}}function Re(e,r){if(e&1&&h(0,Ae,2,1,"span",7)(1,Fe,4,2),e&2){let t,i=l();_((t=i.state)==="number"?0:1)}}function Pe(e,r){e&1&&(d(0,"div",4),y(1,9),m()),e&2&&(o(),p("ngTemplateOutlet",r.template))}function Be(e,r){if(e&1&&(d(0,"div",4),T(1),m()),e&2){let t=l();o(),O(t.label)}}function Ne(e,r){if(e&1&&(d(0,"div",5),T(1),m()),e&2){let t=l();o(),O(t._intl.optionalLabel)}}function je(e,r){if(e&1&&(d(0,"div",6),T(1),m()),e&2){let t=l();o(),O(t.errorMessage)}}var ke=["*"];function He(e,r){}function Ve(e,r){if(e&1&&(I(0),G(1,He,0,0,"ng-template",0)),e&2){let t=l();o(),p("cdkPortalOutlet",t._portal)}}var Qe=["animatedContainer"],Ce=e=>({steps:e}),Me=e=>({step:e});function Ge(e,r){e&1&&I(0)}function qe(e,r){if(e&1&&(d(0,"div",5),y(1,9)(2,6),m()),e&2){let t=l(2),i=N(6);o(),p("ngTemplateOutlet",t.headerPrefix()),o(),p("ngTemplateOutlet",i)("ngTemplateOutletContext",W(3,Ce,t.steps))}}function We(e,r){if(e&1&&y(0,6),e&2){let t=l(2),i=N(6);p("ngTemplateOutlet",i)("ngTemplateOutletContext",W(2,Ce,t.steps))}}function Ze(e,r){if(e&1&&(d(0,"div",10,2),y(2,9),m()),e&2){let t=r.$implicit,i=r.$index,n=l(2);at("mat-horizontal-stepper-content-"+n._getAnimationDirection(i)),p("id",n._getStepContentId(i)),M("aria-labelledby",n._getStepLabelId(i))("inert",n.selectedIndex===i?null:""),o(2),p("ngTemplateOutlet",t.content)}}function Ue(e,r){if(e&1&&(d(0,"div",3),h(1,qe,3,5,"div",5)(2,We,1,4,"ng-container",6),d(3,"div",7),et(4,Ze,3,6,"div",8,tt),m()()),e&2){let t=l();o(),_(t.headerPrefix()?1:2),o(3),it(t.steps)}}function $e(e,r){if(e&1&&y(0,9),e&2){let t=l(2);p("ngTemplateOutlet",t.headerPrefix())}}function Ke(e,r){if(e&1&&(d(0,"div",11),y(1,6),d(2,"div",12,2)(4,"div",13)(5,"div",14),y(6,9),m()()()()),e&2){let t=r.$implicit,i=r.$index,n=r.$index,a=r.$count,s=l(2),pt=N(4);o(),p("ngTemplateOutlet",pt)("ngTemplateOutletContext",W(11,Me,t)),o(),w("mat-stepper-vertical-line",n!==a-1)("mat-vertical-content-container-active",s.selectedIndex===i),M("inert",s.selectedIndex===i?null:"")("aria-label",s.ariaLabel),o(2),p("id",s._getStepContentId(i)),M("aria-labelledby",s._getStepLabelId(i)),o(2),p("ngTemplateOutlet",t.content)}}function Ye(e,r){if(e&1&&(d(0,"div",4),h(1,$e,1,1,"ng-container",9),et(2,Ke,7,13,"div",11,tt),m()),e&2){let t=l();o(),_(t.headerPrefix()?1:-1),o(),it(t.steps)}}function Xe(e,r){if(e&1){let t=_t();d(0,"mat-step-header",15),P("click",function(){let n=Y(t).step;return X(n.select())})("keydown",function(n){Y(t);let a=l();return X(a._onKeydown(n))}),m()}if(e&2){let t=r.step,i=l();w("mat-horizontal-stepper-header",i.orientation==="horizontal")("mat-vertical-stepper-header",i.orientation==="vertical"),p("tabIndex",i._getFocusIndex()===t.index()?0:-1)("id",i._getStepLabelId(t.index()))("index",t.index())("state",t.indicatorType())("label",t.stepLabel||t.label)("selected",t.isSelected())("active",t.isNavigable())("optional",t.optional)("errorMessage",t.errorMessage)("iconOverrides",i._iconOverrides)("disableRipple",i.disableRipple||!t.isNavigable())("color",t.color||i.color),M("role",i.orientation==="horizontal"?"tab":"button")("aria-posinset",i.orientation==="horizontal"?t.index()+1:null)("aria-setsize",i.orientation==="horizontal"?i.steps.length:null)("aria-selected",i.orientation==="horizontal"?t.isSelected():null)("aria-current",i.orientation==="vertical"&&t.isSelected()?"step":null)("aria-disabled",i.orientation==="vertical"&&t.isSelected()?"true":null)("aria-expanded",i.orientation==="vertical"?t.isSelected():null)("aria-controls",i._getStepContentId(t.index()))("aria-label",t.ariaLabel||null)("aria-labelledby",!t.ariaLabel&&t.ariaLabelledby?t.ariaLabelledby:null)("aria-disabled",t.isNavigable()?null:!0)}}function Je(e,r){e&1&&nt(0,"div",17)}function ti(e,r){if(e&1&&(y(0,6),h(1,Je,1,0,"div",17)),e&2){let t=r.$implicit,i=r.$index,n=r.$count;l(2);let a=N(4);p("ngTemplateOutlet",a)("ngTemplateOutletContext",W(3,Me,t)),o(),_(i!==n-1?1:-1)}}function ei(e,r){if(e&1&&(d(0,"div",16),et(1,ti,2,5,null,null,tt),m()),e&2){let t=r.steps,i=l();M("aria-label",i.ariaLabel),o(),it(t)}}var Bt=(()=>{class e extends Pt{static \u0275fac=(()=>{let t;return function(n){return(t||(t=H(e)))(n||e)}})();static \u0275dir=x({type:e,selectors:[["","matStepLabel",""]],features:[z]})}return e})(),ii=(()=>{class e{changes=new K;optionalLabel="Optional";completedLabel="Completed";editableLabel="Editable";static \u0275fac=function(i){return new(i||e)};static \u0275prov=ht({token:e,factory:e.\u0275fac})}return e})(),Nt=(()=>{class e extends Rt{_intl=c(ii);_focusMonitor=c(oe);_intlSubscription;state;label;errorMessage;iconOverrides;index;selected=!1;active=!1;optional=!1;disableRipple=!1;color;constructor(){super();let t=c(se);t.load(fe),t.load(le);let i=c(st);this._intlSubscription=this._intl.changes.subscribe(()=>i.markForCheck())}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0)}ngOnDestroy(){this._intlSubscription.unsubscribe(),this._focusMonitor.stopMonitoring(this._elementRef)}focus(t,i){t?this._focusMonitor.focusVia(this._elementRef,t,i):this._elementRef.nativeElement.focus(i)}_stringLabel(){return this.label instanceof Bt?null:this.label}_templateLabel(){return this.label instanceof Bt?this.label:null}_getHostElement(){return this._elementRef.nativeElement}_getDefaultTextForState(t){return t=="number"?`${this.index+1}`:t=="edit"?"create":t=="error"?"warning":t}_hasEmptyLabel(){return!this._stringLabel()&&!this._templateLabel()&&!this._hasOptionalLabel()&&!this._hasErrorLabel()}_hasOptionalLabel(){return this.optional&&this.state!=="error"}_hasErrorLabel(){return this.state==="error"}static \u0275fac=function(i){return new(i||e)};static \u0275cmp=C({type:e,selectors:[["mat-step-header"]],hostAttrs:["role","",1,"mat-step-header"],hostVars:4,hostBindings:function(i,n){i&2&&(at("mat-"+(n.color||"primary")),w("mat-step-header-empty-label",n._hasEmptyLabel()))},inputs:{state:"state",label:"label",errorMessage:"errorMessage",iconOverrides:"iconOverrides",index:"index",selected:"selected",active:"active",optional:"optional",disableRipple:"disableRipple",color:"color"},features:[z],decls:10,vars:17,consts:[["matRipple","",1,"mat-step-header-ripple","mat-focus-indicator",3,"matRippleTrigger","matRippleDisabled"],[1,"mat-step-icon-content"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-step-label"],[1,"mat-step-text-label"],[1,"mat-step-optional"],[1,"mat-step-sub-label-error"],["aria-hidden","true"],[1,"cdk-visually-hidden"],[3,"ngTemplateOutlet"]],template:function(i,n){if(i&1&&(nt(0,"div",0),d(1,"div")(2,"div",1),h(3,Oe,1,6,"ng-container",2)(4,Re,2,1),m()(),d(5,"div",3),h(6,Pe,2,1,"div",4)(7,Be,2,1,"div",4),h(8,Ne,2,1,"div",5),h(9,je,2,1,"div",6),m()),i&2){let a;p("matRippleTrigger",n._getHostElement())("matRippleDisabled",n.disableRipple),o(),at(Jt("mat-step-icon-state-",n.state," mat-step-icon")),w("mat-step-icon-selected",n.selected),o(2),_(n.iconOverrides&&n.iconOverrides[n.state]?3:4),o(2),w("mat-step-label-active",n.active)("mat-step-label-selected",n.selected)("mat-step-label-error",n.state=="error"),o(),_((a=n._templateLabel())?6:n._stringLabel()?7:-1,a),o(2),_(n._hasOptionalLabel()?8:-1),o(),_(n._hasErrorLabel()?9:-1)}},dependencies:[ge,gt,_e],styles:[`.mat-step-header {
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
`],encapsulation:2})}return e})(),ni=(()=>{class e{templateRef=c(R);name;static \u0275fac=function(i){return new(i||e)};static \u0275dir=x({type:e,selectors:[["ng-template","matStepperIcon",""]],inputs:{name:[0,"matStepperIcon","name"]}})}return e})(),ai=(()=>{class e{_template=c(R);static \u0275fac=function(i){return new(i||e)};static \u0275dir=x({type:e,selectors:[["ng-template","matStepContent",""]]})}return e})(),ri=(()=>{class e extends dt{_errorStateMatcher=c(lt,{skipSelf:!0});_viewContainerRef=c(Yt);_isSelected=Gt.EMPTY;stepLabel=void 0;color;_lazyContent;_portal;ngAfterContentInit(){this._isSelected=this._stepper.steps.changes.pipe(Zt(()=>this._stepper.selectionChange.pipe(Wt(t=>t.selectedStep===this),A(this._stepper.selected===this)))).subscribe(t=>{t&&this._lazyContent&&!this._portal&&(this._portal=new ve(this._lazyContent._template,this._viewContainerRef))})}ngOnDestroy(){this._isSelected.unsubscribe()}isErrorState(t,i){let n=this._errorStateMatcher.isErrorState(t,i),a=!!(t&&t.invalid&&this.interacted);return n||a}static \u0275fac=(()=>{let t;return function(n){return(t||(t=H(e)))(n||e)}})();static \u0275cmp=C({type:e,selectors:[["mat-step"]],contentQueries:function(i,n,a){if(i&1&&E(a,Bt,5)(a,ai,5),i&2){let s;u(s=g())&&(n.stepLabel=s.first),u(s=g())&&(n._lazyContent=s.first)}},hostAttrs:["hidden",""],inputs:{color:"color"},exportAs:["matStep"],features:[q([{provide:lt,useExisting:e},{provide:dt,useExisting:e}]),z],ngContentSelectors:ke,decls:1,vars:0,consts:[[3,"cdkPortalOutlet"]],template:function(i,n){i&1&&(D(),G(0,Ve,2,1,"ng-template"))},dependencies:[xe],encapsulation:2})}return e})(),oi=(()=>{class e extends mt{_ngZone=c($t);_renderer=c(Kt);_animationsDisabled=he();_cleanupTransition;_isAnimating=v(!1);_stepHeader=void 0;_animatedContainers;_steps=void 0;steps=new Q;_icons;animationDone=new F;disableRipple=!1;color;labelPosition="end";headerPosition="top";ariaLabel=null;headerPrefix=ee(null);_iconOverrides={};get animationDuration(){return this._animationDuration}set animationDuration(t){this._animationDuration=/^\d+$/.test(t)?t+"ms":t}_animationDuration="";_isServer=!c(re).isBrowser;constructor(){super();let i=c(V).nativeElement.nodeName.toLowerCase();this.orientation=i==="mat-vertical-stepper"?"vertical":"horizontal"}ngAfterContentInit(){super.ngAfterContentInit(),this._icons.forEach(({name:t,templateRef:i})=>this._iconOverrides[t]=i),this.steps.changes.pipe(S(this._destroyed)).subscribe(()=>this._stateChanged()),this.selectedIndexChange.pipe(S(this._destroyed)).subscribe(()=>{let t=this._getAnimationDuration();t==="0ms"||t==="0s"?this._onAnimationDone():this._isAnimating.set(!0)}),this._ngZone.runOutsideAngular(()=>{this._animationsDisabled||setTimeout(()=>{this._elementRef.nativeElement.classList.add("mat-stepper-animations-enabled"),this._cleanupTransition=this._renderer.listen(this._elementRef.nativeElement,"transitionend",this._handleTransitionend)},200)})}ngAfterViewInit(){if(super.ngAfterViewInit(),typeof queueMicrotask=="function"){let t=!1;this._animatedContainers.changes.pipe(A(null),S(this._destroyed)).subscribe(()=>queueMicrotask(()=>{t||(t=!0,this.animationDone.emit()),this._stateChanged()}))}}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTransition?.()}_getAnimationDuration(){return this._animationsDisabled?"0ms":this.animationDuration?this.animationDuration:this.orientation==="horizontal"?"500ms":"225ms"}_handleTransitionend=t=>{let i=t.target;if(!i)return;let n=this.orientation==="horizontal"&&t.propertyName==="transform"&&i.classList.contains("mat-horizontal-stepper-content-current"),a=this.orientation==="vertical"&&t.propertyName==="grid-template-rows"&&i.classList.contains("mat-vertical-content-container-active");(n||a)&&this._animatedContainers.find(pt=>pt.nativeElement===i)&&this._onAnimationDone()};_onAnimationDone(){this._isAnimating.set(!1),this.animationDone.emit()}static \u0275fac=function(i){return new(i||e)};static \u0275cmp=C({type:e,selectors:[["mat-stepper"],["mat-vertical-stepper"],["mat-horizontal-stepper"],["","matStepper",""]],contentQueries:function(i,n,a){if(i&1&&E(a,ri,5)(a,ni,5),i&2){let s;u(s=g())&&(n._steps=s),u(s=g())&&(n._icons=s)}},viewQuery:function(i,n){if(i&1&&B(Nt,5)(Qe,5),i&2){let a;u(a=g())&&(n._stepHeader=a),u(a=g())&&(n._animatedContainers=a)}},hostVars:14,hostBindings:function(i,n){i&2&&(ut("--mat-stepper-animation-duration",n._getAnimationDuration()),w("mat-stepper-horizontal",n.orientation==="horizontal")("mat-stepper-vertical",n.orientation==="vertical")("mat-stepper-label-position-end",n.orientation==="horizontal"&&n.labelPosition=="end")("mat-stepper-label-position-bottom",n.orientation==="horizontal"&&n.labelPosition=="bottom")("mat-stepper-header-position-bottom",n.headerPosition==="bottom")("mat-stepper-animating",n._isAnimating()))},inputs:{disableRipple:"disableRipple",color:"color",labelPosition:"labelPosition",headerPosition:"headerPosition",ariaLabel:[0,"aria-label","ariaLabel"],headerPrefix:[1,"headerPrefix"],animationDuration:"animationDuration"},outputs:{animationDone:"animationDone"},exportAs:["matStepper","matVerticalStepper","matHorizontalStepper"],features:[q([{provide:mt,useExisting:e}]),z],ngContentSelectors:ke,decls:7,vars:2,consts:[["stepTemplate",""],["horizontalStepsTemplate",""],["animatedContainer",""],[1,"mat-horizontal-stepper-wrapper"],[1,"mat-vertical-stepper-wrapper"],[1,"mat-horizontal-stepper-header-wrapper"],[3,"ngTemplateOutlet","ngTemplateOutletContext"],[1,"mat-horizontal-content-container"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id","class"],[3,"ngTemplateOutlet"],["role","tabpanel",1,"mat-horizontal-stepper-content",3,"id"],[1,"mat-step"],[1,"mat-vertical-content-container"],["role","region",1,"mat-vertical-stepper-content",3,"id"],[1,"mat-vertical-content"],[3,"click","keydown","tabIndex","id","index","state","label","selected","active","optional","errorMessage","iconOverrides","disableRipple","color"],["aria-orientation","horizontal","role","tablist",1,"mat-horizontal-stepper-header-container"],[1,"mat-stepper-horizontal-line"]],template:function(i,n){if(i&1&&(D(),h(0,Ge,1,0),h(1,Ue,6,1,"div",3)(2,Ye,4,1,"div",4),G(3,Xe,1,27,"ng-template",null,0,rt)(5,ei,3,1,"ng-template",null,1,rt)),i&2){let a;_(n._isServer?0:-1),o(),_((a=n.orientation)==="horizontal"?1:a==="vertical"?2:-1)}},dependencies:[gt,Nt],styles:[`.mat-stepper-vertical,
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
`],encapsulation:2})}return e})();var jt=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=b({type:e});static \u0275inj=f({providers:[lt],imports:[ye,we,Z,ct,oi,Nt,k]})}return e})();var Ht=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=b({type:e});static \u0275inj=f({imports:[kt,k,kt]})}return e})();var Vt=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=b({type:e});static \u0275inj=f({imports:[k]})}return e})();var Qt=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=b({type:e});static \u0275inj=f({imports:[ce,ct,be,k,U]})}return e})();var $n=(()=>{class e{static{this.\u0275fac=function(i){return new(i||e)}}static{this.\u0275mod=b({type:e})}static{this.\u0275inj=f({imports:[ne,bt,vt,xt,It,Et,Ot,Tt,wt,Ct,jt,Mt,U,Z,St,Ht,At,yt,zt,Vt,Lt,Dt,Ft,Qt,bt,vt,xt,It,Et,Ot,Tt,wt,Ct,jt,Mt,U,Z,St,Ht,At,yt,zt,Vt,Lt,Dt,Ft,Qt]})}}return e})();export{$n as a};
