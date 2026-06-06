import{a as ye,b as Me,c as we,d as xe}from"./chunk-I2RUGYWC.js";import{a as be,b as he,c as ge,e as ve}from"./chunk-CIGWAZRR.js";import{a as Se}from"./chunk-NPNHSHKH.js";import{a as ae,b as le,c as se,d as ce,e as me,f as de,g as ue}from"./chunk-VWEQTWTR.js";import{a as pe,g as fe,na as Ce,oa as De}from"./chunk-XCTDW4T3.js";import{$ as j,$a as F,C as I,Cb as Q,Ea as A,Eb as D,Hb as $,Ib as S,Jb as J,La as d,Lb as W,Mb as G,Oc as T,Pa as L,Qb as Z,Qc as ee,Sb as K,Sc as te,Tb as X,Tc as oe,Ub as p,Vb as k,Vc as ne,Wc as re,X as y,Xc as ie,_ as R,_a as g,ab as P,ca as h,da as a,ha as E,hc as Y,ia as N,kc as v,lb as x,ma as u,mb as q,na as M,nb as U,ob as B,qb as V,rb as z,s as _,sb as C,ta as f,tb as l,ub as s,va as O,vb as H,ya as w}from"./chunk-W2T3HXNB.js";function ke(e,i){let t=!i?.manualCleanup?i?.injector?.get(M)??a(M):null,n=Oe(i?.equal),r;i?.requireSync?r=f({kind:0},{equal:n}):r=f({kind:1,value:i?.initialValue},{equal:n});let c,b=e.subscribe({next:m=>r.set({kind:1,value:m}),error:m=>{r.set({kind:2,error:m}),c?.()},complete:()=>{c?.()}});if(i?.requireSync&&r().kind===0)throw new y(601,!1);return c=t?.onDestroy(b.unsubscribe.bind(b)),v(()=>{let m=r();switch(m.kind){case 1:return m.value;case 2:throw m.error;case 0:throw new y(601,!1)}},{equal:i?.equal})}function Oe(e=Object.is){return(i,o)=>i.kind===1&&o.kind===1&&e(i.value,o.value)}var Ae=["*",[["mat-toolbar-row"]]],Le=["*","mat-toolbar-row"],Fe=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275dir=P({type:e,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return e})(),_e=(()=>{class e{_elementRef=a(A);_platform=a(pe);_document=a(u);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()))}_checkToolbarMixedModes(){this._toolbarRows.length}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=g({type:e,selectors:[["mat-toolbar"]],contentQueries:function(t,n,r){if(t&1&&J(r,Fe,5),t&2){let c;W(c=G())&&(n._toolbarRows=c)}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(t,n){t&2&&(X(n.color?"mat-"+n.color:""),K("mat-toolbar-multiple-rows",n._toolbarRows.length>0)("mat-toolbar-single-row",n._toolbarRows.length===0))},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:Le,decls:2,vars:0,template:function(t,n){t&1&&($(Ae),S(0),S(1,1))},styles:[`.mat-toolbar {
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
`],encapsulation:2})}return e})();var Ie=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=F({type:e});static \u0275inj=j({imports:[fe]})}return e})();var Re=(()=>{class e{constructor(o,t,n){if(this.document=o,this.platformId=t,this.theme=f("dark"),this.renderer=n.createRenderer(null,null),T(this.platformId)){let r=localStorage.getItem("theme");r?this.theme.set(r):(localStorage.setItem("theme","dark"),this.theme.set("dark"))}w(()=>{T(this.platformId)&&(localStorage.setItem("theme",this.theme()),this.renderer.removeClass(this.document.body,this.theme()==="dark"?"light-theme":"dark-theme"),this.renderer.addClass(this.document.body,this.theme()==="dark"?"dark-theme":"light-theme"))})}toggleTheme(){this.theme.update(o=>o==="light"?"dark":"light")}static{this.\u0275fac=function(t){return new(t||e)(h(u),h(O),h(L))}}static{this.\u0275prov=R({token:e,factory:e.\u0275fac,providedIn:"root"})}}return e})();function qe(e,i){e&1&&(l(0,"mat-icon"),p(1,"light_mode"),s())}function Ue(e,i){e&1&&(l(0,"mat-icon"),p(1,"dark_mode"),s())}function Be(e,i){if(e&1&&(l(0,"button",9)(1,"mat-icon",10),p(2),s()()),e&2){let o=i.$implicit;C("routerLink",o.link)("matTooltip",o.label)("matTooltipPosition","right"),x("aria-label",o.label+" Icon Button"),d(),x("aria-label",o.label+" Icon"),d(),k(o.icon)}}var je=(()=>{class e{constructor(){this.routingList=[{link:"/",label:"Home",icon:"home"},{link:"/calculator",label:"Calculator",icon:"calculate"},{link:"/json-to-typescript",label:"JSON to TypeScript",icon:"code"}],this.document=a(u),this.globalData=a(Se),this.themeService=a(Re),this.router=a(se),this.isDarkMode=v(()=>this.themeService.theme()==="dark"),this.activeRouteLabel=ke(this.router.events.pipe(I(o=>o instanceof ae),_(o=>{let t=o.urlAfterRedirects.split("?")[0],n=this.routingList.find(r=>r.link===t);return n?.label==="Home"?"":n?.label||""})),{initialValue:""})}toggleTheme(){this.themeService.toggleTheme()}loadStyle(o){let t=this.document.getElementsByTagName("head")[0],n=this.document.createElement("link");n.rel="stylesheet",n.href=`${o}`,t.appendChild(n)}ngOnInit(){setTimeout(()=>{this.loadStyle("custom.css"),this.loadStyle("bootstrap.css"),this.loadStyle("border.css"),this.loadStyle("colors.css"),this.loadStyle("text.css")},0),this.document.title=this.globalData.resume.basics.name+" || "+this.globalData.resume.basics.jobtitle}static{this.\u0275fac=function(t){return new(t||e)}}static{this.\u0275cmp=g({type:e,selectors:[["app-root"]],decls:19,vars:3,consts:[["sidenav",""],["data-layout","row","data-layout-align","space-between center",1,"pl-0"],["data-layout","row","data-layout-align","space-between center"],["mat-icon-button","","aria-label","Example icon-button with menu icon",1,"example-icon",3,"click"],[1,"ml-2"],["mat-icon-button","",1,"ml-2","left-0",3,"click","matTooltip"],["autosize","",1,"mainContainer"],["mode","side",1,"mainSideNav"],[1,"buttonList","pt-3"],["mat-icon-button","",1,"mb-5",3,"routerLink","matTooltip","matTooltipPosition"],["aria-hidden","false"]],template:function(t,n){if(t&1){let r=Q();l(0,"mat-toolbar",1)(1,"div",2)(2,"button",3),D("click",function(){E(r);let b=Z(12);return N(b.toggle())}),l(3,"mat-icon"),p(4,"menu"),s()(),l(5,"span",4),p(6),s()(),l(7,"button",5),D("click",function(){return n.toggleTheme()}),q(8,qe,2,0,"mat-icon")(9,Ue,2,0,"mat-icon"),s()(),l(10,"mat-sidenav-container",6)(11,"mat-sidenav",7,0)(13,"div",8),V(14,Be,3,6,"button",9,B),s()(),l(16,"mat-sidenav-content")(17,"div"),H(18,"router-outlet"),s()()()}t&2&&(d(6),k(n.activeRouteLabel()),d(),C("matTooltip",n.isDarkMode()?"Switch to Light Mode":"Switch to Dark Mode"),d(),U(n.isDarkMode()?8:9),d(6),z(n.routingList))},dependencies:[le,ce,Ie,_e,he,be,ve,ge,xe,Me,we,ye,De,Ce],styles:[".mainContainer[_ngcontent-%COMP%]   .buttonList[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex-wrap:nowrap;align-items:center}.mainContainer[_ngcontent-%COMP%]   mat-sidenav-content[_ngcontent-%COMP%]{height:calc(100vh - 64px)}"],changeDetection:1})}}return e})();var Ee=[{path:"calculator",loadComponent:()=>import("./chunk-PWSQBHVC.js").then(e=>e.CalculatorComponent)},{path:"formbuilder",loadChildren:()=>import("./chunk-2PCIA7HL.js").then(e=>e.FormbuilderModule)},{path:"json-to-typescript",loadComponent:()=>import("./chunk-LVXYXSNH.js").then(e=>e.JsonToTypeScriptComponent)},{path:"",loadComponent:()=>import("./chunk-IJQLR66Q.js").then(e=>e.PortfolioComponent)}];var Ne={providers:[Y(),te(oe()),de(Ee,ue(me)),ie(ne(),re())]};ee(je,Ne).catch(e=>console.error(e));
