import{d as G}from"./chunk-3SBPTLBB.js";import{a as K,g as Y}from"./chunk-JB3ZD63W.js";import{n as h,r as z,s as M,t as B}from"./chunk-RZRD43HF.js";import{Aa as d,Ab as C,Bb as U,Cb as A,D as u,Da as y,G as k,Ia as m,Pa as j,Tc as $,Uc as S,aa as D,ba as I,ea as p,fa as _,ia as b,ja as l,kc as N,lc as x,m as T,mc as L,nb as O,oc as F,pc as q,sa as E,ta as v,ua as w,v as f,vc as P,wc as H,xa as R}from"./chunk-4HW5UCDR.js";function me(r,a){let t=a?.injector??l(E),e=new T(1),n=m(()=>{let o;try{o=r()}catch(i){S(()=>e.error(i));return}S(()=>e.next(o))},{injector:t,manualCleanup:!0});return t.get(w).onDestroy(()=>{n.destroy(),e.complete()}),e.asObservable()}function he(r,a){let e=!a?.manualCleanup?a?.injector?.get(w)??l(w):null,n=J(a?.equal),o;a?.requireSync?o=d({kind:0},{equal:n}):o=d({kind:1,value:a?.initialValue},{equal:n});let i,s=r.subscribe({next:c=>o.set({kind:1,value:c}),error:c=>{o.set({kind:2,error:c}),i?.()},complete:()=>{i?.()}});if(a?.requireSync&&o().kind===0)throw new I(601,!1);return i=e?.onDestroy(s.unsubscribe.bind(s)),$(()=>{let c=o();switch(c.kind){case 1:return c.value;case 2:throw c.error;case 0:throw new I(601,!1)}},{equal:a?.equal})}function J(r=Object.is){return(a,t)=>a.kind===1&&t.kind===1&&r(a.value,t.value)}var g={production:!0,baseHref:"/portfolio/",APIURL:"https://portfolio-d45z.onrender.com/api",supabase:{url:"",key:""}};var Te=(()=>{class r{constructor(){this.http=l(B),this.router=l(G),this.ngZone=l(R),this.platformId=l(y),this.STORAGE_KEY="portfolio_auth_session",this.currentUser=d(void 0),this.IDLE_TIMEOUT=10800*1e3,this.initSession(),h(this.platformId)&&m(()=>{this.currentUser()?this.startIdleTimer():this.stopIdleTimer()})}startIdleTimer(){this.stopIdleTimer(),h(this.platformId)&&this.ngZone.runOutsideAngular(()=>{let t=k(u(window,"mousemove"),u(window,"mousedown"),u(window,"keypress"),u(window,"scroll"),u(window,"touchstart"),u(window,"click"));this.idleSubscription=t.pipe(D(2e3)).subscribe(()=>{this.resetIdleTimer()}),this.resetIdleTimer()})}resetIdleTimer(){this.idleTimeoutId&&clearTimeout(this.idleTimeoutId),this.idleTimeoutId=setTimeout(()=>{this.ngZone.run(()=>{console.warn("User idle for 2 hours. Logging out automatically."),this.logout()})},this.IDLE_TIMEOUT)}stopIdleTimer(){this.idleSubscription&&(this.idleSubscription.unsubscribe(),this.idleSubscription=void 0),this.idleTimeoutId&&(clearTimeout(this.idleTimeoutId),this.idleTimeoutId=void 0)}getStorageItem(t){return typeof window<"u"&&window.localStorage?localStorage.getItem(t):null}setStorageItem(t,e){typeof window<"u"&&window.localStorage&&localStorage.setItem(t,e)}removeStorageItem(t){typeof window<"u"&&window.localStorage&&localStorage.removeItem(t)}async initSession(){let t=this.getStorageItem(this.STORAGE_KEY);if(!t){this.currentUser.set(null);return}try{let e=JSON.parse(t),n=Math.floor(Date.now()/1e3);if(e.expires_at&&e.expires_at-n<60)if(e.refresh_token){let o=await this.refreshSession(e.refresh_token);this.currentUser.set(o)}else this.clearSession();else this.currentUser.set(e.user)}catch(e){console.error("Error initializing auth session:",e),this.clearSession()}}saveSession(t){if(t&&t.access_token&&t.user){let e=Math.floor(Date.now()/1e3),n={access_token:t.access_token,refresh_token:t.refresh_token||"",expires_in:t.expires_in||0,expires_at:e+(t.expires_in||0),user:t.user};this.setStorageItem(this.STORAGE_KEY,JSON.stringify(n))}}clearSession(){this.removeStorageItem(this.STORAGE_KEY),this.currentUser.set(null)}getAccessToken(){let t=this.getStorageItem(this.STORAGE_KEY);if(!t)return null;try{return JSON.parse(t).access_token||null}catch(e){return console.error("Error reading access token from storage:",e),null}}getHeaders(){return new z({"Content-Type":"application/json"})}async refreshSession(t){let e=`${g.APIURL}/auth/refresh`;try{let n=await f(this.http.post(e,{refresh_token:t},{headers:this.getHeaders()}));return this.saveSession(n),n.user}catch(n){throw this.clearSession(),n}}async register(t,e,n,o){let i=`${g.APIURL}/auth/signup`;try{let s=await f(this.http.post(i,{email:t,password:e,first_name:n,last_name:o},{headers:this.getHeaders()}));return s&&s.access_token&&s.user?(this.saveSession(s),this.currentUser.set(s.user)):this.currentUser.set(s?.user||null),{user:s?.user||null,session:s?.access_token?s:null}}catch(s){let c="An unknown error occurred";throw s instanceof M?c=s.error?.error_description||s.error?.message||s.error?.msg||s.message:s instanceof Error&&(c=s.message),new Error(c)}}async login(t,e){let n=`${g.APIURL}/auth/login`;try{let o=await f(this.http.post(n,{email:t,password:e},{headers:this.getHeaders()}));return this.saveSession(o),this.currentUser.set(o.user),{user:o.user,session:o}}catch(o){let i="An unknown error occurred";throw o instanceof M?i=o.error?.error_description||o.error?.message||o.error?.msg||o.message:o instanceof Error&&(i=o.message),new Error(i)}}async logout(){let t=`${g.APIURL}/auth/logout`,e=this.getStorageItem(this.STORAGE_KEY),n="";if(e)try{n=JSON.parse(e).access_token}catch{}try{if(n){let o=this.getHeaders().set("Authorization",`Bearer ${n}`);await f(this.http.post(t,{},{headers:o}))}}catch(o){console.error("Error calling logout API:",o)}finally{this.clearSession();let o=this.router.url;o.startsWith("/user")&&!o.startsWith("/user/login")&&this.router.navigate(["/user/login"])}}static{this.\u0275fac=function(e){return new(e||r)}}static{this.\u0275prov=p({token:r,factory:r.\u0275fac,providedIn:"root"})}}return r})();var Q=["*",[["mat-toolbar-row"]]],Z=["*","mat-toolbar-row"],W=(()=>{class r{static \u0275fac=function(e){return new(e||r)};static \u0275dir=A({type:r,selectors:[["mat-toolbar-row"]],hostAttrs:[1,"mat-toolbar-row"],exportAs:["matToolbarRow"]})}return r})(),Ne=(()=>{class r{_elementRef=l(j);_platform=l(K);_document=l(v);color;_toolbarRows;ngAfterViewInit(){this._platform.isBrowser&&(this._checkToolbarMixedModes(),this._toolbarRows.changes.subscribe(()=>this._checkToolbarMixedModes()))}_checkToolbarMixedModes(){this._toolbarRows.length}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=C({type:r,selectors:[["mat-toolbar"]],contentQueries:function(e,n,o){if(e&1&&L(o,W,5),e&2){let i;F(i=q())&&(n._toolbarRows=i)}},hostAttrs:[1,"mat-toolbar"],hostVars:6,hostBindings:function(e,n){e&2&&(H(n.color?"mat-"+n.color:""),P("mat-toolbar-multiple-rows",n._toolbarRows.length>0)("mat-toolbar-single-row",n._toolbarRows.length===0))},inputs:{color:"color"},exportAs:["matToolbar"],ngContentSelectors:Z,decls:2,vars:0,template:function(e,n){e&1&&(N(Q),x(0),x(1,1))},styles:[`.mat-toolbar {
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
`],encapsulation:2})}return r})();var Le=(()=>{class r{static \u0275fac=function(e){return new(e||r)};static \u0275mod=U({type:r});static \u0275inj=_({imports:[Y]})}return r})();var ze=(()=>{class r{constructor(t,e,n){if(this.document=t,this.platformId=e,this.theme=d("dark"),this.renderer=n.createRenderer(null,null),h(this.platformId)){let o=localStorage.getItem("theme");o?this.theme.set(o):(localStorage.setItem("theme","dark"),this.theme.set("dark"))}m(()=>{h(this.platformId)&&(localStorage.setItem("theme",this.theme()),this.renderer.removeClass(this.document.body,this.theme()==="dark"?"light-theme":"dark-theme"),this.renderer.addClass(this.document.body,this.theme()==="dark"?"dark-theme":"light-theme"))})}toggleTheme(){this.theme.update(t=>t==="light"?"dark":"light")}static{this.\u0275fac=function(e){return new(e||r)(b(v),b(y),b(O))}}static{this.\u0275prov=p({token:r,factory:r.\u0275fac,providedIn:"root"})}}return r})();export{me as a,he as b,Ne as c,Le as d,ze as e,g as f,Te as g};
