(window.webpackJsonp=window.webpackJsonp||[]).push([[97],{ucDl:function(e,a,t){"use strict";t.r(a);var n=t("8Y7J");class l{}var b=t("pMnS"),u=t("iInd"),c=(t("g6cB"),t("iJLM"));class s{constructor(e,a){this.configSvc=e,this.route=a,this.pageNavbar=this.configSvc.pageNavBar,this.feedbacktypeName="Feedback",this.pageNavbar=this.configSvc.pageNavBar,this.feedbackTypes=c.d,this.queryParamSub=this.route.queryParamMap.subscribe(e=>{const a=e.get("feedbackType");a?(this.feedbackType=a,this.feedbackType&&(this.feedbacktypeName=this.feedbackType===c.d.Content?"Content Feedback":this.feedbackType===c.d.ContentRequest?"Content Request":this.feedbackType===c.d.Platform?"Platform Feedback":this.feedbackType===c.d.ServiceRequest?"Service Request":"Feedback")):this.feedbackType=void 0})}ngOnDestroy(){this.queryParamSub&&!this.queryParamSub.closed&&this.queryParamSub.unsubscribe()}}var r=t("88ff"),i=n.sb({encapsulation:0,styles:[[""]],data:{}});function o(e){return n.Qb(0,[(e()(),n.ub(0,16777216,null,null,1,"router-outlet",[],null,null,null,null,null)),n.tb(1,212992,null,0,u.t,[u.b,n.P,n.j,[8,null],n.h],null,null)],(function(e,a){e(a,1,0)}),null)}function d(e){return n.Qb(0,[(e()(),n.ub(0,0,null,null,1,"ws-app-home",[],null,null,null,o,i)),n.tb(1,180224,null,0,s,[r.a,u.a],null,null)],null,null)}var h=n.qb("ws-app-home",s,d,{},{},[]),p=t("ggGX"),f=t("SVse");const y=()=>Promise.all([t.e(0),t.e(62)]).then(t.bind(null,"oRW2")).then(e=>e.MyFeedbackModuleNgFactory),k=()=>Promise.all([t.e(0),t.e(63)]).then(t.bind(null,"6W5m")).then(e=>e.ProvideFeedbackModuleNgFactory);class E{}var m=t("IP0z"),v=t("Xd0L"),g=t("cUpR"),w=t("/HVE"),P=t("Fwaw"),q=t("Gi4r"),F=t("CQWV"),S=t("BzsH"),N=t("dMfK");t.d(a,"RouteFeedbackV2ModuleNgFactory",(function(){return T}));var T=n.rb(l,[],(function(e){return n.Db([n.Eb(512,n.j,n.bb,[[8,[b.a,h,p.a]],[3,n.j],n.w]),n.Eb(4608,f.r,f.q,[n.t,[2,f.N]]),n.Eb(1073742336,f.c,f.c,[]),n.Eb(1073742336,u.s,u.s,[[2,u.x],[2,u.o]]),n.Eb(1073742336,E,E,[]),n.Eb(1073742336,m.a,m.a,[]),n.Eb(1073742336,v.l,v.l,[[2,v.d],[2,g.f]]),n.Eb(1073742336,w.b,w.b,[]),n.Eb(1073742336,v.w,v.w,[]),n.Eb(1073742336,P.c,P.c,[]),n.Eb(1073742336,q.c,q.c,[]),n.Eb(1073742336,F.a,F.a,[]),n.Eb(1073742336,S.b,S.b,[]),n.Eb(1073742336,N.a,N.a,[]),n.Eb(1073742336,l,l,[]),n.Eb(256,n.t,"hi",[]),n.Eb(1024,u.m,(function(){return[[{path:"",component:s,children:[{path:"my-feedback",loadChildren:y},{path:"",loadChildren:k}]}]]}),[])])}))}}]);