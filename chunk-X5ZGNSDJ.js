import{a as na}from"./chunk-IFEKJ6KF.js";import{C as aa,i as Qt,k as it,o as rt,p as $t,q as Ut,r as Gt,s as Zt,v as Xt,w as Jt,x as ea,z as ta}from"./chunk-NUILELRG.js";import{c as zt}from"./chunk-X4XKRH3M.js";import{H as Ht,L as Kt,M as jt,O as at,P as nt,R as qt,g as Yt,h as tt,j as Pe,l as Le,m as ge,n as Pt,u as Lt,y as Bt}from"./chunk-36BCSJLF.js";import{B as _e,D as G,E as Ot,H as Nt,P as et,U as Wt,d as Xe,f as Ft,k as Je,l as me,m as Ye,v as Tt,x as Rt,y as W}from"./chunk-OS7RU7CO.js";import{$ as Me,A as re,Ac as L,B as Ct,Bb as K,Cb as Ge,Fa as Y,G as wt,Ga as le,Ia as Se,Ib as D,Ja as z,Jb as ce,Kb as he,Lc as It,Nb as Ee,Ob as Ie,Pb as v,Qb as c,Qc as xt,R as Ae,Rb as u,Sb as T,Tb as S,Ub as V,Vb as St,Z as We,Zb as ue,_ as se,_b as R,a as A,ab as l,ba as $,bc as f,bd as F,ca as ke,cc as Vt,da as o,dc as m,dd as N,e as k,ec as xe,fb as $e,fc as pe,gc as Et,hc as j,ia as y,ib as Ue,ic as E,ja as C,jc as I,ka as oe,l as we,la as qe,ma as de,na as At,nb as Mt,ob as kt,oc as Fe,pc as x,qa as h,qc as Te,ra as Qe,rc as b,sc as O,tc as U,ua as p,ub as M,uc as Ze,vb as Ve,wb as P,wc as Re,xc as Oe,yc as Ne}from"./chunk-CLIOPF5A.js";import{a as vt,b as yt}from"./chunk-HZ6M6AS2.js";var st=new $("MAT_DATE_LOCALE",{providedIn:"root",factory:()=>o(It)}),Z="Method not implemented",_=class{locale;_localeChanges=new k;localeChanges=this._localeChanges;setTime(s,e,t,a){throw new Error(Z)}getHours(s){throw new Error(Z)}getMinutes(s){throw new Error(Z)}getSeconds(s){throw new Error(Z)}parseTime(s,e){throw new Error(Z)}addSeconds(s,e){throw new Error(Z)}getValidDateOrNull(s){return this.isDateInstance(s)&&this.isValid(s)?s:null}deserialize(s){return s==null||this.isDateInstance(s)&&this.isValid(s)?s:this.invalid()}setLocale(s){this.locale=s,this._localeChanges.next()}compareDate(s,e){return this.getYear(s)-this.getYear(e)||this.getMonth(s)-this.getMonth(e)||this.getDate(s)-this.getDate(e)}compareTime(s,e){return this.getHours(s)-this.getHours(e)||this.getMinutes(s)-this.getMinutes(e)||this.getSeconds(s)-this.getSeconds(e)}sameDate(s,e){if(s&&e){let t=this.isValid(s),a=this.isValid(e);return t&&a?!this.compareDate(s,e):t==a}return s==e}sameTime(s,e){if(s&&e){let t=this.isValid(s),a=this.isValid(e);return t&&a?!this.compareTime(s,e):t==a}return s==e}clampDate(s,e,t){return e&&this.compareDate(s,e)<0?e:t&&this.compareDate(s,t)>0?t:s}},B=new $("mat-date-formats");var Ca=/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/,wa=/^(\d?\d)[:.](\d?\d)(?:[:.](\d?\d))?\s*(AM|PM)?$/i;function ot(i,s){let e=Array(i);for(let t=0;t<i;t++)e[t]=s(t);return e}var Aa=(()=>{class i extends _{_matDateLocale=o(st,{optional:!0});constructor(){super();let e=o(st,{optional:!0});e!==void 0&&(this._matDateLocale=e),super.setLocale(this._matDateLocale)}getYear(e){return e.getFullYear()}getMonth(e){return e.getMonth()}getDate(e){return e.getDate()}getDayOfWeek(e){return e.getDay()}getMonthNames(e){let t=new Intl.DateTimeFormat(this.locale,{month:e,timeZone:"utc"});return ot(12,a=>this._format(t,new Date(2017,a,1)))}getDateNames(){let e=new Intl.DateTimeFormat(this.locale,{day:"numeric",timeZone:"utc"});return ot(31,t=>this._format(e,new Date(2017,0,t+1)))}getDayOfWeekNames(e){let t=new Intl.DateTimeFormat(this.locale,{weekday:e,timeZone:"utc"});return ot(7,a=>this._format(t,new Date(2017,0,a+1)))}getYearName(e){let t=new Intl.DateTimeFormat(this.locale,{year:"numeric",timeZone:"utc"});return this._format(t,e)}getFirstDayOfWeek(){if(typeof Intl<"u"&&Intl.Locale){let e=new Intl.Locale(this.locale),t=(e.getWeekInfo?.()||e.weekInfo)?.firstDay??0;return t===7?0:t}return 0}getNumDaysInMonth(e){return this.getDate(this._createDateWithOverflow(this.getYear(e),this.getMonth(e)+1,0))}clone(e){return new Date(e.getTime())}createDate(e,t,a){let n=this._createDateWithOverflow(e,t,a);return n.getMonth()!=t,n}today(){return new Date}parse(e,t){return typeof e=="number"?new Date(e):e?new Date(Date.parse(e)):null}format(e,t){if(!this.isValid(e))throw Error("NativeDateAdapter: Cannot format invalid date.");let a=new Intl.DateTimeFormat(this.locale,yt(vt({},t),{timeZone:"utc"}));return this._format(a,e)}addCalendarYears(e,t){return this.addCalendarMonths(e,t*12)}addCalendarMonths(e,t){let a=this._createDateWithOverflow(this.getYear(e),this.getMonth(e)+t,this.getDate(e));return this.getMonth(a)!=((this.getMonth(e)+t)%12+12)%12&&(a=this._createDateWithOverflow(this.getYear(a),this.getMonth(a),0)),a}addCalendarDays(e,t){return this._createDateWithOverflow(this.getYear(e),this.getMonth(e),this.getDate(e)+t)}toIso8601(e){return[e.getUTCFullYear(),this._2digit(e.getUTCMonth()+1),this._2digit(e.getUTCDate())].join("-")}deserialize(e){if(typeof e=="string"){if(!e)return null;if(Ca.test(e)){let t=new Date(e);if(this.isValid(t))return t}}return super.deserialize(e)}isDateInstance(e){return e instanceof Date}isValid(e){return!isNaN(e.getTime())}invalid(){return new Date(NaN)}setTime(e,t,a,n){let r=this.clone(e);return r.setHours(t,a,n,0),r}getHours(e){return e.getHours()}getMinutes(e){return e.getMinutes()}getSeconds(e){return e.getSeconds()}parseTime(e,t){if(typeof e!="string")return e instanceof Date?new Date(e.getTime()):null;let a=e.trim();if(a.length===0)return null;let n=this._parseTimeString(a);if(n===null){let r=a.replace(/[^0-9:(AM|PM)]/gi,"").trim();r.length>0&&(n=this._parseTimeString(r))}return n||this.invalid()}addSeconds(e,t){return new Date(e.getTime()+t*1e3)}_createDateWithOverflow(e,t,a){let n=new Date;return n.setFullYear(e,t,a),n.setHours(0,0,0,0),n}_2digit(e){return("00"+e).slice(-2)}_format(e,t){let a=new Date;return a.setUTCFullYear(t.getFullYear(),t.getMonth(),t.getDate()),a.setUTCHours(t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()),e.format(a)}_parseTimeString(e){let t=e.toUpperCase().match(wa);if(t){let a=parseInt(t[1]),n=parseInt(t[2]),r=t[3]==null?void 0:parseInt(t[3]),d=t[4];if(a===12?a=d==="AM"?0:a:d==="PM"&&(a+=12),dt(a,0,23)&&dt(n,0,59)&&(r==null||dt(r,0,59)))return this.setTime(this.today(),a,n,r||0)}return null}static \u0275fac=function(t){return new(t||i)};static \u0275prov=Se({token:i,factory:i.\u0275fac,autoProvided:!1})}return i})();function dt(i,s,e){return!isNaN(i)&&i>=s&&i<=e}var Ma={parse:{dateInput:null,timeInput:null},display:{dateInput:{year:"numeric",month:"numeric",day:"numeric"},timeInput:{hour:"numeric",minute:"numeric"},monthYearLabel:{year:"numeric",month:"short"},dateA11yLabel:{year:"numeric",month:"long",day:"numeric"},monthYearA11yLabel:{year:"numeric",month:"long"},timeOptionLabel:{hour:"numeric",minute:"numeric"}}};var bn=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=Ve({type:i});static \u0275inj=Me({providers:[ka()]})}return i})();function ka(i=Ma){return[{provide:_,useClass:Aa},{provide:B,useValue:i}]}function Va(i,s){return this._trackRow(s)}var ha=(i,s)=>s.id;function Ea(i,s){if(i&1&&(S(0,"tr",0)(1,"td",3),b(2),V()()),i&2){let e=m();l(),Fe("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),D("colspan",e.numCols),l(),U(" ",e.label," ")}}function Ia(i,s){if(i&1&&(S(0,"td",3),b(1),V()),i&2){let e=m(2);Fe("padding-top",e._cellPadding)("padding-bottom",e._cellPadding),D("colspan",e._firstRowOffset),l(),U(" ",e._firstRowOffset>=e.labelMinRequiredCells?e.label:""," ")}}function xa(i,s){if(i&1){let e=ue();S(0,"td",6)(1,"button",7),Vt("click",function(a){let n=y(e).$implicit,r=m(2);return C(r._cellClicked(n,a))})("focus",function(a){let n=y(e).$implicit,r=m(2);return C(r._emitActiveDateChange(n,a))}),S(2,"span",8),b(3),V(),St(4,"span",9),V()()}if(i&2){let e=s.$implicit,t=s.$index,a=m().$index,n=m();Fe("width",n._cellWidth)("padding-top",n._cellPadding)("padding-bottom",n._cellPadding),D("data-mat-row",a)("data-mat-col",t),l(),Te(e.cssClasses),x("mat-calendar-body-disabled",!e.enabled)("mat-calendar-body-active",n._isActiveCell(a,t))("mat-calendar-body-range-start",n._isRangeStart(e.compareValue))("mat-calendar-body-range-end",n._isRangeEnd(e.compareValue))("mat-calendar-body-in-range",n._isInRange(e.compareValue))("mat-calendar-body-comparison-bridge-start",n._isComparisonBridgeStart(e.compareValue,a,t))("mat-calendar-body-comparison-bridge-end",n._isComparisonBridgeEnd(e.compareValue,a,t))("mat-calendar-body-comparison-start",n._isComparisonStart(e.compareValue))("mat-calendar-body-comparison-end",n._isComparisonEnd(e.compareValue))("mat-calendar-body-in-comparison-range",n._isInComparisonRange(e.compareValue))("mat-calendar-body-preview-start",n._isPreviewStart(e.compareValue))("mat-calendar-body-preview-end",n._isPreviewEnd(e.compareValue))("mat-calendar-body-in-preview",n._isInPreview(e.compareValue)),R("tabIndex",n._isActiveCell(a,t)?0:-1),D("aria-label",e.ariaLabel)("aria-disabled",!e.enabled||null)("aria-pressed",n._isSelected(e.compareValue))("aria-current",n.todayValue===e.compareValue?"date":null)("aria-describedby",n._getDescribedby(e.compareValue)),l(),x("mat-calendar-body-selected",n._isSelected(e.compareValue))("mat-calendar-body-comparison-identical",n._isComparisonIdentical(e.compareValue))("mat-calendar-body-today",n.todayValue===e.compareValue),l(),U(" ",e.displayValue," ")}}function Fa(i,s){if(i&1&&(S(0,"tr",1),ce(1,Ia,2,6,"td",4),Ee(2,xa,5,49,"td",5,ha),V()),i&2){let e=s.$implicit,t=s.$index,a=m();l(),he(t===0&&a._firstRowOffset?1:-1),l(),Ie(e)}}function Ta(i,s){if(i&1&&(c(0,"th",2)(1,"span",6),b(2),u(),c(3,"span",3),b(4),u()()),i&2){let e=s.$implicit;l(2),O(e.long),l(2),O(e.narrow)}}var Ra=["*"];function Oa(i,s){}function Na(i,s){if(i&1){let e=ue();c(0,"mat-month-view",4),Ne("activeDateChange",function(a){y(e);let n=m();return Oe(n.activeDate,a)||(n.activeDate=a),C(a)}),f("_userSelection",function(a){y(e);let n=m();return C(n._dateSelected(a))})("dragStarted",function(a){y(e);let n=m();return C(n._dragStarted(a))})("dragEnded",function(a){y(e);let n=m();return C(n._dragEnded(a))}),u()}if(i&2){let e=m();Re("activeDate",e.activeDate),v("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)("comparisonStart",e.comparisonStart)("comparisonEnd",e.comparisonEnd)("startDateAccessibleName",e.startDateAccessibleName)("endDateAccessibleName",e.endDateAccessibleName)("activeDrag",e._activeDrag)}}function Ya(i,s){if(i&1){let e=ue();c(0,"mat-year-view",5),Ne("activeDateChange",function(a){y(e);let n=m();return Oe(n.activeDate,a)||(n.activeDate=a),C(a)}),f("monthSelected",function(a){y(e);let n=m();return C(n._monthSelectedInYearView(a))})("selectedChange",function(a){y(e);let n=m();return C(n._goToDateInView(a,"month"))}),u()}if(i&2){let e=m();Re("activeDate",e.activeDate),v("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function Pa(i,s){if(i&1){let e=ue();c(0,"mat-multi-year-view",6),Ne("activeDateChange",function(a){y(e);let n=m();return Oe(n.activeDate,a)||(n.activeDate=a),C(a)}),f("yearSelected",function(a){y(e);let n=m();return C(n._yearSelectedInMultiYearView(a))})("selectedChange",function(a){y(e);let n=m();return C(n._goToDateInView(a,"year"))}),u()}if(i&2){let e=m();Re("activeDate",e.activeDate),v("selected",e.selected)("dateFilter",e.dateFilter)("maxDate",e.maxDate)("minDate",e.minDate)("dateClass",e.dateClass)}}function La(i,s){}var Ba=["button"],Ha=[[["","matDatepickerToggleIcon",""]]],za=["[matDatepickerToggleIcon]"];function Ka(i,s){i&1&&(oe(),c(0,"svg",2),T(1,"path",3),u())}var ja=[[["input","matStartDate",""]],[["input","matEndDate",""]]],Wa=["input[matStartDate]","input[matEndDate]"];var ie=(()=>{class i{changes=new k;calendarLabel="Calendar";openCalendarLabel="Open calendar";closeCalendarLabel="Close calendar";prevMonthLabel="Previous month";nextMonthLabel="Next month";prevYearLabel="Previous year";nextYearLabel="Next year";prevMultiYearLabel="Previous 24 years";nextMultiYearLabel="Next 24 years";switchToMonthViewLabel="Choose date";switchToMultiYearViewLabel="Choose month and year";startDateLabel="Start date";endDateLabel="End date";comparisonDateLabel="Comparison range";formatYearRange(e,t){return`${e} \u2013 ${t}`}formatYearRangeLabel(e,t){return`${e} to ${t}`}static \u0275fac=function(t){return new(t||i)};static \u0275prov=Se({token:i,factory:i.\u0275fac})}return i})(),qa=0,De=class{value;displayValue;ariaLabel;enabled;compareValue;rawValue;id=qa++;cssClasses;constructor(s,e,t,a,n,r=s,d){this.value=s,this.displayValue=e,this.ariaLabel=t,this.enabled=a,this.compareValue=r,this.rawValue=d,this.cssClasses=n instanceof Set?Array.from(n):n}},Qa={passive:!1,capture:!0},Be={passive:!0,capture:!0},ia={passive:!0},te=(()=>{class i{_elementRef=o(z);_ngZone=o(Qe);_platform=o(Ft);_intl=o(ie);_eventCleanups;_skipNextFocus=!1;_focusActiveCellAfterViewChecked=!1;label;rows;todayValue;startValue;endValue;labelMinRequiredCells;numCols=7;activeCell=0;ngAfterViewChecked(){this._focusActiveCellAfterViewChecked&&(this._focusActiveCell(),this._focusActiveCellAfterViewChecked=!1)}isRange=!1;cellAspectRatio=1;comparisonStart=null;comparisonEnd=null;previewStart=null;previewEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedValueChange=new h;previewChange=new h;activeDateChange=new h;dragStarted=new h;dragEnded=new h;_firstRowOffset;_cellPadding;_cellWidth;_startDateLabelId;_endDateLabelId;_comparisonStartDateLabelId;_comparisonEndDateLabelId;_didDragSinceMouseDown=!1;_injector=o(de);comparisonDateAccessibleName=this._intl.comparisonDateLabel;_trackRow=e=>e;constructor(){let e=o(Ue),t=o(_e);this._startDateLabelId=t.getId("mat-calendar-body-start-"),this._endDateLabelId=t.getId("mat-calendar-body-end-"),this._comparisonStartDateLabelId=t.getId("mat-calendar-body-comparison-start-"),this._comparisonEndDateLabelId=t.getId("mat-calendar-body-comparison-end-"),o(me).load(Wt),this._ngZone.runOutsideAngular(()=>{let a=this._elementRef.nativeElement,n=[e.listen(a,"touchmove",this._touchmoveHandler,Qa),e.listen(a,"mouseenter",this._enterHandler,Be),e.listen(a,"focus",this._enterHandler,Be),e.listen(a,"mouseleave",this._leaveHandler,Be),e.listen(a,"blur",this._leaveHandler,Be),e.listen(a,"mousedown",this._mousedownHandler,ia),e.listen(a,"touchstart",this._mousedownHandler,ia)];this._platform.isBrowser&&n.push(e.listen("window","mouseup",this._mouseupHandler),e.listen("window","touchend",this._touchendHandler)),this._eventCleanups=n})}_cellClicked(e,t){this._didDragSinceMouseDown||e.enabled&&this.selectedValueChange.emit({value:e.value,event:t})}_emitActiveDateChange(e,t){e.enabled&&this.activeDateChange.emit({value:e.value,event:t})}_isSelected(e){return this.startValue===e||this.endValue===e}ngOnChanges(e){let t=e.numCols,{rows:a,numCols:n}=this;(e.rows||t)&&(this._firstRowOffset=a&&a.length&&a[0].length?n-a[0].length:0),(e.cellAspectRatio||t||!this._cellPadding)&&(this._cellPadding=`${50*this.cellAspectRatio/n}%`),(t||!this._cellWidth)&&(this._cellWidth=`${100/n}%`)}ngOnDestroy(){this._eventCleanups.forEach(e=>e())}_isActiveCell(e,t){let a=e*this.numCols+t;return e&&(a-=this._firstRowOffset),a==this.activeCell}_focusActiveCell(e=!0){$e(()=>{setTimeout(()=>{let t=this._elementRef.nativeElement.querySelector(".mat-calendar-body-active");t&&(e||(this._skipNextFocus=!0),t.focus())})},{injector:this._injector})}_scheduleFocusActiveCellAfterViewChecked(){this._focusActiveCellAfterViewChecked=!0}_isRangeStart(e){return ht(e,this.startValue,this.endValue)}_isRangeEnd(e){return ut(e,this.startValue,this.endValue)}_isInRange(e){return pt(e,this.startValue,this.endValue,this.isRange)}_isComparisonStart(e){return ht(e,this.comparisonStart,this.comparisonEnd)}_isComparisonBridgeStart(e,t,a){if(!this._isComparisonStart(e)||this._isRangeStart(e)||!this._isInRange(e))return!1;let n=this.rows[t][a-1];if(!n){let r=this.rows[t-1];n=r&&r[r.length-1]}return n&&!this._isRangeEnd(n.compareValue)}_isComparisonBridgeEnd(e,t,a){if(!this._isComparisonEnd(e)||this._isRangeEnd(e)||!this._isInRange(e))return!1;let n=this.rows[t][a+1];if(!n){let r=this.rows[t+1];n=r&&r[0]}return n&&!this._isRangeStart(n.compareValue)}_isComparisonEnd(e){return ut(e,this.comparisonStart,this.comparisonEnd)}_isInComparisonRange(e){return pt(e,this.comparisonStart,this.comparisonEnd,this.isRange)}_isComparisonIdentical(e){return this.comparisonStart===this.comparisonEnd&&e===this.comparisonStart}_isPreviewStart(e){return ht(e,this.previewStart,this.previewEnd)}_isPreviewEnd(e){return ut(e,this.previewStart,this.previewEnd)}_isInPreview(e){return pt(e,this.previewStart,this.previewEnd,this.isRange)}_getDescribedby(e){if(!this.isRange)return null;if(this.startValue===e&&this.endValue===e)return`${this._startDateLabelId} ${this._endDateLabelId}`;if(this.startValue===e)return this._startDateLabelId;if(this.endValue===e)return this._endDateLabelId;if(this.comparisonStart!==null&&this.comparisonEnd!==null){if(e===this.comparisonStart&&e===this.comparisonEnd)return`${this._comparisonStartDateLabelId} ${this._comparisonEndDateLabelId}`;if(e===this.comparisonStart)return this._comparisonStartDateLabelId;if(e===this.comparisonEnd)return this._comparisonEndDateLabelId}return null}_enterHandler=e=>{if(this._skipNextFocus&&e.type==="focus"){this._skipNextFocus=!1;return}if(e.target&&this.isRange){let t=this._getCellFromElement(e.target);t&&this._ngZone.run(()=>this.previewChange.emit({value:t.enabled?t:null,event:e}))}};_touchmoveHandler=e=>{if(!this.isRange)return;let t=ra(e),a=t?this._getCellFromElement(t):null;t!==e.target&&(this._didDragSinceMouseDown=!0),ct(e.target)&&e.preventDefault(),this._ngZone.run(()=>this.previewChange.emit({value:a?.enabled?a:null,event:e}))};_leaveHandler=e=>{this.previewEnd!==null&&this.isRange&&(e.type!=="blur"&&(this._didDragSinceMouseDown=!0),e.target&&this._getCellFromElement(e.target)&&!(e.relatedTarget&&this._getCellFromElement(e.relatedTarget))&&this._ngZone.run(()=>this.previewChange.emit({value:null,event:e})))};_mousedownHandler=e=>{if(!this.isRange)return;this._didDragSinceMouseDown=!1;let t=e.target&&this._getCellFromElement(e.target);!t||!this._isInRange(t.compareValue)||this._ngZone.run(()=>{this.dragStarted.emit({value:t.rawValue,event:e})})};_mouseupHandler=e=>{if(!this.isRange)return;let t=ct(e.target);if(!t){this._ngZone.run(()=>{this.dragEnded.emit({value:null,event:e})});return}t.closest(".mat-calendar-body")===this._elementRef.nativeElement&&this._ngZone.run(()=>{let a=this._getCellFromElement(t);this.dragEnded.emit({value:a?.rawValue??null,event:e})})};_touchendHandler=e=>{let t=ra(e);t&&this._mouseupHandler({target:t})};_getCellFromElement(e){let t=ct(e);if(t){let a=t.getAttribute("data-mat-row"),n=t.getAttribute("data-mat-col");if(a&&n)return this.rows[parseInt(a)]?.[parseInt(n)]||null}return null}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["","mat-calendar-body",""]],hostAttrs:[1,"mat-calendar-body"],inputs:{label:"label",rows:"rows",todayValue:"todayValue",startValue:"startValue",endValue:"endValue",labelMinRequiredCells:"labelMinRequiredCells",numCols:"numCols",activeCell:"activeCell",isRange:"isRange",cellAspectRatio:"cellAspectRatio",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",previewStart:"previewStart",previewEnd:"previewEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedValueChange:"selectedValueChange",previewChange:"previewChange",activeDateChange:"activeDateChange",dragStarted:"dragStarted",dragEnded:"dragEnded"},exportAs:["matCalendarBody"],features:[Y],decls:11,vars:11,consts:[["aria-hidden","true"],["role","row"],[1,"mat-calendar-body-hidden-label",3,"id"],[1,"mat-calendar-body-label"],[1,"mat-calendar-body-label",3,"paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container",3,"width","paddingTop","paddingBottom"],["role","gridcell",1,"mat-calendar-body-cell-container"],["type","button",1,"mat-calendar-body-cell",3,"click","focus","tabindex"],[1,"mat-calendar-body-cell-content","mat-focus-indicator"],["aria-hidden","true",1,"mat-calendar-body-cell-preview"]],template:function(t,a){t&1&&(ce(0,Ea,3,6,"tr",0),Ee(1,Fa,4,1,"tr",1,Va,!0),S(3,"span",2),b(4),V(),S(5,"span",2),b(6),V(),S(7,"span",2),b(8),V(),S(9,"span",2),b(10),V()),t&2&&(he(a._firstRowOffset<a.labelMinRequiredCells?0:-1),l(),Ie(a.rows),l(2),R("id",a._startDateLabelId),l(),U(" ",a.startDateAccessibleName,`
`),l(),R("id",a._endDateLabelId),l(),U(" ",a.endDateAccessibleName,`
`),l(),R("id",a._comparisonStartDateLabelId),l(),Ze(" ",a.comparisonDateAccessibleName," ",a.startDateAccessibleName,`
`),l(),R("id",a._comparisonEndDateLabelId),l(),Ze(" ",a.comparisonDateAccessibleName," ",a.endDateAccessibleName,`
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
`],encapsulation:2})}return i})();function lt(i){return i?.nodeName==="TD"}function ct(i){let s;return lt(i)?s=i:lt(i.parentNode)?s=i.parentNode:lt(i.parentNode?.parentNode)&&(s=i.parentNode.parentNode),s?.getAttribute("data-mat-row")!=null?s:null}function ht(i,s,e){return e!==null&&s!==e&&i<e&&i===s}function ut(i,s,e){return s!==null&&s!==e&&i>=s&&i===e}function pt(i,s,e,t){return t&&s!==null&&e!==null&&s!==e&&i>=s&&i<=e}function ra(i){let s=i.changedTouches[0];return document.elementFromPoint(s.clientX,s.clientY)}var g=class{start;end;_disableStructuralEquivalency;constructor(s,e){this.start=s,this.end=e}},H=(()=>{class i{selection;_adapter;_selectionChanged=new k;selectionChanged=this._selectionChanged;constructor(e,t){this.selection=e,this._adapter=t,this.selection=e}updateSelection(e,t){let a=this.selection;this.selection=e,this._selectionChanged.next({selection:e,source:t,oldValue:a})}ngOnDestroy(){this._selectionChanged.complete()}_isValidDateInstance(e){return this._adapter.isDateInstance(e)&&this._adapter.isValid(e)}static \u0275fac=function(t){Mt()};static \u0275prov=se({token:i,factory:i.\u0275fac})}return i})(),$a=(()=>{class i extends H{constructor(e){super(null,e)}add(e){super.updateSelection(e,this)}isValid(){return this.selection!=null&&this._isValidDateInstance(this.selection)}isComplete(){return this.selection!=null}clone(){let e=new i(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||i)(ke(_))};static \u0275prov=se({token:i,factory:i.\u0275fac})}return i})(),Ua=(()=>{class i extends H{constructor(e){super(new g(null,null),e)}add(e){let{start:t,end:a}=this.selection;t==null?t=e:a==null?a=e:(t=e,a=null),super.updateSelection(new g(t,a),this)}isValid(){let{start:e,end:t}=this.selection;return e==null&&t==null?!0:e!=null&&t!=null?this._isValidDateInstance(e)&&this._isValidDateInstance(t)&&this._adapter.compareDate(e,t)<=0:(e==null||this._isValidDateInstance(e))&&(t==null||this._isValidDateInstance(t))}isComplete(){return this.selection.start!=null&&this.selection.end!=null}clone(){let e=new i(this._adapter);return e.updateSelection(this.selection,this),e}static \u0275fac=function(t){return new(t||i)(ke(_))};static \u0275prov=se({token:i,factory:i.\u0275fac})}return i})(),ua={provide:H,useFactory:()=>o(H,{optional:!0,skipSelf:!0})||new $a(o(_))},Ga={provide:H,useFactory:()=>o(H,{optional:!0,skipSelf:!0})||new Ua(o(_))},He=new $("MAT_DATE_RANGE_SELECTION_STRATEGY"),Za=(()=>{class i{_dateAdapter;constructor(e){this._dateAdapter=e}selectionFinished(e,t){let{start:a,end:n}=t;return a==null?a=e:n==null&&e&&this._dateAdapter.compareDate(e,a)>=0?n=e:(a=e,n=null),new g(a,n)}createPreview(e,t){let a=null,n=null;return t.start&&!t.end&&e&&(a=t.start,n=e),new g(a,n)}createDrag(e,t,a){let n=t.start,r=t.end;if(!n||!r)return null;let d=this._dateAdapter,ye=d.compareDate(n,r)!==0,q=d.getYear(a)-d.getYear(e),Q=d.getMonth(a)-d.getMonth(e),Ce=d.getDate(a)-d.getDate(e);return ye&&d.sameDate(e,t.start)?(n=a,d.compareDate(a,r)>0&&(r=d.addCalendarYears(r,q),r=d.addCalendarMonths(r,Q),r=d.addCalendarDays(r,Ce))):ye&&d.sameDate(e,t.end)?(r=a,d.compareDate(a,n)<0&&(n=d.addCalendarYears(n,q),n=d.addCalendarMonths(n,Q),n=d.addCalendarDays(n,Ce))):(n=d.addCalendarYears(n,q),n=d.addCalendarMonths(n,Q),n=d.addCalendarDays(n,Ce),r=d.addCalendarYears(r,q),r=d.addCalendarMonths(r,Q),r=d.addCalendarDays(r,Ce)),new g(n,r)}static \u0275fac=function(t){return new(t||i)(ke(_))};static \u0275prov=se({token:i,factory:i.\u0275fac})}return i})(),mt=7,Xa=0,sa=(()=>{class i{_changeDetectorRef=o(F);_dateFormats=o(B,{optional:!0});_dateAdapter=o(_,{optional:!0});_dir=o(G,{optional:!0});_rangeStrategy=o(He,{optional:!0});_rerenderSubscription=A.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._hasSameMonthAndYear(t,this._activeDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof g?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setRanges(this._selected)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;activeDrag=null;selectedChange=new h;_userSelection=new h;dragStarted=new h;dragEnded=new h;activeDateChange=new h;_matCalendarBody;_monthLabel=p("");_weeks=p([]);_firstWeekOffset=p(0);_rangeStart=p(null);_rangeEnd=p(null);_comparisonRangeStart=p(null);_comparisonRangeEnd=p(null);_previewStart=p(null);_previewEnd=p(null);_isRange=p(!1);_todayDate=p(null);_weekdays=p([]);constructor(){o(me).load(Ye),this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ae(null)).subscribe(()=>this._init())}ngOnChanges(e){let t=e.comparisonStart||e.comparisonEnd;t&&!t.firstChange&&this._setRanges(this.selected),e.activeDrag&&!this.activeDrag&&this._clearPreview()}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_dateSelected(e){let t=e.value,a=this._getDateFromDayOfMonth(t),n,r;this._selected instanceof g?(n=this._getDateInCurrentMonth(this._selected.start),r=this._getDateInCurrentMonth(this._selected.end)):n=r=this._getDateInCurrentMonth(this._selected),(n!==t||r!==t)&&this.selectedChange.emit(a),this._userSelection.emit({value:a,event:e.event}),this._clearPreview(),this._changeDetectorRef.markForCheck()}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromDayOfMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this._activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,-7);break;case 40:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,7);break;case 36:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,1-this._dateAdapter.getDate(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarDays(this._activeDate,this._dateAdapter.getNumDaysInMonth(this._activeDate)-this._dateAdapter.getDate(this._activeDate));break;case 33:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,-1):this._dateAdapter.addCalendarMonths(this._activeDate,-1);break;case 34:this.activeDate=e.altKey?this._dateAdapter.addCalendarYears(this._activeDate,1):this._dateAdapter.addCalendarMonths(this._activeDate,1);break;case 13:case 32:this._selectionKeyPressed=!0,this._canSelect(this._activeDate)&&e.preventDefault();return;case 27:this._previewEnd()!=null&&!W(e)&&(this._clearPreview(),this.activeDrag?this.dragEnded.emit({value:null,event:e}):(this.selectedChange.emit(null),this._userSelection.emit({value:null,event:e})),e.preventDefault(),e.stopPropagation());return;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._canSelect(this._activeDate)&&this._dateSelected({value:this._dateAdapter.getDate(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setRanges(this.selected),this._todayDate.set(this._getCellCompareValue(this._dateAdapter.today())),this._monthLabel.set(this._dateFormats.display.monthLabel?this._dateAdapter.format(this.activeDate,this._dateFormats.display.monthLabel):this._dateAdapter.getMonthNames("short")[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase());let e=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),1);this._firstWeekOffset.set((mt+this._dateAdapter.getDayOfWeek(e)-this._dateAdapter.getFirstDayOfWeek())%mt),this._initWeekdays(),this._createWeekCells(),this._changeDetectorRef.markForCheck()}_focusActiveCell(e){this._matCalendarBody._focusActiveCell(e)}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_previewChanged({event:e,value:t}){if(this._rangeStrategy){let a=t?t.rawValue:null,n=this._rangeStrategy.createPreview(a,this.selected,e);if(this._previewStart.set(this._getCellCompareValue(n.start)),this._previewEnd.set(this._getCellCompareValue(n.end)),this.activeDrag&&a){let r=this._rangeStrategy.createDrag?.(this.activeDrag.value,this.selected,a,e);r&&(this._previewStart.set(this._getCellCompareValue(r.start)),this._previewEnd.set(this._getCellCompareValue(r.end)))}}}_dragEnded(e){if(this.activeDrag)if(e.value){let t=this._rangeStrategy?.createDrag?.(this.activeDrag.value,this.selected,e.value,e.event);this.dragEnded.emit({value:t??null,event:e.event})}else this.dragEnded.emit({value:null,event:e.event})}_getDateFromDayOfMonth(e){return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),e)}_initWeekdays(){let e=this._dateAdapter.getFirstDayOfWeek(),t=this._dateAdapter.getDayOfWeekNames("narrow"),n=this._dateAdapter.getDayOfWeekNames("long").map((r,d)=>({long:r,narrow:t[d],id:Xa++}));this._weekdays.set(n.slice(e).concat(n.slice(0,e)))}_createWeekCells(){let e=this._dateAdapter.getNumDaysInMonth(this.activeDate),t=this._dateAdapter.getDateNames(),a=[[]];for(let n=0,r=this._firstWeekOffset();n<e;n++,r++){r==mt&&(a.push([]),r=0);let d=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),this._dateAdapter.getMonth(this.activeDate),n+1),ye=this._shouldEnableDate(d),q=this._dateAdapter.format(d,this._dateFormats.display.dateA11yLabel),Q=this.dateClass?this.dateClass(d,"month"):void 0;a[a.length-1].push(new De(n+1,t[n],q,ye,Q,this._getCellCompareValue(d),d))}this._weeks.set(a)}_shouldEnableDate(e){return!!e&&(!this.minDate||this._dateAdapter.compareDate(e,this.minDate)>=0)&&(!this.maxDate||this._dateAdapter.compareDate(e,this.maxDate)<=0)&&(!this.dateFilter||this.dateFilter(e))}_getDateInCurrentMonth(e){return e&&this._hasSameMonthAndYear(e,this.activeDate)?this._dateAdapter.getDate(e):null}_hasSameMonthAndYear(e,t){return!!(e&&t&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t)&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t))}_getCellCompareValue(e){if(e){let t=this._dateAdapter.getYear(e),a=this._dateAdapter.getMonth(e),n=this._dateAdapter.getDate(e);return new Date(t,a,n).getTime()}return null}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setRanges(e){e instanceof g?(this._rangeStart.set(this._getCellCompareValue(e.start)),this._rangeEnd.set(this._getCellCompareValue(e.end)),this._isRange.set(!0)):(this._rangeStart.set(this._getCellCompareValue(e)),this._rangeEnd.set(this._rangeStart()),this._isRange.set(!1)),this._comparisonRangeStart.set(this._getCellCompareValue(this.comparisonStart)),this._comparisonRangeEnd.set(this._getCellCompareValue(this.comparisonEnd))}_canSelect(e){return!this.dateFilter||this.dateFilter(e)}_clearPreview(){this._previewStart.set(null),this._previewEnd.set(null)}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-month-view"]],viewQuery:function(t,a){if(t&1&&j(te,5),t&2){let n;E(n=I())&&(a._matCalendarBody=n.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName",activeDrag:"activeDrag"},outputs:{selectedChange:"selectedChange",_userSelection:"_userSelection",dragStarted:"dragStarted",dragEnded:"dragEnded",activeDateChange:"activeDateChange"},exportAs:["matMonthView"],features:[Y],decls:8,vars:14,consts:[["role","grid",1,"mat-calendar-table"],[1,"mat-calendar-table-header"],["scope","col"],["aria-hidden","true"],["colspan","7",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","previewChange","dragStarted","dragEnded","keyup","keydown","label","rows","todayValue","startValue","endValue","comparisonStart","comparisonEnd","previewStart","previewEnd","isRange","labelMinRequiredCells","activeCell","startDateAccessibleName","endDateAccessibleName"],[1,"cdk-visually-hidden"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),Ee(3,Ta,5,2,"th",2,ha),u(),c(5,"tr",3),T(6,"th",4),u()(),c(7,"tbody",5),f("selectedValueChange",function(r){return a._dateSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("previewChange",function(r){return a._previewChanged(r)})("dragStarted",function(r){return a.dragStarted.emit(r)})("dragEnded",function(r){return a._dragEnded(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),u()()),t&2&&(l(3),Ie(a._weekdays()),l(4),v("label",a._monthLabel())("rows",a._weeks())("todayValue",a._todayDate())("startValue",a._rangeStart())("endValue",a._rangeEnd())("comparisonStart",a._comparisonRangeStart())("comparisonEnd",a._comparisonRangeEnd())("previewStart",a._previewStart())("previewEnd",a._previewEnd())("isRange",a._isRange())("labelMinRequiredCells",3)("activeCell",a._dateAdapter.getDate(a.activeDate)-1)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName))},dependencies:[te],encapsulation:2})}return i})(),w=24,_t=4,oa=(()=>{class i{_changeDetectorRef=o(F);_dateAdapter=o(_,{optional:!0});_dir=o(G,{optional:!0});_rerenderSubscription=A.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),pa(this._dateAdapter,t,this._activeDate,this.minDate,this.maxDate)||this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof g?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedYear(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new h;yearSelected=new h;activeDateChange=new h;_matCalendarBody;_years=p([]);_todayYear=p(0);_selectedYear=p(null);constructor(){this._dateAdapter,this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ae(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_init(){this._todayYear.set(this._dateAdapter.getYear(this._dateAdapter.today()));let t=this._dateAdapter.getYear(this._activeDate)-fe(this._dateAdapter,this.activeDate,this.minDate,this.maxDate),a=[];for(let n=0,r=[];n<w;n++)r.push(t+n),r.length==_t&&(a.push(r.map(d=>this._createCellForYear(d))),r=[]);this._years.set(a),this._changeDetectorRef.markForCheck()}_yearSelected(e){let t=e.value,a=this._dateAdapter.createDate(t,0,1),n=this._getDateFromYear(t);this.yearSelected.emit(a),this.selectedChange.emit(n)}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromYear(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-_t);break;case 40:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,_t);break;case 36:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,-fe(this._dateAdapter,this.activeDate,this.minDate,this.maxDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,w-fe(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)-1);break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-w*10:-w);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?w*10:w);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked(),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._yearSelected({value:this._dateAdapter.getYear(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_getActiveCell(){return fe(this._dateAdapter,this.activeDate,this.minDate,this.maxDate)}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getDateFromYear(e){let t=this._dateAdapter.getMonth(this.activeDate),a=this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(e,t,1));return this._dateAdapter.createDate(e,t,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForYear(e){let t=this._dateAdapter.createDate(e,0,1),a=this._dateAdapter.getYearName(t),n=this.dateClass?this.dateClass(t,"multi-year"):void 0;return new De(e,a,a,this._shouldEnableYear(e),n)}_shouldEnableYear(e){if(e==null||this.maxDate&&e>this._dateAdapter.getYear(this.maxDate)||this.minDate&&e<this._dateAdapter.getYear(this.minDate))return!1;if(!this.dateFilter)return!0;let t=this._dateAdapter.createDate(e,0,1);for(let a=t;this._dateAdapter.getYear(a)==e;a=this._dateAdapter.addCalendarDays(a,1))if(this.dateFilter(a))return!0;return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedYear(e){if(this._selectedYear.set(null),e instanceof g){let t=e.start||e.end;t&&this._selectedYear.set(this._dateAdapter.getYear(t))}else e&&this._selectedYear.set(this._dateAdapter.getYear(e))}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-multi-year-view"]],viewQuery:function(t,a){if(t&1&&j(te,5),t&2){let n;E(n=I())&&(a._matCalendarBody=n.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",activeDateChange:"activeDateChange"},exportAs:["matMultiYearView"],decls:5,vars:7,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","rows","todayValue","startValue","endValue","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),T(3,"th",2),u()(),c(4,"tbody",3),f("selectedValueChange",function(r){return a._yearSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),u()()),t&2&&(l(4),v("rows",a._years())("todayValue",a._todayYear())("startValue",a._selectedYear())("endValue",a._selectedYear())("numCols",4)("cellAspectRatio",4/7)("activeCell",a._getActiveCell()))},dependencies:[te],encapsulation:2})}return i})();function pa(i,s,e,t,a){let n=i.getYear(s),r=i.getYear(e),d=ma(i,t,a);return Math.floor((n-d)/w)===Math.floor((r-d)/w)}function fe(i,s,e,t){let a=i.getYear(s);return Ja(a-ma(i,e,t),w)}function ma(i,s,e){let t=0;return e?t=i.getYear(e)-w+1:s&&(t=i.getYear(s)),t}function Ja(i,s){return(i%s+s)%s}var da=(()=>{class i{_changeDetectorRef=o(F);_dateFormats=o(B,{optional:!0});_dateAdapter=o(_,{optional:!0});_dir=o(G,{optional:!0});_rerenderSubscription=A.EMPTY;_selectionKeyPressed=!1;get activeDate(){return this._activeDate}set activeDate(e){let t=this._activeDate,a=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))||this._dateAdapter.today();this._activeDate=this._dateAdapter.clampDate(a,this.minDate,this.maxDate),this._dateAdapter.getYear(t)!==this._dateAdapter.getYear(this._activeDate)&&this._init()}_activeDate;get selected(){return this._selected}set selected(e){e instanceof g?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e)),this._setSelectedMonth(e)}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;selectedChange=new h;monthSelected=new h;activeDateChange=new h;_matCalendarBody;_months=p([]);_yearLabel=p("");_todayMonth=p(null);_selectedMonth=p(null);constructor(){this._activeDate=this._dateAdapter.today()}ngAfterContentInit(){this._rerenderSubscription=this._dateAdapter.localeChanges.pipe(Ae(null)).subscribe(()=>this._init())}ngOnDestroy(){this._rerenderSubscription.unsubscribe()}_monthSelected(e){let t=e.value,a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),t,1);this.monthSelected.emit(a);let n=this._getDateFromMonth(t);this.selectedChange.emit(n)}_updateActiveDate(e){let t=e.value,a=this._activeDate;this.activeDate=this._getDateFromMonth(t),this._dateAdapter.compareDate(a,this.activeDate)&&this.activeDateChange.emit(this.activeDate)}_handleCalendarBodyKeydown(e){let t=this._activeDate,a=this._isRtl();switch(e.keyCode){case 37:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?1:-1);break;case 39:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,a?-1:1);break;case 38:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-4);break;case 40:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,4);break;case 36:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,-this._dateAdapter.getMonth(this._activeDate));break;case 35:this.activeDate=this._dateAdapter.addCalendarMonths(this._activeDate,11-this._dateAdapter.getMonth(this._activeDate));break;case 33:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?-10:-1);break;case 34:this.activeDate=this._dateAdapter.addCalendarYears(this._activeDate,e.altKey?10:1);break;case 13:case 32:this._selectionKeyPressed=!0;break;default:return}this._dateAdapter.compareDate(t,this.activeDate)&&(this.activeDateChange.emit(this.activeDate),this._focusActiveCellAfterViewChecked()),e.preventDefault()}_handleCalendarBodyKeyup(e){(e.keyCode===32||e.keyCode===13)&&(this._selectionKeyPressed&&this._monthSelected({value:this._dateAdapter.getMonth(this._activeDate),event:e}),this._selectionKeyPressed=!1)}_init(){this._setSelectedMonth(this.selected),this._todayMonth.set(this._getMonthInCurrentYear(this._dateAdapter.today())),this._yearLabel.set(this._dateAdapter.getYearName(this.activeDate));let e=this._dateAdapter.getMonthNames("short");this._months.set([[0,1,2,3],[4,5,6,7],[8,9,10,11]].map(t=>t.map(a=>this._createCellForMonth(a,e[a])))),this._changeDetectorRef.markForCheck()}_focusActiveCell(){this._matCalendarBody._focusActiveCell()}_focusActiveCellAfterViewChecked(){this._matCalendarBody._scheduleFocusActiveCellAfterViewChecked()}_getMonthInCurrentYear(e){return e&&this._dateAdapter.getYear(e)==this._dateAdapter.getYear(this.activeDate)?this._dateAdapter.getMonth(e):null}_getDateFromMonth(e){let t=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),a=this._dateAdapter.getNumDaysInMonth(t);return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,Math.min(this._dateAdapter.getDate(this.activeDate),a))}_createCellForMonth(e,t){let a=this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate),e,1),n=this._dateAdapter.format(a,this._dateFormats.display.monthYearA11yLabel),r=this.dateClass?this.dateClass(a,"year"):void 0;return new De(e,t.toLocaleUpperCase(),n,this._shouldEnableMonth(e),r)}_shouldEnableMonth(e){let t=this._dateAdapter.getYear(this.activeDate);if(e==null||this._isYearAndMonthAfterMaxDate(t,e)||this._isYearAndMonthBeforeMinDate(t,e))return!1;if(!this.dateFilter)return!0;let a=this._dateAdapter.createDate(t,e,1);for(let n=a;this._dateAdapter.getMonth(n)==e;n=this._dateAdapter.addCalendarDays(n,1))if(this.dateFilter(n))return!0;return!1}_isYearAndMonthAfterMaxDate(e,t){if(this.maxDate){let a=this._dateAdapter.getYear(this.maxDate),n=this._dateAdapter.getMonth(this.maxDate);return e>a||e===a&&t>n}return!1}_isYearAndMonthBeforeMinDate(e,t){if(this.minDate){let a=this._dateAdapter.getYear(this.minDate),n=this._dateAdapter.getMonth(this.minDate);return e<a||e===a&&t<n}return!1}_isRtl(){return this._dir&&this._dir.value==="rtl"}_setSelectedMonth(e){e instanceof g?this._selectedMonth.set(this._getMonthInCurrentYear(e.start)||this._getMonthInCurrentYear(e.end)):this._selectedMonth.set(this._getMonthInCurrentYear(e))}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-year-view"]],viewQuery:function(t,a){if(t&1&&j(te,5),t&2){let n;E(n=I())&&(a._matCalendarBody=n.first)}},inputs:{activeDate:"activeDate",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass"},outputs:{selectedChange:"selectedChange",monthSelected:"monthSelected",activeDateChange:"activeDateChange"},exportAs:["matYearView"],decls:5,vars:9,consts:[["role","grid",1,"mat-calendar-table"],["aria-hidden","true",1,"mat-calendar-table-header"],["colspan","4",1,"mat-calendar-table-header-divider"],["mat-calendar-body","",3,"selectedValueChange","activeDateChange","keyup","keydown","label","rows","todayValue","startValue","endValue","labelMinRequiredCells","numCols","cellAspectRatio","activeCell"]],template:function(t,a){t&1&&(c(0,"table",0)(1,"thead",1)(2,"tr"),T(3,"th",2),u()(),c(4,"tbody",3),f("selectedValueChange",function(r){return a._monthSelected(r)})("activeDateChange",function(r){return a._updateActiveDate(r)})("keyup",function(r){return a._handleCalendarBodyKeyup(r)})("keydown",function(r){return a._handleCalendarBodyKeydown(r)}),u()()),t&2&&(l(4),v("label",a._yearLabel())("rows",a._months())("todayValue",a._todayMonth())("startValue",a._selectedMonth())("endValue",a._selectedMonth())("labelMinRequiredCells",2)("numCols",4)("cellAspectRatio",4/7)("activeCell",a._dateAdapter.getMonth(a.activeDate)))},dependencies:[te],encapsulation:2})}return i})(),_a=(()=>{class i{_intl=o(ie);calendar=o(gt);_dateAdapter=o(_,{optional:!0});_dateFormats=o(B,{optional:!0});_periodButtonText;_periodButtonDescription;_periodButtonLabel;_prevButtonLabel;_nextButtonLabel;constructor(){o(me).load(Ye);let e=o(F);this._updateLabels(),this.calendar.stateChanges.subscribe(()=>{this._updateLabels(),e.markForCheck()})}get periodButtonText(){return this._periodButtonText}get periodButtonDescription(){return this._periodButtonDescription}get periodButtonLabel(){return this._periodButtonLabel}get prevButtonLabel(){return this._prevButtonLabel}get nextButtonLabel(){return this._nextButtonLabel}currentPeriodClicked(){this.calendar.currentView=this.calendar.currentView=="month"?"multi-year":"month"}previousClicked(){this.previousEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,-1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?-1:-w))}nextClicked(){this.nextEnabled()&&(this.calendar.activeDate=this.calendar.currentView=="month"?this._dateAdapter.addCalendarMonths(this.calendar.activeDate,1):this._dateAdapter.addCalendarYears(this.calendar.activeDate,this.calendar.currentView=="year"?1:w))}previousEnabled(){return this.calendar.minDate?!this.calendar.minDate||!this._isSameView(this.calendar.activeDate,this.calendar.minDate):!0}nextEnabled(){return!this.calendar.maxDate||!this._isSameView(this.calendar.activeDate,this.calendar.maxDate)}_updateLabels(){let e=this.calendar,t=this._intl,a=this._dateAdapter;e.currentView==="month"?(this._periodButtonText=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonDescription=a.format(e.activeDate,this._dateFormats.display.monthYearLabel).toLocaleUpperCase(),this._periodButtonLabel=t.switchToMultiYearViewLabel,this._prevButtonLabel=t.prevMonthLabel,this._nextButtonLabel=t.nextMonthLabel):e.currentView==="year"?(this._periodButtonText=a.getYearName(e.activeDate),this._periodButtonDescription=a.getYearName(e.activeDate),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevYearLabel,this._nextButtonLabel=t.nextYearLabel):(this._periodButtonText=t.formatYearRange(...this._formatMinAndMaxYearLabels()),this._periodButtonDescription=t.formatYearRangeLabel(...this._formatMinAndMaxYearLabels()),this._periodButtonLabel=t.switchToMonthViewLabel,this._prevButtonLabel=t.prevMultiYearLabel,this._nextButtonLabel=t.nextMultiYearLabel)}_isSameView(e,t){return this.calendar.currentView=="month"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t)&&this._dateAdapter.getMonth(e)==this._dateAdapter.getMonth(t):this.calendar.currentView=="year"?this._dateAdapter.getYear(e)==this._dateAdapter.getYear(t):pa(this._dateAdapter,e,t,this.calendar.minDate,this.calendar.maxDate)}_formatMinAndMaxYearLabels(){let t=this._dateAdapter.getYear(this.calendar.activeDate)-fe(this._dateAdapter,this.calendar.activeDate,this.calendar.minDate,this.calendar.maxDate),a=t+w-1,n=this._dateAdapter.getYearName(this._dateAdapter.createDate(t,0,1)),r=this._dateAdapter.getYearName(this._dateAdapter.createDate(a,0,1));return[n,r]}_periodButtonLabelId=o(_e).getId("mat-calendar-period-label-");static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-calendar-header"]],exportAs:["matCalendarHeader"],ngContentSelectors:Ra,decls:17,vars:13,consts:[[1,"mat-calendar-header"],[1,"mat-calendar-controls"],["aria-live","polite",1,"cdk-visually-hidden",3,"id"],["matButton","","type","button",1,"mat-calendar-period-button",3,"click"],["aria-hidden","true"],["viewBox","0 0 10 5","focusable","false","aria-hidden","true",1,"mat-calendar-arrow"],["points","0,0 5,5 10,0"],[1,"mat-calendar-spacer"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-previous-button",3,"click","disabled","matTooltip"],["viewBox","0 0 24 24","focusable","false","aria-hidden","true"],["d","M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"],["matIconButton","","type","button","disabledInteractive","",1,"mat-calendar-next-button",3,"click","disabled","matTooltip"],["d","M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"]],template:function(t,a){t&1&&(xe(),c(0,"div",0)(1,"div",1)(2,"span",2),b(3),u(),c(4,"button",3),f("click",function(){return a.currentPeriodClicked()}),c(5,"span",4),b(6),u(),oe(),c(7,"svg",5),T(8,"polygon",6),u()(),qe(),T(9,"div",7),pe(10),c(11,"button",8),f("click",function(){return a.previousClicked()}),oe(),c(12,"svg",9),T(13,"path",10),u()(),qe(),c(14,"button",11),f("click",function(){return a.nextClicked()}),oe(),c(15,"svg",9),T(16,"path",12),u()()()()),t&2&&(l(2),v("id",a._periodButtonLabelId),l(),O(a.periodButtonDescription),l(),D("aria-label",a.periodButtonLabel)("aria-describedby",a._periodButtonLabelId),l(2),O(a.periodButtonText),l(),x("mat-calendar-invert",a.calendar.currentView!=="month"),l(4),v("disabled",!a.previousEnabled())("matTooltip",a.prevButtonLabel),D("aria-label",a.prevButtonLabel),l(3),v("disabled",!a.nextEnabled())("matTooltip",a.nextButtonLabel),D("aria-label",a.nextButtonLabel))},dependencies:[nt,at,na],encapsulation:2})}return i})(),gt=(()=>{class i{_dateAdapter=o(_,{optional:!0});_dateFormats=o(B,{optional:!0});_changeDetectorRef=o(F);_elementRef=o(z);headerComponent;_calendarHeaderPortal;_intlChanges;_moveFocusOnNextTick=!1;get startAt(){return this._startAt}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_startAt=null;startView="month";get selected(){return this._selected}set selected(e){e instanceof g?this._selected=e:this._selected=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_selected=null;get minDate(){return this._minDate}set minDate(e){this._minDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_minDate=null;get maxDate(){return this._maxDate}set maxDate(e){this._maxDate=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_maxDate=null;dateFilter;dateClass;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;selectedChange=new h;yearSelected=new h;monthSelected=new h;viewChanged=new h(!0);_userSelection=new h;_userDragDrop=new h;monthView;yearView;multiYearView;get activeDate(){return this._clampedActiveDate}set activeDate(e){this._clampedActiveDate=this._dateAdapter.clampDate(e,this.minDate,this.maxDate),this.stateChanges.next(),this._changeDetectorRef.markForCheck()}_clampedActiveDate;get currentView(){return this._currentView}set currentView(e){let t=this._currentView!==e?e:null;this._currentView=e,this._moveFocusOnNextTick=!0,this._changeDetectorRef.markForCheck(),t&&(this.stateChanges.next(),this.viewChanged.emit(t))}_currentView;_activeDrag=null;stateChanges=new k;constructor(){this._intlChanges=o(ie).changes.subscribe(()=>{this._changeDetectorRef.markForCheck(),this.stateChanges.next()})}ngAfterContentInit(){this._calendarHeaderPortal=new it(this.headerComponent||_a),this.activeDate=this.startAt||this._dateAdapter.today(),this._currentView=this.startView}ngAfterViewChecked(){this._moveFocusOnNextTick&&(this._moveFocusOnNextTick=!1,this.focusActiveCell())}ngOnDestroy(){this._intlChanges.unsubscribe(),this.stateChanges.complete()}ngOnChanges(e){let t=e.minDate&&!this._dateAdapter.sameDate(e.minDate.previousValue,e.minDate.currentValue)?e.minDate:void 0,a=e.maxDate&&!this._dateAdapter.sameDate(e.maxDate.previousValue,e.maxDate.currentValue)?e.maxDate:void 0,n=t||a||e.dateFilter;if(n&&!n.firstChange){let r=this._getCurrentViewComponent();r&&(this._elementRef.nativeElement.contains(Xe())&&(this._moveFocusOnNextTick=!0),this._changeDetectorRef.detectChanges(),r._init())}this.stateChanges.next()}focusActiveCell(){this._getCurrentViewComponent()?._focusActiveCell(!1)}updateTodaysDate(){this._getCurrentViewComponent()?._init()}_dateSelected(e){let t=e.value;(this.selected instanceof g||t&&!this._dateAdapter.sameDate(t,this.selected))&&this.selectedChange.emit(t),this._userSelection.emit(e)}_yearSelectedInMultiYearView(e){this.yearSelected.emit(e)}_monthSelectedInYearView(e){this.monthSelected.emit(e)}_goToDateInView(e,t){this.activeDate=e,this.currentView=t}_dragStarted(e){this._activeDrag=e}_dragEnded(e){this._activeDrag&&(e.value&&this._userDragDrop.emit(e),this._activeDrag=null)}_getCurrentViewComponent(){return this.monthView||this.yearView||this.multiYearView}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-calendar"]],viewQuery:function(t,a){if(t&1&&j(sa,5)(da,5)(oa,5),t&2){let n;E(n=I())&&(a.monthView=n.first),E(n=I())&&(a.yearView=n.first),E(n=I())&&(a.multiYearView=n.first)}},hostAttrs:[1,"mat-calendar"],inputs:{headerComponent:"headerComponent",startAt:"startAt",startView:"startView",selected:"selected",minDate:"minDate",maxDate:"maxDate",dateFilter:"dateFilter",dateClass:"dateClass",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd",startDateAccessibleName:"startDateAccessibleName",endDateAccessibleName:"endDateAccessibleName"},outputs:{selectedChange:"selectedChange",yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",_userSelection:"_userSelection",_userDragDrop:"_userDragDrop"},exportAs:["matCalendar"],features:[L([ua]),Y],decls:5,vars:2,consts:[[3,"cdkPortalOutlet"],["cdkMonitorSubtreeFocus","","tabindex","-1",1,"mat-calendar-content"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","_userSelection","dragStarted","dragEnded","activeDate","selected","dateFilter","maxDate","minDate","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName","activeDrag"],[3,"activeDateChange","monthSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"],[3,"activeDateChange","yearSelected","selectedChange","activeDate","selected","dateFilter","maxDate","minDate","dateClass"]],template:function(t,a){if(t&1&&(Ge(0,Oa,0,0,"ng-template",0),c(1,"div",1),ce(2,Na,1,11,"mat-month-view",2)(3,Ya,1,6,"mat-year-view",3)(4,Pa,1,6,"mat-multi-year-view",3),u()),t&2){let n;v("cdkPortalOutlet",a._calendarHeaderPortal),l(2),he((n=a.currentView)==="month"?2:n==="year"?3:n==="multi-year"?4:-1)}},dependencies:[rt,Je,sa,da,oa],styles:[`.mat-calendar {
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
`],encapsulation:2})}return i})(),en=new $("mat-datepicker-scroll-strategy",{providedIn:"root",factory:()=>{let i=o(de);return()=>Gt(i)}}),ga=(()=>{class i{_elementRef=o(z);_animationsDisabled=et();_changeDetectorRef=o(F);_globalModel=o(H);_dateAdapter=o(_);_ngZone=o(Qe);_rangeSelectionStrategy=o(He,{optional:!0});_stateChanges;_model;_eventCleanups;_animationFallback;_calendar;color;datepicker;comparisonStart=null;comparisonEnd=null;startDateAccessibleName=null;endDateAccessibleName=null;_isAbove=!1;_animationDone=new k;_isAnimating=!1;_closeButtonText;_closeButtonFocused=!1;_actionsPortal=null;_dialogLabelId=null;constructor(){if(o(me).load(Ye),this._closeButtonText=o(ie).closeCalendarLabel,!this._animationsDisabled){let e=this._elementRef.nativeElement,t=o(Ue);this._eventCleanups=this._ngZone.runOutsideAngular(()=>[t.listen(e,"animationstart",this._handleAnimationEvent),t.listen(e,"animationend",this._handleAnimationEvent),t.listen(e,"animationcancel",this._handleAnimationEvent)])}}ngAfterViewInit(){this._stateChanges=this.datepicker.stateChanges.subscribe(()=>{this._changeDetectorRef.markForCheck()}),this._calendar.focusActiveCell()}ngOnDestroy(){clearTimeout(this._animationFallback),this._eventCleanups?.forEach(e=>e()),this._stateChanges?.unsubscribe(),this._animationDone.complete()}_handleUserSelection(e){let t=this._model.selection,a=e.value,n=t instanceof g;if(n&&this._rangeSelectionStrategy){let r=this._rangeSelectionStrategy.selectionFinished(a,t,e.event);this._model.updateSelection(r,this)}else a&&(n||!this._dateAdapter.sameDate(a,t))&&this._model.add(a);(!this._model||this._model.isComplete())&&!this._actionsPortal&&this.datepicker.close()}_handleUserDragDrop(e){this._model.updateSelection(e.value,this)}_startExitAnimation(){this._elementRef.nativeElement.classList.add("mat-datepicker-content-exit"),this._animationsDisabled?this._animationDone.next():(clearTimeout(this._animationFallback),this._animationFallback=setTimeout(()=>{this._isAnimating||this._animationDone.next()},200))}_handleAnimationEvent=e=>{let t=this._elementRef.nativeElement;e.target!==t||!e.animationName.startsWith("_mat-datepicker-content")||(clearTimeout(this._animationFallback),this._isAnimating=e.type==="animationstart",t.classList.toggle("mat-datepicker-content-animating",this._isAnimating),this._isAnimating||this._animationDone.next())};_getSelected(){return this._model.selection}_applyPendingSelection(){this._model!==this._globalModel&&this._globalModel.updateSelection(this._model.selection,this)}_assignActions(e,t){this._model=e?this._globalModel.clone():this._globalModel,this._actionsPortal=e,t&&this._changeDetectorRef.detectChanges()}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-datepicker-content"]],viewQuery:function(t,a){if(t&1&&j(gt,5),t&2){let n;E(n=I())&&(a._calendar=n.first)}},hostAttrs:[1,"mat-datepicker-content"],hostVars:6,hostBindings:function(t,a){t&2&&(Te(a.color?"mat-"+a.color:""),x("mat-datepicker-content-touch",a.datepicker.touchUi)("mat-datepicker-content-animations-enabled",!a._animationsDisabled))},inputs:{color:"color"},exportAs:["matDatepickerContent"],decls:5,vars:26,consts:[["cdkTrapFocus","","role","dialog",1,"mat-datepicker-content-container"],[3,"yearSelected","monthSelected","viewChanged","_userSelection","_userDragDrop","id","startAt","startView","minDate","maxDate","dateFilter","headerComponent","selected","dateClass","comparisonStart","comparisonEnd","startDateAccessibleName","endDateAccessibleName"],[3,"cdkPortalOutlet"],["type","button","matButton","elevated",1,"mat-datepicker-close-button",3,"focus","blur","click","color"]],template:function(t,a){t&1&&(c(0,"div",0)(1,"mat-calendar",1),f("yearSelected",function(r){return a.datepicker._selectYear(r)})("monthSelected",function(r){return a.datepicker._selectMonth(r)})("viewChanged",function(r){return a.datepicker._viewChanged(r)})("_userSelection",function(r){return a._handleUserSelection(r)})("_userDragDrop",function(r){return a._handleUserDragDrop(r)}),u(),Ge(2,La,0,0,"ng-template",2),c(3,"button",3),f("focus",function(){return a._closeButtonFocused=!0})("blur",function(){return a._closeButtonFocused=!1})("click",function(){return a.datepicker.close()}),b(4),u()()),t&2&&(x("mat-datepicker-content-container-with-custom-header",a.datepicker.calendarHeaderComponent)("mat-datepicker-content-container-with-actions",a._actionsPortal),D("aria-modal",!0)("aria-labelledby",a._dialogLabelId??void 0),l(),Te(a.datepicker.panelClass),v("id",a.datepicker.id)("startAt",a.datepicker.startAt)("startView",a.datepicker.startView)("minDate",a.datepicker._getMinDate())("maxDate",a.datepicker._getMaxDate())("dateFilter",a.datepicker._getDateFilter())("headerComponent",a.datepicker.calendarHeaderComponent)("selected",a._getSelected())("dateClass",a.datepicker.dateClass)("comparisonStart",a.comparisonStart)("comparisonEnd",a.comparisonEnd)("startDateAccessibleName",a.startDateAccessibleName)("endDateAccessibleName",a.endDateAccessibleName),l(),v("cdkPortalOutlet",a._actionsPortal),l(),x("cdk-visually-hidden",!a._closeButtonFocused),v("color",a.color||"primary"),l(),O(a._closeButtonText))},dependencies:[Tt,gt,rt,nt],styles:[`@keyframes _mat-datepicker-content-dropdown-enter {
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
`],encapsulation:2})}return i})(),ze=(()=>{class i{_injector=o(de);_viewContainerRef=o(kt);_dateAdapter=o(_,{optional:!0});_dir=o(G,{optional:!0});_model=o(H);_animationsDisabled=et();_scrollStrategy=o(en);_inputStateChanges=A.EMPTY;_document=o(At);calendarHeaderComponent;get startAt(){return this._startAt||(this.datepickerInput?this.datepickerInput.getStartValue():null)}set startAt(e){this._startAt=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e))}_startAt=null;startView="month";get color(){return this._color||(this.datepickerInput?this.datepickerInput.getThemePalette():void 0)}set color(e){this._color=e}_color;touchUi=!1;get disabled(){return this._disabled===void 0&&this.datepickerInput?this.datepickerInput.disabled:!!this._disabled}set disabled(e){e!==this._disabled&&(this._disabled=e,this.stateChanges.next(void 0))}_disabled;xPosition="start";yPosition="below";restoreFocus=!0;yearSelected=new h;monthSelected=new h;viewChanged=new h(!0);dateClass;openedStream=new h;closedStream=new h;get panelClass(){return this._panelClass}set panelClass(e){this._panelClass=Nt(e)}_panelClass;get opened(){return this._opened}set opened(e){e?this.open():this.close()}_opened=!1;id=o(_e).getId("mat-datepicker-");_getMinDate(){return this.datepickerInput&&this.datepickerInput.min}_getMaxDate(){return this.datepickerInput&&this.datepickerInput.max}_getDateFilter(){return this.datepickerInput&&this.datepickerInput.dateFilter}_overlayRef=null;_componentRef=null;_focusedElementBeforeOpen=null;_backdropHarnessClass=`${this.id}-backdrop`;_actionsPortal=null;datepickerInput;stateChanges=new k;_changeDetectorRef=o(F);constructor(){this._dateAdapter,this._model.selectionChanged.subscribe(()=>{this._changeDetectorRef.markForCheck()})}ngOnChanges(e){let t=e.xPosition||e.yPosition;if(t&&!t.firstChange&&this._overlayRef){let a=this._overlayRef.getConfig().positionStrategy;a instanceof Jt&&(this._setConnectedPositions(a),this.opened&&this._overlayRef.updatePosition())}this.stateChanges.next(void 0)}ngOnDestroy(){this._destroyOverlay(),this.close(),this._inputStateChanges.unsubscribe(),this.stateChanges.complete()}select(e){this._model.add(e)}_selectYear(e){this.yearSelected.emit(e)}_selectMonth(e){this.monthSelected.emit(e)}_viewChanged(e){this.viewChanged.emit(e)}registerInput(e){return this.datepickerInput,this._inputStateChanges.unsubscribe(),this.datepickerInput=e,this._inputStateChanges=e.stateChanges.subscribe(()=>this.stateChanges.next(void 0)),this._model}registerActions(e){this._actionsPortal,this._actionsPortal=e,this._componentRef?.instance._assignActions(e,!0)}removeActions(e){e===this._actionsPortal&&(this._actionsPortal=null,this._componentRef?.instance._assignActions(null,!0))}open(){this._opened||this.disabled||this._componentRef?.instance._isAnimating||(this.datepickerInput,this._focusedElementBeforeOpen=Xe(),this._openOverlay(),this._opened=!0,this.openedStream.emit())}close(){if(!this._opened||this._componentRef?.instance._isAnimating)return;let e=this.restoreFocus&&this._focusedElementBeforeOpen&&typeof this._focusedElementBeforeOpen.focus=="function",t=()=>{this._opened&&(this._opened=!1,this.closedStream.emit())};if(this._componentRef){let{instance:a,location:n}=this._componentRef;a._animationDone.pipe(wt(1)).subscribe(()=>{let r=this._document.activeElement;e&&(!r||r===this._document.activeElement||n.nativeElement.contains(r))&&this._focusedElementBeforeOpen.focus(),this._focusedElementBeforeOpen=null,this._destroyOverlay()}),a._startExitAnimation()}e?setTimeout(t):t()}_applyPendingSelection(){this._componentRef?.instance?._applyPendingSelection()}_forwardContentValues(e){e.datepicker=this,e.color=this.color,e._dialogLabelId=this.datepickerInput.getOverlayLabelId(),e._assignActions(this._actionsPortal,!1)}_openOverlay(){this._destroyOverlay();let e=this.touchUi,t=new it(ga,this._viewContainerRef),a=this._overlayRef=ta(this._injector,new Zt({positionStrategy:e?this._getDialogStrategy():this._getDropdownStrategy(),hasBackdrop:!0,backdropClass:[e?"cdk-overlay-dark-backdrop":"mat-overlay-transparent-backdrop",this._backdropHarnessClass],direction:this._dir||"ltr",scrollStrategy:e?Ut(this._injector):this._scrollStrategy(),panelClass:`mat-datepicker-${e?"dialog":"popup"}`,disableAnimations:this._animationsDisabled}));this._getCloseStream(a).subscribe(n=>{n&&n.preventDefault(),this.close()}),a.keydownEvents().subscribe(n=>{let r=n.keyCode;(r===38||r===40||r===37||r===39||r===33||r===34)&&n.preventDefault()}),this._componentRef=a.attach(t),this._forwardContentValues(this._componentRef.instance),e||$e(()=>{a.updatePosition()},{injector:this._injector})}_destroyOverlay(){this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=this._componentRef=null)}_getDialogStrategy(){return ea(this._injector).centerHorizontally().centerVertically()}_getDropdownStrategy(){let e=Xt(this._injector,this.datepickerInput.getConnectedOverlayOrigin()).withTransformOriginOn(".mat-datepicker-content").withFlexibleDimensions(!1).withViewportMargin(8).withLockedPosition();return this._setConnectedPositions(e)}_setConnectedPositions(e){let t=this.xPosition==="end"?"end":"start",a=t==="start"?"end":"start",n=this.yPosition==="above"?"bottom":"top",r=n==="top"?"bottom":"top";return e.withPositions([{originX:t,originY:r,overlayX:t,overlayY:n},{originX:t,originY:n,overlayX:t,overlayY:r},{originX:a,originY:r,overlayX:a,overlayY:n},{originX:a,originY:n,overlayX:a,overlayY:r}])}_getCloseStream(e){let t=["ctrlKey","shiftKey","metaKey"];return re(e.backdropClick(),e.detachments(),e.keydownEvents().pipe(Ct(a=>a.keyCode===27&&!W(a)||this.datepickerInput&&W(a,"altKey")&&a.keyCode===38&&t.every(n=>!W(a,n)))))}static \u0275fac=function(t){return new(t||i)};static \u0275dir=P({type:i,inputs:{calendarHeaderComponent:"calendarHeaderComponent",startAt:"startAt",startView:"startView",color:"color",touchUi:[2,"touchUi","touchUi",N],disabled:[2,"disabled","disabled",N],xPosition:"xPosition",yPosition:"yPosition",restoreFocus:[2,"restoreFocus","restoreFocus",N],dateClass:"dateClass",panelClass:"panelClass",opened:[2,"opened","opened",N]},outputs:{yearSelected:"yearSelected",monthSelected:"monthSelected",viewChanged:"viewChanged",openedStream:"opened",closedStream:"closed"},features:[Y]})}return i})(),ni=(()=>{class i extends ze{static \u0275fac=(()=>{let e;return function(a){return(e||(e=le(i)))(a||i)}})();static \u0275cmp=M({type:i,selectors:[["mat-datepicker"]],exportAs:["matDatepicker"],features:[L([ua,{provide:ze,useExisting:i}]),K],decls:0,vars:0,template:function(t,a){},encapsulation:2})}return i})(),X=class{target;targetElement;value=null;constructor(s,e){this.target=s,this.targetElement=e,this.value=this.target.value}},fa=(()=>{class i{_elementRef=o(z);_dateAdapter=o(_,{optional:!0});_dateFormats=o(B,{optional:!0});_isInitialized=!1;get value(){return this._model?this._getValueFromModel(this._model.selection):this._pendingValue}set value(e){this._assignValueProgrammatically(e,!0)}_model;get disabled(){return!!this._disabled||this._parentDisabled()}set disabled(e){let t=e,a=this._elementRef.nativeElement;this._disabled!==t&&(this._disabled=t,this.stateChanges.next(void 0)),t&&this._isInitialized&&a.blur&&a.blur()}_disabled;dateChange=new h;dateInput=new h;stateChanges=new k;_onTouched=()=>{};_validatorOnChange=()=>{};_cvaOnChange=()=>{};_valueChangesSubscription=A.EMPTY;_localeSubscription=A.EMPTY;_pendingValue=null;_parseValidator=()=>this._lastValueValid?null:{matDatepickerParse:{text:this._elementRef.nativeElement.value}};_filterValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value));return!t||this._matchesFilter(t)?null:{matDatepickerFilter:!0}};_minValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._getMinDate();return!a||!t||this._dateAdapter.compareDate(a,t)<=0?null:{matDatepickerMin:{min:a,actual:t}}};_maxValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._getMaxDate();return!a||!t||this._dateAdapter.compareDate(a,t)>=0?null:{matDatepickerMax:{max:a,actual:t}}};_getValidators(){return[this._parseValidator,this._minValidator,this._maxValidator,this._filterValidator]}_registerModel(e){this._model=e,this._valueChangesSubscription.unsubscribe(),this._pendingValue&&this._assignValue(this._pendingValue),this._valueChangesSubscription=this._model.selectionChanged.subscribe(t=>{if(this._shouldHandleChangeEvent(t)){let a=this._getValueFromModel(t.selection);this._lastValueValid=this._isValidValue(a),this._cvaOnChange(a),this._onTouched(),this._formatValue(a),this.dateInput.emit(new X(this,this._elementRef.nativeElement)),this.dateChange.emit(new X(this,this._elementRef.nativeElement))}})}_lastValueValid=!1;constructor(){this._localeSubscription=this._dateAdapter.localeChanges.subscribe(()=>{this._assignValueProgrammatically(this.value,!0)})}ngAfterViewInit(){this._isInitialized=!0}ngOnChanges(e){ba(e,this._dateAdapter)&&this.stateChanges.next(void 0)}ngOnDestroy(){this._valueChangesSubscription.unsubscribe(),this._localeSubscription.unsubscribe(),this.stateChanges.complete()}registerOnValidatorChange(e){this._validatorOnChange=e}validate(e){return this._validator?this._validator(e):null}writeValue(e){this._assignValueProgrammatically(e,e!==this.value)}registerOnChange(e){this._cvaOnChange=e}registerOnTouched(e){this._onTouched=e}setDisabledState(e){this.disabled=e}_onKeydown(e){let t=["ctrlKey","shiftKey","metaKey"];W(e,"altKey")&&e.keyCode===40&&t.every(n=>!W(e,n))&&!this._elementRef.nativeElement.readOnly&&(this._openPopup(),e.preventDefault())}_onInput(e){let t=e.target.value,a=this._lastValueValid,n=this._dateAdapter.parse(t,this._dateFormats.parse.dateInput);this._lastValueValid=this._isValidValue(n),n=this._dateAdapter.getValidDateOrNull(n);let r=!this._dateAdapter.sameDate(n,this.value);!n||r?this._cvaOnChange(n):(t&&!this.value&&this._cvaOnChange(n),a!==this._lastValueValid&&this._validatorOnChange()),r&&(this._assignValue(n),this.dateInput.emit(new X(this,this._elementRef.nativeElement)))}_onChange(){this.dateChange.emit(new X(this,this._elementRef.nativeElement))}_onBlur(){this.value&&this._formatValue(this.value),this._onTouched()}_formatValue(e){this._elementRef.nativeElement.value=e!=null?this._dateAdapter.format(e,this._dateFormats.display.dateInput):""}_assignValue(e){this._model?(this._assignValueToModel(e),this._pendingValue=null):this._pendingValue=e}_isValidValue(e){return!e||this._dateAdapter.isValid(e)}_parentDisabled(){return!1}_assignValueProgrammatically(e,t){e=this._dateAdapter.deserialize(e),this._lastValueValid=this._isValidValue(e),e=this._dateAdapter.getValidDateOrNull(e),this._assignValue(e),t&&this._formatValue(e)}_matchesFilter(e){let t=this._getDateFilter();return!t||t(e)}static \u0275fac=function(t){return new(t||i)};static \u0275dir=P({type:i,inputs:{value:"value",disabled:[2,"disabled","disabled",N]},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[Y]})}return i})();function ba(i,s){let e=Object.keys(i);for(let t of e){let{previousValue:a,currentValue:n}=i[t];if(s.isDateInstance(a)&&s.isDateInstance(n)){if(!s.sameDate(a,n))return!0}else return!0}return!1}var tn={provide:Pe,useExisting:We(()=>Da),multi:!0},an={provide:Le,useExisting:We(()=>Da),multi:!0},Da=(()=>{class i extends fa{_formField=o(tt,{optional:!0});_closedSubscription=A.EMPTY;_openedSubscription=A.EMPTY;set matDatepicker(e){e&&(this._datepicker=e,this._ariaOwns.set(e.opened?e.id:null),this._closedSubscription=e.closedStream.subscribe(()=>{this._onTouched(),this._ariaOwns.set(null)}),this._openedSubscription=e.openedStream.subscribe(()=>{this._ariaOwns.set(e.id)}),this._registerModel(e.registerInput(this)))}_datepicker;_ariaOwns=p(null);get min(){return this._min}set min(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._min)||(this._min=t,this._validatorOnChange())}_min=null;get max(){return this._max}set max(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._max)||(this._max=t,this._validatorOnChange())}_max=null;get dateFilter(){return this._dateFilter}set dateFilter(e){let t=this._matchesFilter(this.value);this._dateFilter=e,this._matchesFilter(this.value)!==t&&this._validatorOnChange()}_dateFilter;_validator=null;constructor(){super(),this._validator=ge.compose(super._getValidators())}getConnectedOverlayOrigin(){return this._formField?this._formField.getConnectedOverlayOrigin():this._elementRef}getOverlayLabelId(){return this._formField?this._formField.getLabelId():this._elementRef.nativeElement.getAttribute("aria-labelledby")}getThemePalette(){return this._formField?this._formField.color:void 0}getStartValue(){return this.value}ngOnDestroy(){super.ngOnDestroy(),this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe()}_openPopup(){this._datepicker&&this._datepicker.open()}_getValueFromModel(e){return e}_assignValueToModel(e){this._model&&this._model.updateSelection(e,this)}_getMinDate(){return this._min}_getMaxDate(){return this._max}_getDateFilter(){return this._dateFilter}_shouldHandleChangeEvent(e){return e.source!==this}static \u0275fac=function(t){return new(t||i)};static \u0275dir=P({type:i,selectors:[["input","matDatepicker",""]],hostAttrs:[1,"mat-datepicker-input"],hostVars:6,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("blur",function(){return a._onBlur()})("keydown",function(r){return a._onKeydown(r)}),t&2&&(R("disabled",a.disabled),D("aria-haspopup",a._datepicker?"dialog":null)("aria-owns",a._ariaOwns())("min",a.min?a._dateAdapter.toIso8601(a.min):null)("max",a.max?a._dateAdapter.toIso8601(a.max):null)("data-mat-calendar",a._datepicker?a._datepicker.id:null))},inputs:{matDatepicker:"matDatepicker",min:"min",max:"max",dateFilter:[0,"matDatepickerFilter","dateFilter"]},exportAs:["matDatepickerInput"],features:[L([tn,an,{provide:zt,useExisting:i}]),K]})}return i})(),nn=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275dir=P({type:i,selectors:[["","matDatepickerToggleIcon",""]]})}return i})(),rn=(()=>{class i{_intl=o(ie);_changeDetectorRef=o(F);_stateChanges=A.EMPTY;datepicker;tabIndex=null;ariaLabel;get disabled(){return this._disabled===void 0&&this.datepicker?this.datepicker.disabled:!!this._disabled}set disabled(e){this._disabled=e}_disabled;disableRipple=!1;_customIcon;_button;constructor(){let e=o(new xt("tabindex"),{optional:!0}),t=Number(e);this.tabIndex=t||t===0?t:null}ngOnChanges(e){e.datepicker&&this._watchStateChanges()}ngOnDestroy(){this._stateChanges.unsubscribe()}ngAfterContentInit(){this._watchStateChanges()}_open(e){this.datepicker&&!this.disabled&&(this.datepicker.open(),e.stopPropagation())}_watchStateChanges(){let e=this.datepicker?this.datepicker.stateChanges:we(),t=this.datepicker&&this.datepicker.datepickerInput?this.datepicker.datepickerInput.stateChanges:we(),a=this.datepicker?re(this.datepicker.openedStream,this.datepicker.closedStream):we();this._stateChanges.unsubscribe(),this._stateChanges=re(this._intl.changes,e,t,a).subscribe(()=>this._changeDetectorRef.markForCheck())}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-datepicker-toggle"]],contentQueries:function(t,a,n){if(t&1&&Et(n,nn,5),t&2){let r;E(r=I())&&(a._customIcon=r.first)}},viewQuery:function(t,a){if(t&1&&j(Ba,5),t&2){let n;E(n=I())&&(a._button=n.first)}},hostAttrs:[1,"mat-datepicker-toggle"],hostVars:8,hostBindings:function(t,a){t&1&&f("click",function(r){return a._open(r)}),t&2&&(D("tabindex",null)("data-mat-calendar",a.datepicker?a.datepicker.id:null),x("mat-datepicker-toggle-active",a.datepicker&&a.datepicker.opened)("mat-accent",a.datepicker&&a.datepicker.color==="accent")("mat-warn",a.datepicker&&a.datepicker.color==="warn"))},inputs:{datepicker:[0,"for","datepicker"],tabIndex:"tabIndex",ariaLabel:[0,"aria-label","ariaLabel"],disabled:[2,"disabled","disabled",N],disableRipple:"disableRipple"},exportAs:["matDatepickerToggle"],features:[Y],ngContentSelectors:za,decls:4,vars:7,consts:[["button",""],["matIconButton","","type","button",3,"tabIndex","disabled","disableRipple"],["viewBox","0 0 24 24","width","24px","height","24px","fill","currentColor","focusable","false","aria-hidden","true",1,"mat-datepicker-toggle-default-icon"],["d","M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"]],template:function(t,a){t&1&&(xe(Ha),c(0,"button",1,0),ce(2,Ka,2,0,":svg:svg",2),pe(3),u()),t&2&&(v("tabIndex",a.disabled?-1:a.tabIndex)("disabled",a.disabled)("disableRipple",a.disableRipple),D("aria-haspopup",a.datepicker?"dialog":null)("aria-label",a.ariaLabel||a._intl.openCalendarLabel)("aria-expanded",a.datepicker?a.datepicker.opened:null),l(2),he(a._customIcon?-1:2))},dependencies:[at],styles:[`.mat-datepicker-toggle {
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
`],encapsulation:2})}return i})(),sn=(()=>{class i{_changeDetectorRef=o(F);_elementRef=o(z);_dateAdapter=o(_,{optional:!0});_formField=o(tt,{optional:!0});_closedSubscription=A.EMPTY;_openedSubscription=A.EMPTY;_startInput;_endInput;get value(){return this._model?this._model.selection:null}id=o(_e).getId("mat-date-range-input-");focused=!1;get shouldLabelFloat(){return this.focused||!this.empty}controlType="mat-date-range-input";get placeholder(){let e=this._startInput?._getPlaceholder()||"",t=this._endInput?._getPlaceholder()||"";return e||t?`${e} ${this.separator} ${t}`:""}get rangePicker(){return this._rangePicker}set rangePicker(e){e&&(this._model=e.registerInput(this),this._rangePicker=e,this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe(),this._ariaOwns.set(this.rangePicker.opened?e.id:null),this._closedSubscription=e.closedStream.subscribe(()=>{this._startInput?._onTouched(),this._endInput?._onTouched(),this._ariaOwns.set(null)}),this._openedSubscription=e.openedStream.subscribe(()=>{this._ariaOwns.set(e.id)}),this._registerModel(this._model))}_rangePicker;_ariaOwns=p(null);get required(){return this._required??(this._isTargetRequired(this)||this._isTargetRequired(this._startInput)||this._isTargetRequired(this._endInput))??!1}set required(e){this._required=e}_required;get dateFilter(){return this._dateFilter}set dateFilter(e){let t=this._startInput,a=this._endInput,n=t&&t._matchesFilter(t.value),r=a&&a._matchesFilter(t.value);this._dateFilter=e,t&&t._matchesFilter(t.value)!==n&&t._validatorOnChange(),a&&a._matchesFilter(a.value)!==r&&a._validatorOnChange()}_dateFilter;get min(){return this._min}set min(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._min)||(this._min=t,this._revalidate())}_min=null;get max(){return this._max}set max(e){let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e));this._dateAdapter.sameDate(t,this._max)||(this._max=t,this._revalidate())}_max=null;get disabled(){return this._startInput&&this._endInput?this._startInput.disabled&&this._endInput.disabled:this._groupDisabled}set disabled(e){e!==this._groupDisabled&&(this._groupDisabled=e,this.stateChanges.next(void 0))}_groupDisabled=!1;get errorState(){return this._startInput&&this._endInput?this._startInput.errorState||this._endInput.errorState:!1}get empty(){let e=this._startInput?this._startInput.isEmpty():!1,t=this._endInput?this._endInput.isEmpty():!1;return e&&t}_ariaDescribedBy=null;_model;separator="\u2013";comparisonStart=null;comparisonEnd=null;ngControl;stateChanges=new k;disableAutomaticLabeling=!0;constructor(){this._dateAdapter,this._formField?._elementRef.nativeElement.classList.contains("mat-mdc-form-field")&&this._elementRef.nativeElement.classList.add("mat-mdc-input-element","mat-mdc-form-field-input-control","mdc-text-field__input"),this.ngControl=o(Pt,{optional:!0,self:!0})}get describedByIds(){return this._elementRef.nativeElement.getAttribute("aria-describedby")?.split(" ")||[]}setDescribedByIds(e){this._ariaDescribedBy=e.length?e.join(" "):null}onContainerClick(){!this.focused&&!this.disabled&&(!this._model||!this._model.selection.start?this._startInput.focus():this._endInput.focus())}ngAfterContentInit(){this._model&&this._registerModel(this._model),re(this._startInput.stateChanges,this._endInput.stateChanges).subscribe(()=>{this.stateChanges.next(void 0)})}ngOnChanges(e){ba(e,this._dateAdapter)&&this.stateChanges.next(void 0)}ngOnDestroy(){this._closedSubscription.unsubscribe(),this._openedSubscription.unsubscribe(),this.stateChanges.complete()}getStartValue(){return this.value?this.value.start:null}getThemePalette(){return this._formField?this._formField.color:void 0}getConnectedOverlayOrigin(){return this._formField?this._formField.getConnectedOverlayOrigin():this._elementRef}getOverlayLabelId(){return this._formField?this._formField.getLabelId():null}_getInputMirrorValue(e){let t=e==="start"?this._startInput:this._endInput;return t?t.getMirrorValue():""}_shouldHidePlaceholders(){return this._startInput?!this._startInput.isEmpty():!1}_handleChildValueChange(){this.stateChanges.next(void 0),this._changeDetectorRef.markForCheck()}_openDatepicker(){this._rangePicker&&this._rangePicker.open()}_shouldHideSeparator(){return(!this._formField||this._formField.getLabelId()&&!this._formField._shouldLabelFloat())&&this.empty}_getAriaLabelledby(){let e=this._formField;return e&&e._hasFloatingLabel()?e._labelId:null}_getStartDateAccessibleName(){return this._startInput._getAccessibleName()}_getEndDateAccessibleName(){return this._endInput._getAccessibleName()}_updateFocus(e){this.focused=e!==null,this.stateChanges.next()}_revalidate(){this._startInput&&this._startInput._validatorOnChange(),this._endInput&&this._endInput._validatorOnChange()}_registerModel(e){this._startInput&&this._startInput._registerModel(e),this._endInput&&this._endInput._registerModel(e)}_isTargetRequired(e){return e?.ngControl?.control?.hasValidator(ge.required)}static \u0275fac=function(t){return new(t||i)};static \u0275cmp=M({type:i,selectors:[["mat-date-range-input"]],hostAttrs:["role","group",1,"mat-date-range-input"],hostVars:8,hostBindings:function(t,a){t&2&&(D("id",a.id)("aria-labelledby",a._getAriaLabelledby())("aria-describedby",a._ariaDescribedBy)("data-mat-calendar",a.rangePicker?a.rangePicker.id:null),x("mat-date-range-input-hide-placeholders",a._shouldHidePlaceholders())("mat-date-range-input-required",a.required))},inputs:{rangePicker:"rangePicker",required:[2,"required","required",N],dateFilter:"dateFilter",min:"min",max:"max",disabled:[2,"disabled","disabled",N],separator:"separator",comparisonStart:"comparisonStart",comparisonEnd:"comparisonEnd"},exportAs:["matDateRangeInput"],features:[L([{provide:Yt,useExisting:i}]),Y],ngContentSelectors:Wa,decls:11,vars:5,consts:[["cdkMonitorSubtreeFocus","",1,"mat-date-range-input-container",3,"cdkFocusChange"],[1,"mat-date-range-input-wrapper"],["aria-hidden","true",1,"mat-date-range-input-mirror"],[1,"mat-date-range-input-separator"],[1,"mat-date-range-input-wrapper","mat-date-range-input-end-wrapper"]],template:function(t,a){t&1&&(xe(ja),c(0,"div",0),f("cdkFocusChange",function(r){return a._updateFocus(r)}),c(1,"div",1),pe(2),c(3,"span",2),b(4),u()(),c(5,"span",3),b(6),u(),c(7,"div",4),pe(8,1),c(9,"span",2),b(10),u()()()),t&2&&(l(4),O(a._getInputMirrorValue("start")),l(),x("mat-date-range-input-separator-hidden",a._shouldHideSeparator()),l(),O(a.separator),l(4),O(a._getInputMirrorValue("end")))},dependencies:[Je],styles:[`.mat-date-range-input {
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
`],encapsulation:2})}return i})();function on(i){return ft(i,!0)}function la(i){return i.nodeType===Node.ELEMENT_NODE}function dn(i){return i.nodeName==="INPUT"}function ln(i){return i.nodeName==="TEXTAREA"}function ft(i,s){if(la(i)&&s){let t=(i.getAttribute?.("aria-labelledby")?.split(/\s+/g)||[]).reduce((a,n)=>{let r=document.getElementById(n);return r&&a.push(r),a},[]);if(t.length)return t.map(a=>ft(a,!1)).join(" ")}if(la(i)){let e=i.getAttribute("aria-label")?.trim();if(e)return e}if(dn(i)||ln(i)){if(i.labels?.length)return Array.from(i.labels).map(a=>ft(a,!1)).join(" ");let e=i.getAttribute("placeholder")?.trim();if(e)return e;let t=i.getAttribute("title")?.trim();if(t)return t}return(i.textContent||"").replace(/\s+/g," ").trim()}var va=(()=>{class i extends fa{_rangeInput=o(sn);_elementRef=o(z);_defaultErrorStateMatcher=o(Kt);_injector=o(de);_rawValue=p("");_parentForm=o(Bt,{optional:!0});_parentFormGroup=o(Ht,{optional:!0});ngControl;_dir=o(G,{optional:!0});_errorStateTracker;get errorStateMatcher(){return this._errorStateTracker.matcher}set errorStateMatcher(e){this._errorStateTracker.matcher=e}get errorState(){return this._errorStateTracker.errorState}set errorState(e){this._errorStateTracker.errorState=e}constructor(){super(),this._errorStateTracker=new jt(this._defaultErrorStateMatcher,null,this._parentFormGroup,this._parentForm,this.stateChanges)}ngOnInit(){let e=this._injector.get(Lt,null,{optional:!0,self:!0});e&&(this.ngControl=e,this._errorStateTracker.ngControl=e)}ngAfterContentInit(){this._register()}ngDoCheck(){this.ngControl&&this.updateErrorState(),this._rawValue.set(this._elementRef.nativeElement.value)}isEmpty(){return this._rawValue().length===0}_getPlaceholder(){return this._elementRef.nativeElement.placeholder}focus(){this._elementRef.nativeElement.focus()}getMirrorValue(){let e=this._rawValue();return e.length>0?e:this._getPlaceholder()}updateErrorState(){this._errorStateTracker.updateErrorState()}_onInput(e){super._onInput(e),this._rangeInput._handleChildValueChange()}_openPopup(){this._rangeInput._openDatepicker()}_getMinDate(){return this._rangeInput.min}_getMaxDate(){return this._rangeInput.max}_getDateFilter(){return this._rangeInput.dateFilter}_parentDisabled(){return this._rangeInput._groupDisabled}_shouldHandleChangeEvent({source:e}){return e!==this._rangeInput._startInput&&e!==this._rangeInput._endInput}_assignValueProgrammatically(e,t){super._assignValueProgrammatically(e,t),(this===this._rangeInput._startInput?this._rangeInput._endInput:this._rangeInput._startInput)?._validatorOnChange(),this._rawValue.set(this._elementRef.nativeElement.value)}_formatValue(e){super._formatValue(e),this._rangeInput._handleChildValueChange()}_getAccessibleName(){return on(this._elementRef.nativeElement)}static \u0275fac=function(t){return new(t||i)};static \u0275dir=P({type:i,inputs:{errorStateMatcher:"errorStateMatcher"},features:[K]})}return i})(),ii=(()=>{class i extends va{_startValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._model?this._model.selection.end:null;return!t||!a||this._dateAdapter.compareDate(t,a)<=0?null:{matStartDateInvalid:{end:a,actual:t}}};_validator=ge.compose([...super._getValidators(),this._startValidator]);_register(){this._rangeInput._startInput=this}_getValueFromModel(e){return e.start}_shouldHandleChangeEvent(e){return super._shouldHandleChangeEvent(e)?e.oldValue?.start?!e.selection.start||!!this._dateAdapter.compareDate(e.oldValue.start,e.selection.start):!!e.selection.start:!1}_assignValueToModel(e){if(this._model){let t=new g(e,this._model.selection.end);this._model.updateSelection(t,this),this._rangeInput._handleChildValueChange()}}_onKeydown(e){let t=this._rangeInput._endInput,a=this._elementRef.nativeElement,n=this._dir?.value!=="rtl";(e.keyCode===39&&n||e.keyCode===37&&!n)&&a.selectionStart===a.value.length&&a.selectionEnd===a.value.length?(e.preventDefault(),t._elementRef.nativeElement.setSelectionRange(0,0),t.focus()):super._onKeydown(e)}static \u0275fac=(()=>{let e;return function(a){return(e||(e=le(i)))(a||i)}})();static \u0275dir=P({type:i,selectors:[["input","matStartDate",""]],hostAttrs:["type","text",1,"mat-start-date","mat-date-range-input-inner"],hostVars:5,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("keydown",function(r){return a._onKeydown(r)})("blur",function(){return a._onBlur()}),t&2&&(R("disabled",a.disabled),D("aria-haspopup",a._rangeInput.rangePicker?"dialog":null)("aria-owns",a._rangeInput._ariaOwns()||null)("min",a._getMinDate()?a._dateAdapter.toIso8601(a._getMinDate()):null)("max",a._getMaxDate()?a._dateAdapter.toIso8601(a._getMaxDate()):null))},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[L([{provide:Pe,useExisting:i,multi:!0},{provide:Le,useExisting:i,multi:!0}]),K]})}return i})(),ri=(()=>{class i extends va{_endValidator=e=>{let t=this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(e.value)),a=this._model?this._model.selection.start:null;return!t||!a||this._dateAdapter.compareDate(t,a)>=0?null:{matEndDateInvalid:{start:a,actual:t}}};_register(){this._rangeInput._endInput=this}_validator=ge.compose([...super._getValidators(),this._endValidator]);_getValueFromModel(e){return e.end}_shouldHandleChangeEvent(e){return super._shouldHandleChangeEvent(e)?e.oldValue?.end?!e.selection.end||!!this._dateAdapter.compareDate(e.oldValue.end,e.selection.end):!!e.selection.end:!1}_assignValueToModel(e){if(this._model){let t=new g(this._model.selection.start,e);this._model.updateSelection(t,this)}}_moveCaretToEndOfStartInput(){let e=this._rangeInput._startInput._elementRef.nativeElement,t=e.value;t.length>0&&e.setSelectionRange(t.length,t.length),e.focus()}_onKeydown(e){let t=this._elementRef.nativeElement,a=this._dir?.value!=="rtl";e.keyCode===8&&!t.value?this._moveCaretToEndOfStartInput():(e.keyCode===37&&a||e.keyCode===39&&!a)&&t.selectionStart===0&&t.selectionEnd===0?(e.preventDefault(),this._moveCaretToEndOfStartInput()):super._onKeydown(e)}static \u0275fac=(()=>{let e;return function(a){return(e||(e=le(i)))(a||i)}})();static \u0275dir=P({type:i,selectors:[["input","matEndDate",""]],hostAttrs:["type","text",1,"mat-end-date","mat-date-range-input-inner"],hostVars:5,hostBindings:function(t,a){t&1&&f("input",function(r){return a._onInput(r)})("change",function(){return a._onChange()})("keydown",function(r){return a._onKeydown(r)})("blur",function(){return a._onBlur()}),t&2&&(R("disabled",a.disabled),D("aria-haspopup",a._rangeInput.rangePicker?"dialog":null)("aria-owns",a._rangeInput._ariaOwns()||null)("min",a._getMinDate()?a._dateAdapter.toIso8601(a._getMinDate()):null)("max",a._getMaxDate()?a._dateAdapter.toIso8601(a._getMaxDate()):null))},outputs:{dateChange:"dateChange",dateInput:"dateInput"},features:[L([{provide:Pe,useExisting:i,multi:!0},{provide:Le,useExisting:i,multi:!0}]),K]})}return i})(),si=(()=>{class i extends ze{_forwardContentValues(e){super._forwardContentValues(e);let t=this.datepickerInput;t&&(e.comparisonStart=t.comparisonStart,e.comparisonEnd=t.comparisonEnd,e.startDateAccessibleName=t._getStartDateAccessibleName(),e.endDateAccessibleName=t._getEndDateAccessibleName())}static \u0275fac=(()=>{let e;return function(a){return(e||(e=le(i)))(a||i)}})();static \u0275cmp=M({type:i,selectors:[["mat-date-range-picker"]],exportAs:["matDateRangePicker"],features:[L([Ga,{provide:He,useFactory:()=>o(He,{optional:!0,skipSelf:!0})||new Za(o(_))},{provide:ze,useExisting:i}]),K],decls:0,vars:0,template:function(t,a){},encapsulation:2})}return i})();var oi=(()=>{class i{static \u0275fac=function(t){return new(t||i)};static \u0275mod=Ve({type:i});static \u0275inj=Me({providers:[ie],imports:[qt,aa,Rt,$t,ga,rn,_a,Ot,Qt]})}return i})();export{_ as a,B as b,bn as c,ka as d,ni as e,Da as f,rn as g,sn as h,ii as i,ri as j,si as k,oi as l};
