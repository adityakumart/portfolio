import{a as U,g as F}from"./chunk-35IF4YOY.js";import{l as g}from"./chunk-OTPZF74S.js";import{$ as w,Da as b,Jc as q,Ka as k,Kc as p,Y as f,aa as x,cc as T,da as d,dc as h,ea as l,ec as S,gc as O,hb as j,hc as _,j as y,na as M,nc as E,oa as m,oc as N,pa as u,ub as C,va as c,vb as I,wb as R,ya as D}from"./chunk-FI7P6V47.js";function oe(e,a){let o=a?.injector??l(M),t=new y(1),n=b(()=>{let r;try{r=e()}catch(i){p(()=>t.error(i));return}p(()=>t.next(r))},{injector:o,manualCleanup:!0});return o.get(u).onDestroy(()=>{n.destroy(),t.complete()}),t.asObservable()}function ne(e,a){let t=!a?.manualCleanup?a?.injector?.get(u)??l(u):null,n=A(a?.equal),r;a?.requireSync?r=c({kind:0},{equal:n}):r=c({kind:1,value:a?.initialValue},{equal:n});let i,v=e.subscribe({next:s=>r.set({kind:1,value:s}),error:s=>{r.set({kind:2,error:s}),i?.()},complete:()=>{i?.()}});if(a?.requireSync&&r().kind===0)throw new f(601,!1);return i=t?.onDestroy(v.unsubscribe.bind(v)),q(()=>{let s=r();switch(s.kind){case 1:return s.value;case 2:throw s.error;case 0:throw new f(601,!1)}},{equal:a?.equal})}function A(e=Object.is){return(a,o)=>a.kind===1&&o.kind===1&&e(a.value,o.value)}var z=["*",[["mat-toolbar-row"]]],B=["*","mat-toolbar-row"],P=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275dir=R({type:e,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return e})(),he=(()=>{class e{_elementRef=l(k);_platform=l(U);_document=l(m);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()))}_checkToolbarMixedModes(){this._toolbarRows.length}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=C({type:e,selectors:[["mat-toolbar"]],contentQueries:function(t,n,r){if(t&1&&S(r,P,5),t&2){let i;O(i=_())&&(n._toolbarRows=i)}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(t,n){t&2&&(N(n.color?"mat-"+n.color:""),E("mat-toolbar-multiple-rows",n._toolbarRows.length>0)("mat-toolbar-single-row",n._toolbarRows.length===0))},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:B,decls:2,vars:0,template:function(t,n){t&1&&(T(z),h(0),h(1,1))},styles:[`.mat-toolbar {
  background: var(--mat-toolbar-container-background-color, var(--mat-sys-surface));
  color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}
.mat-toolbar, .mat-toolbar h1, .mat-toolbar h2, .mat-toolbar h3, .mat-toolbar h4, .mat-toolbar h5, .mat-toolbar h6 {
  font-family: var(--mat-toolbar-title-text-font, var(--mat-sys-title-large-font));
  font-size: var(--mat-toolbar-title-text-size, var(--mat-sys-title-large-size));
  line-height: var(--mat-toolbar-title-text-line-height, var(--mat-sys-title-large-line-height));
  font-weight: var(--mat-toolbar-title-text-weight, var(--mat-sys-title-large-weight));
  letter-spacing: var(--mat-toolbar-title-text-tracking, var(--mat-sys-title-large-tracking));
  margin: 0;
}
@media (forced-colors: active) {
  .mat-toolbar {
    outline: solid 1px;
  }
}
.mat-toolbar .mat-form-field-underline,
.mat-toolbar .mat-form-field-ripple,
.mat-toolbar .mat-focused .mat-form-field-ripple {
  background-color: currentColor;
}
.mat-toolbar .mat-form-field-label,
.mat-toolbar .mat-focused .mat-form-field-label,
.mat-toolbar .mat-select-value,
.mat-toolbar .mat-select-arrow,
.mat-toolbar .mat-form-field.mat-focused .mat-select-arrow {
  color: inherit;
}
.mat-toolbar .mat-input-element {
  caret-color: currentColor;
}
.mat-toolbar .mat-mdc-button-base.mat-mdc-button-base.mat-unthemed {
  --mat-button-text-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
  --mat-button-outlined-label-text-color: var(--mat-toolbar-container-text-color, var(--mat-sys-on-surface));
}

.mat-toolbar-row, .mat-toolbar-single-row {
  display: flex;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-row, .mat-toolbar-single-row {
    height: var(--mat-toolbar-mobile-height, 56px);
  }
}

.mat-toolbar-multiple-rows {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  min-height: var(--mat-toolbar-standard-height, 64px);
}
@media (max-width: 599px) {
  .mat-toolbar-multiple-rows {
    min-height: var(--mat-toolbar-mobile-height, 56px);
  }
}
`],encapsulation:2})}return e})();var pe=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=I({type:e});static \u0275inj=x({imports:[F]})}return e})();var Me=(()=>{class e{constructor(o,t,n){if(this.document=o,this.platformId=t,this.theme=c("dark"),this.renderer=n.createRenderer(null,null),g(this.platformId)){let r=localStorage.getItem("theme");r?this.theme.set(r):(localStorage.setItem("theme","dark"),this.theme.set("dark"))}b(()=>{g(this.platformId)&&(localStorage.setItem("theme",this.theme()),this.renderer.removeClass(this.document.body,this.theme()==="dark"?"light-theme":"dark-theme"),this.renderer.addClass(this.document.body,this.theme()==="dark"?"dark-theme":"light-theme"))})}toggleTheme(){this.theme.update(o=>o==="light"?"dark":"light")}static{this.\u0275fac=function(t){return new(t||e)(d(m),d(D),d(j))}}static{this.\u0275prov=w({token:e,factory:e.\u0275fac,providedIn:"root"})}}return e})();var ke=[{link:"/",label:"Home",icon:"home"},{link:"/calculator",label:"Calculator",icon:"calculate"},{link:"/json-to-typescript",label:"JSON to TypeScript",icon:"code"},{link:"/line-splitter",label:"Line Splitter",icon:"format_list_numbered"},{link:"/user",label:"User",icon:"account_circle"}];export{oe as a,ne as b,he as c,pe as d,Me as e,ke as f};
