import{S,f as F}from"./chunk-JRFUG22Z.js";import{Eb as _,Fb as h,Gb as g,Ib as p,Jb as y,Pb as D,Qb as w,Ua as u,Va as d,Wa as b,_ as c,ca as l,la as f,xa as m}from"./chunk-NUWCA4GH.js";var C=["*",[["mat-toolbar-row"]]],R=["*","mat-toolbar-row"],T=(()=>{class o{static \u0275fac=function(e){return new(e||o)};static \u0275dir=b({type:o,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return o})(),B=(()=>{class o{_elementRef=l(m);_platform=l(F);_document=l(f);color;_toolbarRows;constructor(){}ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()))}_checkToolbarMixedModes(){this._toolbarRows.length}static \u0275fac=function(e){return new(e||o)};static \u0275cmp=u({type:o,selectors:[["mat-toolbar"]],contentQueries:function(e,n,i){if(e&1&&g(i,T,5),e&2){let s;p(s=y())&&(n._toolbarRows=s)}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(e,n){e&2&&(w(n.color?"mat-"+n.color:""),D("mat-toolbar-multiple-rows",n._toolbarRows.length>0)("mat-toolbar-single-row",n._toolbarRows.length===0))},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:R,decls:2,vars:0,template:function(e,n){e&1&&(_(C),h(0),h(1,1))},styles:[`.mat-toolbar {
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
`],encapsulation:2,changeDetection:0})}return o})();var U=(()=>{class o{static \u0275fac=function(e){return new(e||o)};static \u0275mod=d({type:o});static \u0275inj=c({imports:[S]})}return o})();var a=(function(o){return o[o.State=0]="State",o[o.Transition=1]="Transition",o[o.Sequence=2]="Sequence",o[o.Group=3]="Group",o[o.Animate=4]="Animate",o[o.Keyframes=5]="Keyframes",o[o.Style=6]="Style",o[o.Trigger=7]="Trigger",o[o.Reference=8]="Reference",o[o.AnimateChild=9]="AnimateChild",o[o.AnimateRef=10]="AnimateRef",o[o.Query=11]="Query",o[o.Stagger=12]="Stagger",o})(a||{}),V="*";function G(o,t){return{type:a.Trigger,name:o,definitions:t,options:{}}}function Y(o,t=null){return{type:a.Animate,styles:t,timings:o}}function H(o,t=null){return{type:a.Sequence,steps:o,options:t}}function J(o){return{type:a.Style,styles:o,offset:null}}function W(o,t,r=null){return{type:a.Transition,expr:o,animation:t,options:r}}var x=class{_onDoneFns=[];_onStartFns=[];_onDestroyFns=[];_originalOnDoneFns=[];_originalOnStartFns=[];_started=!1;_destroyed=!1;_finished=!1;_position=0;parentPlayer=null;totalTime;constructor(t=0,r=0){this.totalTime=t+r}_onFinish(){this._finished||(this._finished=!0,this._onDoneFns.forEach(t=>t()),this._onDoneFns=[])}onStart(t){this._originalOnStartFns.push(t),this._onStartFns.push(t)}onDone(t){this._originalOnDoneFns.push(t),this._onDoneFns.push(t)}onDestroy(t){this._onDestroyFns.push(t)}hasStarted(){return this._started}init(){}play(){this.hasStarted()||(this._onStart(),this.triggerMicrotask()),this._started=!0}triggerMicrotask(){queueMicrotask(()=>this._onFinish())}_onStart(){this._onStartFns.forEach(t=>t()),this._onStartFns=[]}pause(){}restart(){}finish(){this._onFinish()}destroy(){this._destroyed||(this._destroyed=!0,this.hasStarted()||this._onStart(),this.finish(),this._onDestroyFns.forEach(t=>t()),this._onDestroyFns=[])}reset(){this._started=!1,this._finished=!1,this._onStartFns=this._originalOnStartFns,this._onDoneFns=this._originalOnDoneFns}setPosition(t){this._position=this.totalTime?t*this.totalTime:1}getPosition(){return this.totalTime?this._position/this.totalTime:1}triggerCallback(t){let r=t=="start"?this._onStartFns:this._onDoneFns;r.forEach(e=>e()),r.length=0}},v=class{_onDoneFns=[];_onStartFns=[];_finished=!1;_started=!1;_destroyed=!1;_onDestroyFns=[];parentPlayer=null;totalTime=0;players;constructor(t){this.players=t;let r=0,e=0,n=0,i=this.players.length;i==0?queueMicrotask(()=>this._onFinish()):this.players.forEach(s=>{s.onDone(()=>{++r==i&&this._onFinish()}),s.onDestroy(()=>{++e==i&&this._onDestroy()}),s.onStart(()=>{++n==i&&this._onStart()})}),this.totalTime=this.players.reduce((s,E)=>Math.max(s,E.totalTime),0)}_onFinish(){this._finished||(this._finished=!0,this._onDoneFns.forEach(t=>t()),this._onDoneFns=[])}init(){this.players.forEach(t=>t.init())}onStart(t){this._onStartFns.push(t)}_onStart(){this.hasStarted()||(this._started=!0,this._onStartFns.forEach(t=>t()),this._onStartFns=[])}onDone(t){this._onDoneFns.push(t)}onDestroy(t){this._onDestroyFns.push(t)}hasStarted(){return this._started}play(){this.parentPlayer||this.init(),this._onStart(),this.players.forEach(t=>t.play())}pause(){this.players.forEach(t=>t.pause())}restart(){this.players.forEach(t=>t.restart())}finish(){this._onFinish(),this.players.forEach(t=>t.finish())}destroy(){this._onDestroy()}_onDestroy(){this._destroyed||(this._destroyed=!0,this._onFinish(),this.players.forEach(t=>t.destroy()),this._onDestroyFns.forEach(t=>t()),this._onDestroyFns=[])}reset(){this.players.forEach(t=>t.reset()),this._destroyed=!1,this._finished=!1,this._started=!1}setPosition(t){let r=t*this.totalTime;this.players.forEach(e=>{let n=e.totalTime?Math.min(1,r/e.totalTime):1;e.setPosition(n)})}getPosition(){let t=this.players.reduce((r,e)=>r===null||e.totalTime>r.totalTime?e:r,null);return t!=null?t.getPosition():0}beforeDestroy(){this.players.forEach(t=>{t.beforeDestroy&&t.beforeDestroy()})}triggerCallback(t){let r=t=="start"?this._onStartFns:this._onDoneFns;r.forEach(e=>e()),r.length=0}},X="!";export{B as a,U as b,a as c,V as d,G as e,Y as f,H as g,J as h,W as i,x as j,v as k,X as l};
