(window.webpackJsonp=window.webpackJsonp||[]).push([[86],{"2Xq3":function(e,n,l){"use strict";l.r(n);var t=l("8Y7J");class i{}var a=l("xYTU"),u=l("pMnS"),o=l("goGN"),s=l("NJKi"),r=l("Q3Rl"),c=l("cUpR"),d=l("TPUF"),b=l("4fW1"),m=l("jMFU"),h=l("88ff"),g=l("iInd"),p=l("SVse"),f=l("lzlj"),w=l("igqZ"),v=l("omvX"),E=l("CF3Z"),y=l("c3Nb"),P=l("/HVE"),M=l("tHRR"),D=l("ltln"),C=l("ihed"),x=l("s6ns"),O=l("bujt"),_=l("Fwaw"),S=l("5GAg"),I=l("U5F2"),k=l("g6cB"),T=l("GYRC");class F{constructor(e,n,l,t){this.activatedRoute=e,this.configSvc=n,this.viewerDataSvc=l,this.valueSvc=t,this.isFetchingDataComplete=!1,this.isErrorOccured=!1,this.forPreview=!1,this.webmoduleData=null,this.discussionForumWidget=null,this.isPreviewMode=!1,this.isTypeOfCollection=!1,this.collectionId=null,this.isRestricted=!1,this.prevResourceUrl=null,this.nextResourceUrl=null,this.isSmall=!1,this.valueSvc.isXSmall$.subscribe(e=>{this.isSmall=e})}ngOnInit(){this.configSvc.restrictedFeatures&&(this.isRestricted=!this.configSvc.restrictedFeatures.has("disscussionForum")),this.isTypeOfCollection=!!this.activatedRoute.snapshot.queryParams.collectionType,this.isTypeOfCollection&&(this.collectionId=this.activatedRoute.snapshot.queryParams.collectionId),this.viewerDataServiceSubscription=this.viewerDataSvc.tocChangeSubject.subscribe(e=>{this.prevTitle=e.previousTitle,this.nextTitle=e.nextResTitle,this.prevResourceUrl=e.prevResource,this.nextResourceUrl=e.nextResource}),this.collectionIdentifier=this.activatedRoute.snapshot.queryParams.collectionId}}var G=t.sb({encapsulation:0,styles:[[".video-player-summary-container[_ngcontent-%COMP%]{height:auto;display:flex;justify-content:center;width:100%;flex-wrap:wrap}.padding-dynamic[_ngcontent-%COMP%]{padding:16px 8px 8px}.video-player-container[_ngcontent-%COMP%]{height:auto;width:100%;max-width:640px}.video-player-title[_ngcontent-%COMP%]{width:65%}@media only screen and (min-width:960px){.video-player-title[_ngcontent-%COMP%]{width:70%}}@media only screen and (max-width:599px){.padding-dynamic[_ngcontent-%COMP%]{padding:8px}.video-player-title[_ngcontent-%COMP%]{width:100%}}.video-summary[_ngcontent-%COMP%]{width:30%}@media only screen and (min-width:960px){.video-summary[_ngcontent-%COMP%]{width:25%}}@media only screen and (max-width:599px){.video-summary[_ngcontent-%COMP%]{width:100%}}.video-player[_ngcontent-%COMP%]{width:100%;height:75vh;position:relative}.video-player-m[_ngcontent-%COMP%]{position:fixed;top:55px;left:0;height:40vh;width:100vw;z-index:1000;background:#000}@media only screen and (min-width:600px){.video-player-m[_ngcontent-%COMP%]{display:none}}.video-discussion-forum-in[_ngcontent-%COMP%], .vidoe-title[_ngcontent-%COMP%]{width:100%}.info-section[_ngcontent-%COMP%]   .info-container[_ngcontent-%COMP%]{padding:12px 16px;margin-bottom:16px}.info-section[_ngcontent-%COMP%]   .info-container[_ngcontent-%COMP%]   .info-item[_ngcontent-%COMP%]{display:flex;align-items:center;padding:8px 0;box-sizing:border-box}.info-section[_ngcontent-%COMP%]   .info-container[_ngcontent-%COMP%]   .info-item[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0}.info-section[_ngcontent-%COMP%]   .info-container[_ngcontent-%COMP%]   .info-item[_ngcontent-%COMP%]   .item-heading[_ngcontent-%COMP%]{width:40%;min-width:80px;max-width:140px}.info-section[_ngcontent-%COMP%]   .info-container[_ngcontent-%COMP%]   .info-item[_ngcontent-%COMP%]   .item-icon[_ngcontent-%COMP%]{width:20px;height:20px;font-size:20px;margin-left:8px}@media only screen and (max-width:599px){.info-section[_ngcontent-%COMP%]{width:100%}}.author[_ngcontent-%COMP%]{padding:12px 0;display:flex}.author[_ngcontent-%COMP%]   .author-image[_ngcontent-%COMP%]{margin-right:12px;font-size:48px;height:48px;width:48px}.unit-meta-item[_ngcontent-%COMP%]{border-radius:2px;box-sizing:border-box;margin-bottom:16px}"]],data:{}});function R(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,4,"viewer-plugin-web-module",[],null,null,null,o.b,o.a)),t.tb(1,770048,null,0,s.a,[r.a,c.b,d.a,b.a,m.a,h.a,g.a],{collectionId:[0,"collectionId"],widgetData:[1,"widgetData"],webModuleManifest:[2,"webModuleManifest"],theme:[3,"theme"]},null),t.Hb(2,4),t.Kb(3,2),t.Jb(4,{className:0})],(function(e,n){var l=n.component,i=l.collectionId,a=t.Pb(n,1,1,e(n,3,0,t.Gb(n.parent.parent,0),l.webmoduleData,e(n,2,0,"identifier","artifactUrl","mimeType","resumePage"))),u=l.webmoduleManifest,o=e(n,4,0,"indigo");e(n,1,0,i,a,u,o)}),null)}function U(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,4,"span",[["class","title"]],null,null,null,null,null)),(e()(),t.ub(1,0,null,null,1,"span",[["class","fs-small"]],null,null,null,null,null)),(e()(),t.Ob(-1,null,["Previous Chapter"])),(e()(),t.Ob(3,null,[""," "])),t.Ib(0,p.B,[])],null,(function(e,n){var l=n.component;e(n,3,0,l.prevTitle.length>22?t.Pb(n,3,0,t.Gb(n,4).transform(l.prevTitle,0,22))+"..":l.prevTitle)}))}function W(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,4,"span",[["class","title"]],null,null,null,null,null)),(e()(),t.ub(1,0,null,null,1,"span",[["class","fs-small"]],null,null,null,null,null)),(e()(),t.Ob(-1,null,["Next Chapter"])),(e()(),t.Ob(3,null,["",""])),t.Ib(0,p.B,[])],null,(function(e,n){var l=n.component;e(n,3,0,l.nextTitle.length>22?t.Pb(n,3,0,t.Gb(n,4).transform(l.nextTitle,0,22))+"..":l.nextTitle)}))}function N(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,8,"mat-card",[["class","unit-meta-item mat-card"]],[[2,"_mat-animation-noopable",null]],null,null,f.d,f.a)),t.tb(1,49152,null,0,w.a,[[2,v.a]],null,null),(e()(),t.ub(2,0,null,0,6,"div",[["class","flex"]],null,null,null,null,null)),(e()(),t.ub(3,0,null,null,3,"ws-widget-btn-content-download",[],[[8,"id",0],[8,"style",2],[8,"className",0]],null,null,E.c,E.b)),t.tb(4,4308992,null,0,y.a,[P.a,r.a,M.a,h.a],{widgetData:[0,"widgetData"],forPreview:[1,"forPreview"]},null),t.Hb(5,7),t.Kb(6,2),(e()(),t.ub(7,0,null,null,1,"ws-widget-btn-content-share",[],[[8,"id",0],[8,"style",2],[8,"className",0]],null,null,D.c,D.b)),t.tb(8,4308992,null,0,C.a,[x.e,h.a],{widgetData:[0,"widgetData"],forPreview:[1,"forPreview"]},null)],(function(e,n){var l=n.component,i=t.Pb(n,4,0,e(n,6,0,t.Gb(n.parent.parent.parent,0),l.webmoduleData,e(n,5,0,"identifier","contentType","resourceType","mimeType","downloadUrl","isExternal","artifactUrl")));e(n,4,0,i,l.forPreview),e(n,8,0,l.webmoduleData,l.forPreview)}),(function(e,n){e(n,0,0,"NoopAnimations"===t.Gb(n,1)._animationMode),e(n,3,0,t.Gb(n,4).widgetInstanceId,t.Gb(n,4).widgetSafeStyle,t.Gb(n,4).className),e(n,7,0,t.Gb(n,8).widgetInstanceId,t.Gb(n,8).widgetSafeStyle,t.Gb(n,8).className)}))}function q(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,2,"div",[["class","vidoe-title margin-top-m"]],null,null,null,null,null)),(e()(),t.kb(16777216,null,null,1,null,N)),t.tb(2,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null)],(function(e,n){e(n,2,0,n.component.isSmall)}),null)}function L(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,30,"div",[["class","padding-dynamic"]],null,null,null,null,null)),(e()(),t.ub(1,0,null,null,29,"div",[["class","flex flex-around flex-wrapped"]],null,null,null,null,null)),(e()(),t.ub(2,0,null,null,28,"div",[["class","w-full"]],null,null,null,null,null)),(e()(),t.ub(3,0,null,null,25,"div",[],null,null,null,null,null)),(e()(),t.ub(4,0,null,null,24,"mat-card",[["class","mat-card"]],[[2,"_mat-animation-noopable",null]],null,null,f.d,f.a)),t.tb(5,49152,null,0,w.a,[[2,v.a]],null,null),(e()(),t.ub(6,0,null,0,22,"mat-card-content",[["class","mat-card-content"]],null,null,null,null,null)),t.tb(7,16384,null,0,w.d,[],null,null),(e()(),t.ub(8,0,null,null,20,"div",[["class","video-player"],["id","fullScreenContainer"]],null,null,null,null,null)),(e()(),t.kb(16777216,null,null,1,null,R)),t.tb(10,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(11,0,null,null,17,"div",[["class","player-nav-links"]],null,null,null,null,null)),(e()(),t.ub(12,0,null,null,16,"div",[["class","flex justify-between html"]],null,null,null,null,null)),(e()(),t.ub(13,0,null,null,7,"div",[["class","prev-button"]],null,null,null,null,null)),(e()(),t.ub(14,0,null,null,4,"a",[["accesskey","<"],["class","width-auto"],["mat-button",""],["queryParamsHandling","preserve"]],[[1,"tabindex",0],[1,"disabled",0],[1,"aria-disabled",0],[2,"_mat-animation-noopable",null],[1,"target",0],[8,"href",4]],[[null,"click"]],(function(e,n,l){var i=!0;return"click"===n&&(i=!1!==t.Gb(e,15)._haltDisabledEvents(l)&&i),"click"===n&&(i=!1!==t.Gb(e,16).onClick(l.button,l.ctrlKey,l.metaKey,l.shiftKey)&&i),i}),O.c,O.a)),t.tb(15,180224,null,0,_.a,[S.h,t.k,[2,v.a]],{disabled:[0,"disabled"]},null),t.tb(16,671744,null,0,g.r,[g.o,g.a,p.l],{queryParamsHandling:[0,"queryParamsHandling"],routerLink:[1,"routerLink"]},null),(e()(),t.ub(17,0,null,0,1,"span",[["class","material-icons align-left-arrow"]],null,null,null,null,null)),(e()(),t.Ob(-1,null,[" chevron_left "])),(e()(),t.kb(16777216,null,null,1,null,U)),t.tb(20,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(21,0,null,null,7,"div",[["class","next-button"]],null,null,null,null,null)),(e()(),t.kb(16777216,null,null,1,null,W)),t.tb(23,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(24,0,null,null,4,"a",[["accesskey",">"],["class","width-auto mr-10"],["mat-button",""],["queryParamsHandling","preserve"]],[[1,"tabindex",0],[1,"disabled",0],[1,"aria-disabled",0],[2,"_mat-animation-noopable",null],[1,"target",0],[8,"href",4]],[[null,"click"]],(function(e,n,l){var i=!0;return"click"===n&&(i=!1!==t.Gb(e,25)._haltDisabledEvents(l)&&i),"click"===n&&(i=!1!==t.Gb(e,26).onClick(l.button,l.ctrlKey,l.metaKey,l.shiftKey)&&i),i}),O.c,O.a)),t.tb(25,180224,null,0,_.a,[S.h,t.k,[2,v.a]],{disabled:[0,"disabled"]},null),t.tb(26,671744,null,0,g.r,[g.o,g.a,p.l],{queryParamsHandling:[0,"queryParamsHandling"],routerLink:[1,"routerLink"]},null),(e()(),t.ub(27,0,null,0,1,"span",[["class","material-icons align-right-arrow"]],null,null,null,null,null)),(e()(),t.Ob(-1,null,[" chevron_right "])),(e()(),t.kb(16777216,null,null,1,null,q)),t.tb(30,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null)],(function(e,n){var l=n.component;e(n,10,0,l.isFetchingDataComplete),e(n,15,0,!l.prevResourceUrl),e(n,16,0,"preserve",l.prevResourceUrl),e(n,20,0,l.prevTitle),e(n,23,0,l.nextTitle),e(n,25,0,!l.nextResourceUrl),e(n,26,0,"preserve",l.nextResourceUrl),e(n,30,0,l.webmoduleData)}),(function(e,n){e(n,4,0,"NoopAnimations"===t.Gb(n,5)._animationMode),e(n,14,0,t.Gb(n,15).disabled?-1:t.Gb(n,15).tabIndex||0,t.Gb(n,15).disabled||null,t.Gb(n,15).disabled.toString(),"NoopAnimations"===t.Gb(n,15)._animationMode,t.Gb(n,16).target,t.Gb(n,16).href),e(n,24,0,t.Gb(n,25).disabled?-1:t.Gb(n,25).tabIndex||0,t.Gb(n,25).disabled||null,t.Gb(n,25).disabled.toString(),"NoopAnimations"===t.Gb(n,25)._animationMode,t.Gb(n,26).target,t.Gb(n,26).href)}))}function K(e){return t.Qb(0,[t.Ib(0,I.a,[]),(e()(),t.kb(16777216,null,null,1,null,L)),t.tb(2,16384,null,0,p.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null)],(function(e,n){e(n,2,0,n.component.webmoduleData)}),null)}function j(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,1,"viewer-web-module-container",[],null,null,null,K,G)),t.tb(1,114688,null,0,F,[g.a,h.a,T.a,d.a],null,null)],(function(e,n){e(n,1,0)}),null)}var H=t.qb("viewer-web-module-container",F,j,{isFetchingDataComplete:"isFetchingDataComplete",isErrorOccured:"isErrorOccured",forPreview:"forPreview",webmoduleData:"webmoduleData",webmoduleManifest:"webmoduleManifest",discussionForumWidget:"discussionForumWidget",isPreviewMode:"isPreviewMode"},{},[]),Q=l("mrSG"),A=l("iJLM");class B{constructor(e,n,l,t,i){this.activatedRoute=e,this.contentSvc=n,this.http=l,this.eventSvc=t,this.viewSvc=i,this.dataSubscription=null,this.telemetryIntervalSubscription=null,this.forPreview=window.location.href.includes("/author/")||window.location.href.includes("?preview=true"),this.isFetchingDataComplete=!1,this.isErrorOccured=!1,this.webmoduleData=null,this.oldData=null,this.alreadyRaised=!1,this.discussionForumWidget=null}ngOnInit(){this.dataSubscription=this.viewSvc.getContent(this.activatedRoute.snapshot.paramMap.get("resourceId")||"").subscribe(e=>Q.__awaiter(this,void 0,void 0,(function*(){this.webmoduleData=e,this.alreadyRaised&&this.oldData&&this.raiseEvent(k.g.EnumTelemetrySubType.Unloaded,this.oldData),this.webmoduleData&&this.formDiscussionForumWidget(this.webmoduleData),!this.forPreview&&this.webmoduleData&&this.webmoduleData.artifactUrl.indexOf("content-store")>=0&&(yield this.setS3Cookie(this.webmoduleData.identifier)),!this.webmoduleData||this.webmoduleData.mimeType!==A.h.EMimeTypes.WEB_MODULE&&this.webmoduleData.mimeType!==A.h.EMimeTypes.WEB_MODULE_EXERCISE||(this.webmoduleManifest=yield this.transformWebmodule(this.webmoduleData)),this.webmoduleData&&this.webmoduleData.identifier&&(this.webmoduleData.resumePage=1,this.activatedRoute.snapshot.queryParams.collectionId?yield this.fetchContinueLearning(this.activatedRoute.snapshot.queryParams.collectionId,this.webmoduleData.identifier):yield this.fetchContinueLearning(this.webmoduleData.identifier,this.webmoduleData.identifier)),this.webmoduleData&&this.webmoduleManifest?(this.oldData=this.webmoduleData,this.alreadyRaised=!0,this.raiseEvent(k.g.EnumTelemetrySubType.Loaded,this.webmoduleData),this.isFetchingDataComplete=!0):this.isErrorOccured=!0})),()=>{})}ngOnDestroy(){this.webmoduleData&&this.raiseEvent(k.g.EnumTelemetrySubType.Unloaded,this.webmoduleData),this.dataSubscription&&this.dataSubscription.unsubscribe(),this.telemetryIntervalSubscription&&this.telemetryIntervalSubscription.unsubscribe()}transformWebmodule(e){return Q.__awaiter(this,void 0,void 0,(function*(){let e="";if(this.webmoduleData&&this.webmoduleData.artifactUrl){const n=this.viewSvc.getAuthoringUrl(this.webmoduleData.artifactUrl);this.webmoduleData.artifactUrl=n,e=yield this.http.get(n||"").toPromise().catch(e=>{})}return e}))}formDiscussionForumWidget(e){this.discussionForumWidget={widgetData:{description:e.description,id:e.identifier,name:A.i.EDiscussionType.LEARNING,title:e.name,initialPostCount:2,isDisabled:this.forPreview},widgetSubType:"discussionForum",widgetType:"discussionForum"}}raiseEvent(e,n){this.forPreview||this.eventSvc.dispatchEvent({eventType:k.g.WsEventType.Telemetry,eventLogLevel:k.g.WsEventLogLevel.Info,from:"web-module",to:"",data:{state:e,type:k.g.WsTimeSpentType.Player,mode:k.g.WsTimeSpentMode.Play,content:n,identifier:n?n.identifier:null,mimeType:A.h.EMimeTypes.WEB_MODULE,url:n?n.artifactUrl:null}})}fetchContinueLearning(e,n){return Q.__awaiter(this,void 0,void 0,(function*(){return new Promise(l=>{this.contentSvc.fetchContentHistory(e).subscribe(e=>{e&&e.identifier===n&&e.continueData&&e.continueData.progress&&this.webmoduleData&&(this.webmoduleData.resumePage=Number(e.continueData.progress)),l(!0)},()=>l(!0))})}))}setS3Cookie(e){return Q.__awaiter(this,void 0,void 0,(function*(){yield this.contentSvc.setS3Cookie(e).toPromise().catch(()=>{})}))}}var z=l("IheW"),J=t.sb({encapsulation:0,styles:[[""]],data:{}});function X(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,1,"viewer-web-module-container",[],null,null,null,K,G)),t.tb(1,114688,null,0,F,[g.a,h.a,T.a,d.a],{isFetchingDataComplete:[0,"isFetchingDataComplete"],isErrorOccured:[1,"isErrorOccured"],forPreview:[2,"forPreview"],webmoduleData:[3,"webmoduleData"],webmoduleManifest:[4,"webmoduleManifest"],discussionForumWidget:[5,"discussionForumWidget"]},null)],(function(e,n){var l=n.component;e(n,1,0,l.isFetchingDataComplete,l.isErrorOccured,l.forPreview,l.webmoduleData,l.webmoduleManifest,l.discussionForumWidget)}),null)}function Y(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,1,"viewer-web-module",[],null,null,null,X,J)),t.tb(1,245760,null,0,B,[g.a,b.a,z.c,r.a,m.a],null,null)],(function(e,n){e(n,1,0)}),null)}var Z=t.qb("viewer-web-module",B,Y,{},{},[]),V=l("uJjh"),$=l("hQq7"),ee=l("Iani"),ne=l("AjsA"),le=l("wNFL"),te=l("NcP4"),ie=l("t68o"),ae=l("UGML"),ue=l("4gA+"),oe=l("3s4E"),se=l("p/gH"),re=l("6/yt"),ce=l("rnpX"),de=l("hgHL"),be=l("Tgwc"),me=l("jf99"),he=l("VsSb"),ge=l("AK/K"),pe=l("6wWs"),fe=l("tII7"),we=l("qbau"),ve=l("EakT"),Ee=l("6JF1"),ye=l("QQfA"),Pe=l("IP0z"),Me=l("oPrN"),De=l("bKtt"),Ce=l("ZGdF"),xe=l("POq0"),Oe=l("Mz6y"),_e=l("Xd0L"),Se=l("s7LF"),Ie=l("/Co4"),ke=l("gavF"),Te=l("JoiR"),Fe=l("JjoW"),Ge=l("3wtj"),Re=l("02hT"),Ue=l("zMNK"),We=l("hOhj"),Ne=l("dFDH");class qe{}var Le=l("Gi4r"),Ke=l("KDYE"),je=l("wBFC"),He=l("oapL"),Qe=l("HsOI"),Ae=l("ZwOa"),Be=l("GSMj"),ze=l("KPQW"),Je=l("1XhF"),Xe=l("kNGD"),Ye=l("W5yJ"),Ze=l("Nra3"),Ve=l("N8BH"),$e=l("f1R+"),en=l("3XeQ"),nn=l("1+c4"),ln=l("bwdU"),tn=l("PIFq"),an=l("aDOb"),un=l("Q+lL"),on=l("GilE"),sn=l("CpoC"),rn=l("6GCF"),cn=l("Bheh"),dn=l("kxhK"),bn=l("nUuF"),mn=l("oYwi"),hn=l("FPi+"),gn=l("alHs"),pn=l("W6PK"),fn=l("wgME");class wn{}var vn=l("BV1i"),En=l("BzsH"),yn=l("FZKd"),Pn=l("WvTd"),Mn=l("7Y9B"),Dn=l("v2bU"),Cn=l("PggI"),xn=l("gBMt");class On{}var _n=l("dvZr");l.d(n,"WebModuleModuleNgFactory",(function(){return Sn}));var Sn=t.rb(i,[],(function(e){return t.Db([t.Eb(512,t.j,t.bb,[[8,[a.a,a.b,u.a,Z,V.a,$.a,ee.a,ne.a,le.a,te.a,E.a,ie.a,ae.a,ue.a,oe.a,D.a,se.a,re.a,ce.a,de.a,be.a,me.a,he.a,ge.a,pe.a,H,fe.a,we.a,ve.a,Ee.a]],[3,t.j],t.w]),t.Eb(4608,p.r,p.q,[t.t,[2,p.N]]),t.Eb(4608,ye.d,ye.d,[ye.j,ye.f,t.j,ye.i,ye.g,t.q,t.y,p.d,Pe.b,[2,p.k]]),t.Eb(5120,ye.k,ye.l,[ye.d]),t.Eb(4608,Me.a,Me.a,[b.a,T.a,M.a,g.o,De.a,Ce.a,h.a,P.a]),t.Eb(4608,xe.c,xe.c,[]),t.Eb(5120,Oe.b,Oe.c,[ye.d]),t.Eb(4608,c.e,_e.c,[[2,_e.g],[2,_e.l]]),t.Eb(4608,Se.F,Se.F,[]),t.Eb(4608,_e.b,_e.b,[]),t.Eb(5120,x.c,x.d,[ye.d]),t.Eb(135680,x.e,x.e,[ye.d,t.q,[2,p.k],[2,x.b],x.c,[3,x.e],ye.f]),t.Eb(4608,Se.f,Se.f,[]),t.Eb(5120,Ie.b,Ie.c,[ye.d]),t.Eb(5120,ke.c,ke.k,[ye.d]),t.Eb(4608,z.l,z.v,[p.d,t.A,z.t]),t.Eb(4608,z.w,z.w,[z.l,z.u]),t.Eb(5120,z.a,(function(e){return[e]}),[z.w]),t.Eb(4608,z.s,z.s,[]),t.Eb(6144,z.o,null,[z.s]),t.Eb(4608,z.k,z.k,[z.o]),t.Eb(6144,z.b,null,[z.k]),t.Eb(4608,z.h,z.p,[z.b,t.q]),t.Eb(4608,z.c,z.c,[z.h]),t.Eb(4608,Te.a,Te.a,[z.c]),t.Eb(5120,Fe.a,Fe.b,[ye.d]),t.Eb(4608,Ge.a,Ge.a,[z.c,h.a]),t.Eb(1073742336,p.c,p.c,[]),t.Eb(1073742336,Pe.a,Pe.a,[]),t.Eb(1073742336,_e.l,_e.l,[[2,_e.d],[2,c.f]]),t.Eb(1073742336,w.g,w.g,[]),t.Eb(1073742336,Re.b,Re.b,[]),t.Eb(1073742336,P.b,P.b,[]),t.Eb(1073742336,_e.w,_e.w,[]),t.Eb(1073742336,_.c,_.c,[]),t.Eb(1073742336,Ue.g,Ue.g,[]),t.Eb(1073742336,We.c,We.c,[]),t.Eb(1073742336,ye.h,ye.h,[]),t.Eb(1073742336,Ne.f,Ne.f,[]),t.Eb(1073742336,g.s,g.s,[[2,g.x],[2,g.o]]),t.Eb(1073742336,qe,qe,[]),t.Eb(1073742336,Le.c,Le.c,[]),t.Eb(1073742336,Ke.a,Ke.a,[]),t.Eb(1073742336,xe.d,xe.d,[]),t.Eb(1073742336,S.a,S.a,[]),t.Eb(1073742336,Oe.e,Oe.e,[]),t.Eb(1073742336,je.a,je.a,[]),t.Eb(1073742336,Se.E,Se.E,[]),t.Eb(1073742336,Se.m,Se.m,[]),t.Eb(1073742336,He.c,He.c,[]),t.Eb(1073742336,Qe.e,Qe.e,[]),t.Eb(1073742336,Ae.c,Ae.c,[]),t.Eb(1073742336,x.k,x.k,[]),t.Eb(1073742336,Be.a,Be.a,[]),t.Eb(1073742336,ze.b,ze.b,[]),t.Eb(1073742336,Je.a,Je.a,[]),t.Eb(1073742336,Xe.f,Xe.f,[]),t.Eb(1073742336,Ye.c,Ye.c,[]),t.Eb(1073742336,Se.A,Se.A,[]),t.Eb(1073742336,_e.u,_e.u,[]),t.Eb(1073742336,_e.r,_e.r,[]),t.Eb(1073742336,Ie.e,Ie.e,[]),t.Eb(1073742336,Ze.a,Ze.a,[]),t.Eb(1073742336,Ve.a,Ve.a,[]),t.Eb(1073742336,$e.a,$e.a,[]),t.Eb(1073742336,en.a,en.a,[]),t.Eb(1073742336,nn.a,nn.a,[]),t.Eb(1073742336,ln.b,ln.b,[]),t.Eb(1073742336,tn.a,tn.a,[]),t.Eb(1073742336,an.a,an.a,[]),t.Eb(1073742336,ke.j,ke.j,[]),t.Eb(1073742336,ke.g,ke.g,[]),t.Eb(1073742336,_e.n,_e.n,[]),t.Eb(1073742336,un.e,un.e,[]),t.Eb(1073742336,on.a,on.a,[]),t.Eb(1073742336,sn.a,sn.a,[]),t.Eb(1073742336,rn.a,rn.a,[]),t.Eb(1073742336,cn.a,cn.a,[]),t.Eb(1073742336,dn.a,dn.a,[]),t.Eb(1073742336,bn.a,bn.a,[]),t.Eb(1073742336,mn.a,mn.a,[]),t.Eb(1073742336,hn.a,hn.a,[]),t.Eb(1073742336,z.f,z.f,[]),t.Eb(1073742336,z.e,z.e,[]),t.Eb(1073742336,gn.c,gn.c,[]),t.Eb(1073742336,pn.a,pn.a,[]),t.Eb(1073742336,fn.a,fn.a,[]),t.Eb(1073742336,wn,wn,[]),t.Eb(1073742336,vn.h,vn.h,[]),t.Eb(1073742336,Fe.d,Fe.d,[]),t.Eb(1073742336,En.b,En.b,[]),t.Eb(1073742336,yn.a,yn.a,[]),t.Eb(1073742336,Pn.a,Pn.a,[]),t.Eb(1073742336,Mn.a,Mn.a,[]),t.Eb(1073742336,Dn.a,Dn.a,[]),t.Eb(1073742336,Cn.a,Cn.a,[]),t.Eb(1073742336,xn.a,xn.a,[]),t.Eb(1073742336,On,On,[]),t.Eb(1073742336,i,i,[]),t.Eb(256,t.t,"hi",[]),t.Eb(1024,g.m,(function(){return[[{path:":resourceId",component:B,resolve:{content:Me.a}}],[{path:":resourceId",component:F,resolve:{content:Me.a}}]]}),[]),t.Eb(256,Xe.a,{separatorKeyCodes:[_n.g]},[]),t.Eb(256,z.t,"XSRF-TOKEN",[]),t.Eb(256,z.u,"X-XSRF-TOKEN",[]),t.Eb(256,gn.a,{formats:["background","bold","color","font","code","italic","link","size","strike","script","underline","blockquote","header","indent","list","align","direction","code-block","image"],modules:{toolbar:[["blockquote","code-block"],["bold","italic","underline","link"],[{list:"ordered"},{list:"bullet"}],[{indent:"-1"},{indent:"+1"}],[{size:["small",!1,"large","huge"]}],[{header:[1,2,3,4,5,6,!1]}],[{color:[]},{background:[]}],[{font:[]}],[{align:[]}],["image"]],history:{delay:1500,userOnly:!0},syntax:!1},theme:"snow"},[])])}))}}]);