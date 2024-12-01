import{c as _e,d as k}from"./chunk-GJNUIEC7.js";import{a as le,b as pe,c as ce,d as de,e as se,f as fe,g as ue,h as xe,i as he,j as Ee,k as Ce}from"./chunk-LJQQ2IIS.js";import{a as ne,b as re,c as oe,h as me}from"./chunk-6J2GGSYL.js";import{b as ie,c as ae}from"./chunk-AB6KJ2AV.js";import{a as j,e as A}from"./chunk-ZKGHVHFE.js";import"./chunk-AGZIT5PV.js";import{A as te,a as Y,b as $,d as J,g as L,h as z,j as q,o as K,p as Q,q as U,s as w,u as W,v as X,w as Z,z as ee}from"./chunk-E3VFD42H.js";import{U as O}from"./chunk-JA3OW74J.js";import{$c as G,Bb as p,Gb as h,Lb as a,Mb as t,Nb as f,Ob as u,Pb as x,Rb as N,Ub as M,Wb as V,a as b,ab as r,b as I,bd as P,ec as v,fc as o,ha as R,hc as E,ib as D,jc as y,nb as B,nc as H,pa as C,qa as _,qc as S,sc as F,ub as l}from"./chunk-P2PCPSCD.js";function Se(e,m){e&1&&(a(0,"mat-error"),o(1,"Invalid start date"),t())}function Fe(e,m){e&1&&(a(0,"mat-error"),o(1,"Invalid end date"),t())}function we(e,m){e&1&&(a(0,"th",22),o(1," No. "),t())}function ke(e,m){if(e&1&&(a(0,"td",23),o(1),t()),e&2){let i=m.index;r(),E(" ",i+1," ")}}function Te(e,m){e&1&&(a(0,"th",22),o(1," Start Date "),t())}function ge(e,m){if(e&1&&(a(0,"td",23),o(1),S(2,"date"),t()),e&2){let i=m.$implicit;r(),E(" ",F(2,1,i.start,"MM/dd/yyyy")," ")}}function be(e,m){e&1&&(a(0,"th",22),o(1," End Date "),t())}function Ie(e,m){if(e&1&&(a(0,"td",23),o(1),S(2,"date"),t()),e&2){let i=m.$implicit;r(),E(" ",F(2,1,i.end,"MM/dd/yyyy")," ")}}function Re(e,m){e&1&&(a(0,"th",22),o(1," Experience "),t())}function Be(e,m){if(e&1&&(a(0,"td",23),o(1),t()),e&2){let i=m.$implicit;r(),y(" ",i.years," Years ",i.months," Months ",i.days," days")}}function Ne(e,m){e&1&&f(0,"tr",24)}function Ve(e,m){e&1&&f(0,"tr",25)}function He(e,m){if(e&1&&(a(0,"div"),o(1),t()),e&2){let i=V();r(),y("",i.totalExperience().years," Years ",i.totalExperience().months," Months ",i.totalExperience().days," days")}}var nt=(()=>{class e{constructor(){this._snackBar=R(_e),this.experiences=D([]),this.totalExperience=D({days:0,months:0,years:0}),this.displayedColumns=["index","start","end","experience"],this.maxDate=new Date,this.experienceForm=new U({start:new w(null),end:new w(null)}),this.calculateExperience=()=>{if(this.experienceForm.value.start&&this.experienceForm.value.end)if(this.experienceForm.value.start<this.experienceForm.value.end){let i=k.fromJSDate(this.experienceForm.value.end).diff(k.fromJSDate(this.experienceForm.value.start),["years","months","days"]),c=[...this.experiences(),I(b({},i.toObject()),{start:this.experienceForm.value.start,end:this.experienceForm.value.end})];c=c.sort((ve,ye)=>ve.start.valueOf()-ye.start.valueOf()),this.experiences.update(()=>[...c]);let n=Math.abs(this.experienceForm.value.end.getTime()-this.experienceForm.value.start.getTime()),d=Math.floor(n/(1e3*3600*24*365.25));n-=d*(1e3*3600*24*365.25);let s=Math.floor(n/(1e3*3600*24*30.44));n-=s*(1e3*3600*24*30.44);let T=Math.floor(n/(1e3*3600*24)),De=this.totalExperience().years+d+Math.floor((this.totalExperience().months+s)/12),g=(this.totalExperience().months+s)%12;g+=Math.floor((this.totalExperience().days+T)/30);let Me=(this.totalExperience().days+T)%30;this.totalExperience.update(()=>({days:Me,months:g,years:De})),this.experienceForm.reset()}else this.openSnackBar("Last working date cannot be before the date of joining.")},this.reset=()=>{this.experiences.update(()=>[]),this.totalExperience.update(()=>({days:0,months:0,years:0}))}}openSnackBar(i){this._snackBar.open(i,"",{horizontalPosition:"end",verticalPosition:"top",duration:3e3,panelClass:["error-snackbar"]})}static{this.\u0275fac=function(c){return new(c||e)}}static{this.\u0275cmp=B({type:e,selectors:[["app-experience"]],features:[H([O()])],decls:42,vars:13,consts:[["matStartDate",""],["matEndDate",""],[1,"p-5"],[3,"formGroup"],[1,"mat-body","my-3"],[1,"mr-4"],["matInput","","placeholder","Start date","formControlName","start",3,"matDatepicker","max"],["matSuffix","",3,"for"],["startView","multi-year"],["matInput","","placeholder","End date","formControlName","end",3,"matDatepicker","max"],["mat-flat-button","",1,"mr-3",3,"click"],["mat-flat-button","",3,"click"],[1,"experienceTable"],["mat-table","",1,"",3,"dataSource"],["matColumnDef","index"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","start"],["matColumnDef","end"],["matColumnDef","experience"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-header-row",""],["mat-row",""]],template:function(c,n){if(c&1){let d=N();a(0,"div",2)(1,"form",3)(2,"div",4),o(3,"Experience Calculator"),t(),a(4,"mat-form-field",5)(5,"mat-label"),o(6,"Select Start Date"),t(),f(7,"input",6)(8,"mat-datepicker-toggle",7)(9,"mat-datepicker",8,0),l(11,Se,2,0,"mat-error"),t(),a(12,"mat-form-field")(13,"mat-label"),o(14,"Select End Date"),t(),f(15,"input",9)(16,"mat-datepicker-toggle",7)(17,"mat-datepicker",8,1),l(19,Fe,2,0,"mat-error"),t()(),a(20,"button",10),M("click",function(){return C(d),_(n.calculateExperience())}),o(21,"Calculate"),t(),a(22,"button",11),M("click",function(){return C(d),_(n.reset())}),o(23,"Reset"),t(),a(24,"div",12)(25,"table",13),u(26,14),l(27,we,2,0,"th",15)(28,ke,2,1,"td",16),x(),u(29,17),l(30,Te,2,0,"th",15)(31,ge,3,4,"td",16),x(),u(32,18),l(33,be,2,0,"th",15)(34,Ie,3,4,"td",16),x(),u(35,19),l(36,Re,2,0,"th",15)(37,Be,2,3,"td",16),x(),l(38,Ne,1,0,"tr",20)(39,Ve,1,0,"tr",21),t()(),a(40,"div",2),l(41,He,2,3,"div"),t()()}if(c&2){let d=v(10),s=v(18);r(),p("formGroup",n.experienceForm),r(6),p("matDatepicker",d)("max",n.maxDate),r(),p("for",d),r(3),h(n.experienceForm.controls.start.hasError("matStartDateInvalid")?11:-1),r(4),p("matDatepicker",s)("max",n.maxDate),r(),p("for",s),r(3),h(n.experienceForm.controls.end.hasError("matEndDateInvalid")?19:-1),r(6),p("dataSource",n.experiences()),r(13),p("matHeaderRowDef",n.displayedColumns),r(),p("matRowDefColumns",n.displayedColumns),r(2),h(n.experiences().length?41:-1)}},dependencies:[P,G,A,j,z,L,Y,$,J,ae,ie,Ce,le,ce,ue,de,pe,xe,se,fe,he,Ee,me,ne,re,oe,ee,W,q,K,Q,te,X,Z],styles:[".experienceTable[_ngcontent-%COMP%]{width:600px;margin:30px 0}"],changeDetection:0})}}return e})();export{nt as ExperienceComponent};