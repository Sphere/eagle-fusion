(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{NJKi:function(e,n,l){"use strict";l.d(n,"a",(function(){return r}));var t=l("mrSG"),i=l("xgIS"),a=(l("g6cB"),l("iJLM"));l("jMFU");class r{constructor(e,n,l,t,i,a,r){this.events=e,this.domSanitizer=n,this.valueSvc=l,this.contentSvc=t,this.viewerSvc=i,this.configurationSvc=a,this.activatedRoute=r,this.collectionId="",this.theme={className:""},this.screenSizeSubscription=null,this.oldIdentifier="",this.sideListOpened=!1,this.screenSizeIsXSmall=!1,this.defaultFontSize=14,this.fontSizes=[10,12,14,16,18,20,22],this.currentSlideNumber=0,this.maxLastPageNumber=0,this.urlPrefix="",this.slides=[],this.iframeUrl="",this.iframeLoadingInProgress=!0,this.isCompleted=!1,this.slideAudioUrl="",this.current=[],this.counter=!1,this.isScrolled=!1,this.firstScroll=!0,this.iframeElem={}}ngOnInit(){this.screenSizeSubscription=this.valueSvc.isXSmall$.subscribe(e=>{this.screenSizeIsXSmall=e}),this.configurationSvc.activeFontObject&&this.configurationSvc.activeFontObject.baseFontSize&&(this.currentFontSize=this.configurationSvc.activeFontObject.baseFontSize,this.defaultFontSize=+this.currentFontSize.slice(0,-2)),this.loadWebModule(),this.configurationSvc.prefChangeNotifier.subscribe(()=>{this.setTheme()})}ngOnChanges(e){for(const n in e)"widgetData"===n&&this.widgetData.identifier!==this.oldIdentifier&&this.current.length>0&&(this.saveContinueLearning(this.oldIdentifier),this.fireRealTimeProgress(this.oldIdentifier));this.current=[],this.currentSlideNumber=0,this.maxLastPageNumber=0,this.urlPrefix=this.widgetData.artifactUrl.substring(0,this.widgetData.artifactUrl.lastIndexOf("/")),this.oldIdentifier=this.widgetData.identifier,this.loadWebModule()}ngOnDestroy(){this.screenSizeSubscription&&this.screenSizeSubscription.unsubscribe(),this.saveContinueLearning(this.widgetData.identifier),this.fireRealTimeProgress(this.widgetData.identifier)}saveContinueLearning(e){if(this.widgetData.mimeType===(a.h.EMimeTypes.WEB_MODULE||a.h.EMimeTypes.WEB_MODULE_EXERCISE))if(this.activatedRoute.snapshot.queryParams.collectionType&&"playlist"===this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase()){const n={contextPathId:this.collectionId?this.collectionId:e,resourceId:e,dateAccessed:Date.now(),contextType:"playlist",data:JSON.stringify({progress:this.currentSlideNumber,timestamp:Date.now(),contextFullPath:[this.activatedRoute.snapshot.queryParams.collectionId,e]})};this.contentSvc.saveContinueLearning(n).toPromise().catch()}else{const n={contextPathId:this.collectionId?this.collectionId:e,resourceId:e,dateAccessed:Date.now(),data:JSON.stringify({progress:this.currentSlideNumber,timestamp:Date.now()})};this.contentSvc.saveContinueLearning(n).toPromise().catch()}}fireRealTimeProgress(e){this.widgetData.mimeType===(a.h.EMimeTypes.WEB_MODULE||a.h.EMimeTypes.WEB_MODULE_EXERCISE)&&this.current.length>0&&this.slides.length>0&&this.viewerSvc.realTimeProgressUpdate(e,{content_type:"Resource",mime_type:this.widgetData.mimeType,user_id_type:"uuid",current:this.current,max_size:this.slides.length})}loadWebModule(){this.slides=this.webModuleManifest.resources?this.webModuleManifest.resources.map(e=>Object.assign({},e,{safeUrl:this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlPrefix+e.artifactUrl)})):this.webModuleManifest.map(e=>Object.assign({},e,{safeUrl:this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlPrefix+e.URL)})),this.setPage(this.widgetData.resumePage?this.widgetData.resumePage:1)}setPage(e){if(this.current.includes(e.toString())||this.current.push(e.toString()),!this.iframeUrl||e!==this.currentSlideNumber)return e>=1&&e<=this.slides.length?(this.currentSlideNumber=e,this.iframeUrl=this.slides[this.currentSlideNumber-1].safeUrl,this.slides[this.currentSlideNumber-1].audio&&this.setAudio(this.slides[this.currentSlideNumber-1].audio),this.iframeLoadingInProgress=!0):null===this.iframeUrl&&(this.iframeUrl=this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlPrefix+this.slides[0].URL),this.slides[this.currentSlideNumber-1].audio&&this.setAudio(this.slides[0].audio),this.iframeLoadingInProgress=!0),this.currentSlideNumber===this.slides.length&&(this.isCompleted=!0),this.setAudio(this.slides[this.currentSlideNumber-1].audio),this.currentSlideNumber>this.maxLastPageNumber&&(this.maxLastPageNumber=this.currentSlideNumber),this.currentSlideNumber}setAudio(e){this.slideAudioUrl=Array.isArray(e)&&e.length&&e[0].URL?this.domSanitizer.bypassSecurityTrustUrl(this.urlPrefix+e[0].URL):null}pageChange(e){this.raiseTelemetry("pageChange","click"),1===e&&this.currentSlideNumber<this.slides.length?this.setPage(this.currentSlideNumber+1):-1===e&&this.currentSlideNumber>1&&this.setPage(this.currentSlideNumber-1)}raiseTelemetry(e,n){this.widgetData.identifier&&this.events.raiseInteractTelemetry(e,n,{contentId:this.widgetData.identifier}),"scroll"===n&&(this.isScrolled=!1)}raiseScrollTelemetry(){this.scrollTimeInterval=setInterval(()=>{this.isScrolled&&this.raiseTelemetry("pageScroll","scroll")},12e4)}modifyIframeDom(e){return t.__awaiter(this,void 0,void 0,(function*(){let n,l,t,a,r,o,s,u,d;if(!e.contentWindow)return;if(n=e.contentWindow.document,!n)return;Object(i.a)(n,"scroll").subscribe(()=>{this.isScrolled=!0,this.isScrolled&&this.firstScroll&&(this.raiseTelemetry("pageScroll","scroll"),this.raiseScrollTelemetry()),this.firstScroll=!1}),l=n.createDocumentFragment(),t=n.createElement("link"),a=n.createElement("link"),r=n.createElement("script"),o=n.createElement("link"),s=n.createElement("link"),u=n.createElement("style"),d=n.createElement("script"),t.setAttribute("href","https://fonts.googleapis.com/css?family=Roboto:300,400,500"),t.setAttribute("rel","stylesheet"),a.setAttribute("href","/assets/common/lib/google-code-prettify/skins/sunburst.css"),a.setAttribute("rel","stylesheet"),r&&(r.type="text/javascript",r.setAttribute("src","/assets/common/lib/google-code-prettify/prettify.js")),o&&(o.setAttribute("href","/assets/common/plugins/web-module/web-module.css"),o.setAttribute("rel","stylesheet")),s&&(s.setAttribute("href","/assets/common/lib/normalize.min.css"),s.setAttribute("rel","stylesheet")),l=n.createDocumentFragment(),t=n.createElement("link"),t.setAttribute("href","https://fonts.googleapis.com/css?family=Roboto:300,400,500"),t.setAttribute("rel","stylesheet"),a=n.createElement("link"),a.setAttribute("href","/assets/common/lib/google-code-prettify/skins/sunburst.css"),a.setAttribute("rel","stylesheet"),r=n.createElement("script"),r.type="text/javascript",r.setAttribute("src","/assets/common/lib/google-code-prettify/prettify.js"),o=n.createElement("link"),o.setAttribute("href","/assets/common/plugins/web-module/web-module.css"),o.setAttribute("rel","stylesheet"),s=n.createElement("link"),s.setAttribute("href","/assets/common/lib/normalize.min.css"),s.setAttribute("rel","stylesheet"),u=n.createElement("style"),u.innerHTML='\n          .transparent-button {\n            background: transparent;\n            border: none;\n            cursor: pointer;\n          }\n          .transparent-button:focus {\n            outline: none;\n          }\n          .button-of-material {\n          background-color: #3f51b5;\n          color: #fff !important;\n          box-sizing: border-box;\n          position: relative;\n          -webkit-user-select: none;\n          -moz-user-select: none;\n          -ms-user-select: none;\n          user-select: none;\n          cursor: pointer;\n          outline: 0;\n          border: none;\n          -webkit-tap-highlight-color: transparent;\n          display: inline-block;\n          white-space: nowrap;\n          text-decoration: none;\n          vertical-align: baseline;\n          text-align: center;\n          margin: 0;\n          line-height: 32px;\n          padding: 0 8px;\n          border-radius: 4px;\n          overflow: visible;\n          transform: translate3d(0, 0, 0);\n          transition: background .4s cubic-bezier(.25, .8, .25, 1), box-shadow 280ms cubic-bezier(.4, 0, .2, 1);\n          font-family: Roboto, "Helvetica Neue", sans-serif;\n          font-size: 14px;\n          font-weight: 300;\n      }\n\n      .disabled-button {\n          color: black !important;\n          background-color: white;\n      }\n\n      .ripple {\n          background-position: center;\n          transition: background 0.8s;\n      }\n\n      .ripple:hover {\n          background: #2f41a5 radial-gradient(circle, transparent 1%, #2f41a5 1%) center/15000%;\n      }\n\n      .ripple:active {\n          background-color: #5f7fdf;\n          background-size: 100%;\n          transition: background 0s;\n      }',d=n.createElement("script");const c=this.theme;d.type="text/javascript",d.innerHTML=`\n          document.body.classList.add('app-background', '${c.className}', 'custom-scroll-small');\n          for(var i=0; i < document.querySelectorAll("[style]").length; i++ ) {\n            document.querySelectorAll("[style]")[i].setAttribute('style', null);\n          }\n          for(var i=0; i < document.querySelectorAll("pre").length; i++ ) {\n            document.querySelectorAll("pre")[i].classList.add('prettyprint');\n            document.querySelectorAll("pre")[i].setAttribute("id", "codepane"+i);\n            document.querySelectorAll("pre")[i].classList.add('prettyprint');\n            var btn = document.createElement("BUTTON");\n            btn.innerHTML = "<img src='/assets/common/plugins/web-module/copyButtonImage.svg'/>";\n            var newParam = "codepane"+i;\n            var nParam = "copyButton"+i;\n            btn.setAttribute("id", nParam);\n            btn.setAttribute("class", "transparent-button")\n            btn.style.float = "right";\n            btn.style.color = "white";\n            btn.setAttribute("onclick", "copyToClipBoardFunction("+newParam+","+nParam+")");\n            document.querySelectorAll("pre")[i].appendChild(btn)\n          }\n          for(var i=0; i < document.querySelectorAll(".prettyprint").length; i++ ) {\n            document.querySelectorAll(".prettyprint")[i].classList.add('linenums:1');\n          }\n          function copyToClipBoardFunction(param, nParam) {\n            nParam.innerText = "Copied!";\n            nParam.setAttribute("class","button-of-material disabled-button");\n            const id = 'mycustom-clipboard-textarea-hidden-id';\n            let existsTextarea = document.getElementById(id);\n            if (!existsTextarea) {\n              const textarea = document.createElement('textarea');\n              textarea.id = id;\n              // Place in top-left corner of screen regardless of scroll position.\n              textarea.style.position = 'fixed';\n              textarea.style.top = '0px';\n              textarea.style.left = '0px';\n              // Ensure it has a small width and height. Setting to 1px / 1em\n              // doesn't work as this gives a negative w/h on some browsers.\n              textarea.style.width = '1px';\n              textarea.style.height = '1px';\n              // We don't need padding, reducing the size if it does flash render.\n              textarea.style.padding = '0px';\n              // Clean up any borders.\n              textarea.style.border = 'none';\n              textarea.style.outline = 'none';\n              textarea.style.boxShadow = 'none';\n              // Avoid flash of white box if rendered for any reason.\n              textarea.style.background = 'transparent';\n              document.querySelector('body').appendChild(textarea);\n              existsTextarea = document.getElementById(id);\n            } else {\n            }\n            existsTextarea.value = param.innerText.slice(0,param.innerText.length-7);\n            existsTextarea.select();\n            try {\n              const status = document.execCommand('copy');\n              if (!status) {\n                logger.error('Cannot copy text');\n              } else {\n                const tooltip = document.getElementById('myTooltip');\n                tooltip.innerHTML = 'Code Copied!';\n              }\n            } catch (err) {\n            }\n            setTimeout(\n              function() {\n                nParam.innerHTML = "<img src='/assets/common/plugins/web-module/copyButtonImage.svg'/>";\n                nParam.setAttribute("class","transparent-button");\n              }, 1000);\n          }\n          setTimeout(function() {\n            try {\n              PR.prettyPrint();\n            } catch (e) {\n              setTimeout(function() {\n                PR.prettyPrint();\n              }, 1000);\n            }\n          }, 500);\n        `,l.appendChild(s),l.appendChild(t),l.appendChild(o),l.appendChild(a),l.appendChild(r),l.appendChild(d),l.appendChild(u),n.head.appendChild(l),setTimeout(()=>{this.iframeLoadingInProgress=!1,this.setTheme()},1e3)}))}setTheme(){const e=this.getColor("color"),n=this.getColor("backgroundColor");this.currentFontSize&&this.modifyIframeStyle("fontSize",this.currentFontSize),this.modifyIframeStyle("backgroundColor",n),this.modifyIframeStyle("color",e)}modifyIframeStyle(e,n){let l=null;const t=this.iframeElem;t&&(l=t.nativeElement.contentWindow.document),l&&(l.body.style[e]=n),"fontSize"===e&&(this.currentFontSize=n)}getColor(e){const n=getComputedStyle(document.body)[e].replace("rgba","").replace("rgb","").replace("(","").replace(")","").split(",");return"#"+("0"+parseInt(n[0],10).toString(16)).slice(-2)+("0"+parseInt(n[1],10).toString(16)).slice(-2)+("0"+parseInt(n[2],10).toString(16)).slice(-2)}}},WvTd:function(e,n,l){"use strict";l.d(n,"a",(function(){return t}));class t{}},goGN:function(e,n,l){"use strict";var t=l("8Y7J"),i=l("MlvX"),a=l("Xd0L"),r=l("dJrM"),o=l("HsOI"),s=l("IP0z"),u=l("/HVE"),d=l("omvX"),c=l("Azqq"),b=l("JjoW"),m=l("s7LF"),h=l("hOhj"),p=l("5GAg"),g=l("SVse"),f=l("bujt"),y=l("Fwaw"),G=l("TtEo"),v=l("02hT"),S=l("Mr+X"),w=l("Gi4r"),x=l("tII7"),_=l("BSaD"),C=l("c4Wm"),k=l("BV1i"),M=l("6UMx"),P=l("Q+lL");l("NJKi"),l("Q3Rl"),l("cUpR"),l("TPUF"),l("4fW1"),l("jMFU"),l("88ff"),l("iInd"),l.d(n,"a",(function(){return I})),l.d(n,"b",(function(){return E}));var I=t.sb({encapsulation:0,styles:[['.web-module-container[_ngcontent-%COMP%]{height:100%;width:100%;display:flex;flex-direction:column}.audio-container[_ngcontent-%COMP%]{width:100%;height:40px;display:flex;align-items:center}.audio-container[_ngcontent-%COMP%]   audio[_ngcontent-%COMP%]{width:100%}.web-module-nav-bar[_ngcontent-%COMP%]{display:flex;align-items:center;min-height:40px;overflow:hidden;font:inherit;flex-wrap:wrap}.web-module-nav-bar[_ngcontent-%COMP%]   .page-input[_ngcontent-%COMP%]{width:40px;border:0;outline:0;background:inherit;color:inherit;font:inherit;border-bottom:1px solid;text-align:center}.web-module-nav-bar[_ngcontent-%COMP%]   .spacer[_ngcontent-%COMP%]{flex:1 1 auto}.web-module-nav-bar[_ngcontent-%COMP%]   .full-screen-button[_ngcontent-%COMP%]{order:unset}.web-module-sidenav-container[_ngcontent-%COMP%]{flex:1 1 auto;height:calc(100% - 80px)}.web-module-sidenav[_ngcontent-%COMP%]{min-width:320px;max-width:95%}.web-module-iframe[_ngcontent-%COMP%]{height:100%;width:100%;display:block;position:relative}.iframeBlur[_ngcontent-%COMP%]{filter:blur(10px)}.web-module-iframe-shadow[_ngcontent-%COMP%]::after{content:" ";position:absolute;display:block;top:0;left:0;bottom:0;right:0;background:#333;opacity:.5;z-index:10}.font-size-select[_ngcontent-%COMP%]{width:80px}']],data:{}});function T(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,2,"mat-option",[["class","mat-option"],["role","option"]],[[1,"tabindex",0],[2,"mat-selected",null],[2,"mat-option-multiple",null],[2,"mat-active",null],[8,"id",0],[1,"aria-selected",0],[1,"aria-disabled",0],[2,"mat-option-disabled",null]],[[null,"click"],[null,"keydown"]],(function(e,n,l){var i=!0,a=e.component;return"click"===n&&(i=!1!==t.Gb(e,1)._selectViaInteraction()&&i),"keydown"===n&&(i=!1!==t.Gb(e,1)._handleKeydown(l)&&i),"click"===n&&(i=!1!==a.modifyIframeStyle("fontSize",e.context.$implicit+"px")&&i),i}),i.c,i.a)),t.tb(1,8568832,[[11,4]],0,a.q,[t.k,t.h,[2,a.j],[2,a.p]],{value:[0,"value"]},null),(e()(),t.Ob(2,0,[" "," "]))],(function(e,n){e(n,1,0,n.context.$implicit)}),(function(e,n){e(n,0,0,t.Gb(n,1)._getTabIndex(),t.Gb(n,1).selected,t.Gb(n,1).multiple,t.Gb(n,1).active,t.Gb(n,1).id,t.Gb(n,1)._getAriaSelected(),t.Gb(n,1).disabled.toString(),t.Gb(n,1).disabled),e(n,2,0,n.context.$implicit)}))}function A(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,22,"mat-form-field",[["class","font-size-select mat-form-field"]],[[2,"mat-form-field-appearance-standard",null],[2,"mat-form-field-appearance-fill",null],[2,"mat-form-field-appearance-outline",null],[2,"mat-form-field-appearance-legacy",null],[2,"mat-form-field-invalid",null],[2,"mat-form-field-can-float",null],[2,"mat-form-field-should-float",null],[2,"mat-form-field-has-label",null],[2,"mat-form-field-hide-placeholder",null],[2,"mat-form-field-disabled",null],[2,"mat-form-field-autofilled",null],[2,"mat-focused",null],[2,"mat-accent",null],[2,"mat-warn",null],[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null],[2,"_mat-animation-noopable",null]],null,null,r.b,r.a)),t.tb(1,7520256,null,9,o.c,[t.k,t.h,[2,a.h],[2,s.b],[2,o.a],u.a,t.y,[2,d.a]],null,null),t.Mb(603979776,2,{_controlNonStatic:0}),t.Mb(335544320,3,{_controlStatic:0}),t.Mb(603979776,4,{_labelChildNonStatic:0}),t.Mb(335544320,5,{_labelChildStatic:0}),t.Mb(603979776,6,{_placeholderChild:0}),t.Mb(603979776,7,{_errorChildren:1}),t.Mb(603979776,8,{_hintChildren:1}),t.Mb(603979776,9,{_prefixChildren:1}),t.Mb(603979776,10,{_suffixChildren:1}),(e()(),t.ub(11,0,null,1,11,"mat-select",[["class","mat-select"],["placeholder","Font Size"],["role","listbox"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null],[1,"id",0],[1,"tabindex",0],[1,"aria-label",0],[1,"aria-labelledby",0],[1,"aria-required",0],[1,"aria-disabled",0],[1,"aria-invalid",0],[1,"aria-owns",0],[1,"aria-multiselectable",0],[1,"aria-describedby",0],[1,"aria-activedescendant",0],[2,"mat-select-disabled",null],[2,"mat-select-invalid",null],[2,"mat-select-required",null],[2,"mat-select-empty",null]],[[null,"ngModelChange"],[null,"keydown"],[null,"focus"],[null,"blur"]],(function(e,n,l){var i=!0,a=e.component;return"keydown"===n&&(i=!1!==t.Gb(e,16)._handleKeydown(l)&&i),"focus"===n&&(i=!1!==t.Gb(e,16)._onFocus()&&i),"blur"===n&&(i=!1!==t.Gb(e,16)._onBlur()&&i),"ngModelChange"===n&&(i=!1!==(a.defaultFontSize=l)&&i),i}),c.b,c.a)),t.Lb(6144,null,a.j,null,[b.c]),t.tb(13,671744,null,0,m.v,[[8,null],[8,null],[8,null],[8,null]],{model:[0,"model"]},{update:"ngModelChange"}),t.Lb(2048,null,m.r,null,[m.v]),t.tb(15,16384,null,0,m.s,[[4,m.r]],null,null),t.tb(16,2080768,null,3,b.c,[h.e,t.h,t.y,a.b,t.k,[2,s.b],[2,m.u],[2,m.k],[2,o.c],[6,m.r],[8,null],b.a,p.j],{placeholder:[0,"placeholder"]},null),t.Mb(603979776,11,{options:1}),t.Mb(603979776,12,{optionGroups:1}),t.Mb(603979776,13,{customTrigger:0}),t.Lb(2048,[[2,4],[3,4]],o.d,null,[b.c]),(e()(),t.kb(16777216,null,1,1,null,T)),t.tb(22,278528,null,0,g.o,[t.P,t.M,t.r],{ngForOf:[0,"ngForOf"]},null)],(function(e,n){var l=n.component;e(n,13,0,l.defaultFontSize),e(n,16,0,"Font Size"),e(n,22,0,l.fontSizes)}),(function(e,n){e(n,0,1,["standard"==t.Gb(n,1).appearance,"fill"==t.Gb(n,1).appearance,"outline"==t.Gb(n,1).appearance,"legacy"==t.Gb(n,1).appearance,t.Gb(n,1)._control.errorState,t.Gb(n,1)._canLabelFloat,t.Gb(n,1)._shouldLabelFloat(),t.Gb(n,1)._hasFloatingLabel(),t.Gb(n,1)._hideControlPlaceholder(),t.Gb(n,1)._control.disabled,t.Gb(n,1)._control.autofilled,t.Gb(n,1)._control.focused,"accent"==t.Gb(n,1).color,"warn"==t.Gb(n,1).color,t.Gb(n,1)._shouldForward("untouched"),t.Gb(n,1)._shouldForward("touched"),t.Gb(n,1)._shouldForward("pristine"),t.Gb(n,1)._shouldForward("dirty"),t.Gb(n,1)._shouldForward("valid"),t.Gb(n,1)._shouldForward("invalid"),t.Gb(n,1)._shouldForward("pending"),!t.Gb(n,1)._animationsEnabled]),e(n,11,1,[t.Gb(n,15).ngClassUntouched,t.Gb(n,15).ngClassTouched,t.Gb(n,15).ngClassPristine,t.Gb(n,15).ngClassDirty,t.Gb(n,15).ngClassValid,t.Gb(n,15).ngClassInvalid,t.Gb(n,15).ngClassPending,t.Gb(n,16).id,t.Gb(n,16).tabIndex,t.Gb(n,16)._getAriaLabel(),t.Gb(n,16)._getAriaLabelledby(),t.Gb(n,16).required.toString(),t.Gb(n,16).disabled.toString(),t.Gb(n,16).errorState,t.Gb(n,16).panelOpen?t.Gb(n,16)._optionIds:null,t.Gb(n,16).multiple,t.Gb(n,16)._ariaDescribedby||null,t.Gb(n,16)._getAriaActiveDescendant(),t.Gb(n,16).disabled,t.Gb(n,16).errorState,t.Gb(n,16).required,t.Gb(n,16).empty])}))}function L(e){return t.Qb(0,[(e()(),t.ub(0,0,[["slideAudio",1]],null,0,"audio",[["controls",""],["controlsList","nodownload"]],[[8,"src",4]],null,null,null,null))],null,(function(e,n){e(n,0,0,n.component.slideAudioUrl)}))}function O(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,8,"div",[["class","flex"],["mat-list-item",""]],null,null,null,null,null)),t.Lb(512,null,g.I,g.J,[t.r,t.s,t.k,t.D]),t.tb(2,278528,null,0,g.n,[g.I],{klass:[0,"klass"],ngClass:[1,"ngClass"]},null),t.Jb(3,{"mat-primary mat-toolbar":0}),(e()(),t.ub(4,0,null,null,2,"button",[["class","text-left width-expand"],["mat-button",""]],[[1,"disabled",0],[2,"_mat-animation-noopable",null]],[[null,"click"]],(function(e,n,l){var t=!0;return"click"===n&&(t=!1!==e.component.setPage(e.context.index+1)&&t),t}),f.d,f.b)),t.tb(5,180224,null,0,y.b,[t.k,p.h,[2,d.a]],null,null),(e()(),t.Ob(6,0,[" "," "])),(e()(),t.ub(7,0,null,null,1,"mat-divider",[["class","mat-divider"],["role","separator"]],[[1,"aria-orientation",0],[2,"mat-divider-vertical",null],[2,"mat-divider-horizontal",null],[2,"mat-divider-inset",null]],null,null,G.b,G.a)),t.tb(8,49152,null,0,v.a,[],null,null)],(function(e,n){var l=e(n,3,0,n.component.currentSlideNumber===n.context.index+1);e(n,2,0,"flex",l)}),(function(e,n){e(n,4,0,t.Gb(n,5).disabled||null,"NoopAnimations"===t.Gb(n,5)._animationMode),e(n,6,0,n.context.$implicit.title),e(n,7,0,t.Gb(n,8).vertical?"vertical":"horizontal",t.Gb(n,8).vertical,!t.Gb(n,8).vertical,t.Gb(n,8).inset)}))}function F(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,2,"mat-option",[["class","mat-option"],["role","option"]],[[1,"tabindex",0],[2,"mat-selected",null],[2,"mat-option-multiple",null],[2,"mat-active",null],[8,"id",0],[1,"aria-selected",0],[1,"aria-disabled",0],[2,"mat-option-disabled",null]],[[null,"click"],[null,"keydown"]],(function(e,n,l){var i=!0,a=e.component;return"click"===n&&(i=!1!==t.Gb(e,1)._selectViaInteraction()&&i),"keydown"===n&&(i=!1!==t.Gb(e,1)._handleKeydown(l)&&i),"click"===n&&(i=!1!==a.modifyIframeStyle("fontSize",e.context.$implicit+"px")&&i),i}),i.c,i.a)),t.tb(1,8568832,[[25,4]],0,a.q,[t.k,t.h,[2,a.j],[2,a.p]],{value:[0,"value"]},null),(e()(),t.Ob(2,0,[" "," "]))],(function(e,n){e(n,1,0,n.context.$implicit)}),(function(e,n){e(n,0,0,t.Gb(n,1)._getTabIndex(),t.Gb(n,1).selected,t.Gb(n,1).multiple,t.Gb(n,1).active,t.Gb(n,1).id,t.Gb(n,1)._getAriaSelected(),t.Gb(n,1).disabled.toString(),t.Gb(n,1).disabled),e(n,2,0,n.context.$implicit)}))}function z(e){return t.Qb(0,[(e()(),t.ub(0,0,null,null,22,"mat-form-field",[["class","margin-left-m mat-form-field"]],[[2,"mat-form-field-appearance-standard",null],[2,"mat-form-field-appearance-fill",null],[2,"mat-form-field-appearance-outline",null],[2,"mat-form-field-appearance-legacy",null],[2,"mat-form-field-invalid",null],[2,"mat-form-field-can-float",null],[2,"mat-form-field-should-float",null],[2,"mat-form-field-has-label",null],[2,"mat-form-field-hide-placeholder",null],[2,"mat-form-field-disabled",null],[2,"mat-form-field-autofilled",null],[2,"mat-focused",null],[2,"mat-accent",null],[2,"mat-warn",null],[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null],[2,"_mat-animation-noopable",null]],null,null,r.b,r.a)),t.tb(1,7520256,null,9,o.c,[t.k,t.h,[2,a.h],[2,s.b],[2,o.a],u.a,t.y,[2,d.a]],null,null),t.Mb(603979776,16,{_controlNonStatic:0}),t.Mb(335544320,17,{_controlStatic:0}),t.Mb(603979776,18,{_labelChildNonStatic:0}),t.Mb(335544320,19,{_labelChildStatic:0}),t.Mb(603979776,20,{_placeholderChild:0}),t.Mb(603979776,21,{_errorChildren:1}),t.Mb(603979776,22,{_hintChildren:1}),t.Mb(603979776,23,{_prefixChildren:1}),t.Mb(603979776,24,{_suffixChildren:1}),(e()(),t.ub(11,0,null,1,11,"mat-select",[["class","mat-select"],["placeholder","Font Size"],["role","listbox"]],[[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null],[1,"id",0],[1,"tabindex",0],[1,"aria-label",0],[1,"aria-labelledby",0],[1,"aria-required",0],[1,"aria-disabled",0],[1,"aria-invalid",0],[1,"aria-owns",0],[1,"aria-multiselectable",0],[1,"aria-describedby",0],[1,"aria-activedescendant",0],[2,"mat-select-disabled",null],[2,"mat-select-invalid",null],[2,"mat-select-required",null],[2,"mat-select-empty",null]],[[null,"ngModelChange"],[null,"keydown"],[null,"focus"],[null,"blur"]],(function(e,n,l){var i=!0,a=e.component;return"keydown"===n&&(i=!1!==t.Gb(e,16)._handleKeydown(l)&&i),"focus"===n&&(i=!1!==t.Gb(e,16)._onFocus()&&i),"blur"===n&&(i=!1!==t.Gb(e,16)._onBlur()&&i),"ngModelChange"===n&&(i=!1!==(a.defaultFontSize=l)&&i),i}),c.b,c.a)),t.Lb(6144,null,a.j,null,[b.c]),t.tb(13,671744,null,0,m.v,[[8,null],[8,null],[8,null],[8,null]],{model:[0,"model"]},{update:"ngModelChange"}),t.Lb(2048,null,m.r,null,[m.v]),t.tb(15,16384,null,0,m.s,[[4,m.r]],null,null),t.tb(16,2080768,null,3,b.c,[h.e,t.h,t.y,a.b,t.k,[2,s.b],[2,m.u],[2,m.k],[2,o.c],[6,m.r],[8,null],b.a,p.j],{placeholder:[0,"placeholder"]},null),t.Mb(603979776,25,{options:1}),t.Mb(603979776,26,{optionGroups:1}),t.Mb(603979776,27,{customTrigger:0}),t.Lb(2048,[[16,4],[17,4]],o.d,null,[b.c]),(e()(),t.kb(16777216,null,1,1,null,F)),t.tb(22,278528,null,0,g.o,[t.P,t.M,t.r],{ngForOf:[0,"ngForOf"]},null)],(function(e,n){var l=n.component;e(n,13,0,l.defaultFontSize),e(n,16,0,"Font Size"),e(n,22,0,l.fontSizes)}),(function(e,n){e(n,0,1,["standard"==t.Gb(n,1).appearance,"fill"==t.Gb(n,1).appearance,"outline"==t.Gb(n,1).appearance,"legacy"==t.Gb(n,1).appearance,t.Gb(n,1)._control.errorState,t.Gb(n,1)._canLabelFloat,t.Gb(n,1)._shouldLabelFloat(),t.Gb(n,1)._hasFloatingLabel(),t.Gb(n,1)._hideControlPlaceholder(),t.Gb(n,1)._control.disabled,t.Gb(n,1)._control.autofilled,t.Gb(n,1)._control.focused,"accent"==t.Gb(n,1).color,"warn"==t.Gb(n,1).color,t.Gb(n,1)._shouldForward("untouched"),t.Gb(n,1)._shouldForward("touched"),t.Gb(n,1)._shouldForward("pristine"),t.Gb(n,1)._shouldForward("dirty"),t.Gb(n,1)._shouldForward("valid"),t.Gb(n,1)._shouldForward("invalid"),t.Gb(n,1)._shouldForward("pending"),!t.Gb(n,1)._animationsEnabled]),e(n,11,1,[t.Gb(n,15).ngClassUntouched,t.Gb(n,15).ngClassTouched,t.Gb(n,15).ngClassPristine,t.Gb(n,15).ngClassDirty,t.Gb(n,15).ngClassValid,t.Gb(n,15).ngClassInvalid,t.Gb(n,15).ngClassPending,t.Gb(n,16).id,t.Gb(n,16).tabIndex,t.Gb(n,16)._getAriaLabel(),t.Gb(n,16)._getAriaLabelledby(),t.Gb(n,16).required.toString(),t.Gb(n,16).disabled.toString(),t.Gb(n,16).errorState,t.Gb(n,16).panelOpen?t.Gb(n,16)._optionIds:null,t.Gb(n,16).multiple,t.Gb(n,16)._ariaDescribedby||null,t.Gb(n,16)._getAriaActiveDescendant(),t.Gb(n,16).disabled,t.Gb(n,16).errorState,t.Gb(n,16).required,t.Gb(n,16).empty])}))}function N(e){return t.Qb(0,[(e()(),t.ub(0,0,[[1,0],["iframeElem",1]],null,3,"iframe",[["allow","fullscreen; accelerometer; autoplay; encrypted-media; gyroscope; "],["class","web-module-iframe"],["title","Web Module Content"]],[[8,"src",5]],[[null,"load"]],(function(e,n,l){var i=!0;return"load"===n&&(i=!1!==e.component.modifyIframeDom(t.Gb(e,0))&&i),i}),null,null)),t.Lb(512,null,g.I,g.J,[t.r,t.s,t.k,t.D]),t.tb(2,278528,null,0,g.n,[g.I],{klass:[0,"klass"],ngClass:[1,"ngClass"]},null),t.Jb(3,{iframeBlur:0})],(function(e,n){var l=e(n,3,0,n.component.iframeLoadingInProgress);e(n,2,0,"web-module-iframe",l)}),(function(e,n){e(n,0,0,n.component.iframeUrl)}))}function E(e){return t.Qb(0,[t.Mb(671088640,1,{iframeElem:0}),(e()(),t.ub(1,0,[["webModuleContainer",1]],null,58,"section",[["class","mat-app-background mat-typography web-module-container"]],null,null,null,null,null)),(e()(),t.ub(2,0,null,null,41,"nav",[["class","web-module-nav-bar mat-toolbar mat-caption"]],null,null,null,null,null)),(e()(),t.ub(3,0,null,null,4,"button",[["aria-label","List of Content"],["mat-icon-button",""]],[[1,"disabled",0],[2,"_mat-animation-noopable",null]],[[null,"click"]],(function(e,n,l){var t=!0,i=e.component;return"click"===n&&(t=0!=(i.sideListOpened=!i.sideListOpened)&&t),t}),f.d,f.b)),t.tb(4,180224,null,0,y.b,[t.k,p.h,[2,d.a]],null,null),(e()(),t.ub(5,0,null,0,2,"mat-icon",[["class","mat-icon notranslate"],["role","img"]],[[2,"mat-icon-inline",null],[2,"mat-icon-no-color",null]],null,null,S.b,S.a)),t.tb(6,9158656,null,0,w.b,[t.k,w.d,[8,null],[2,w.a]],null,null),(e()(),t.Ob(-1,0,["more_vert"])),(e()(),t.ub(8,0,null,null,5,"span",[["class","margin-right-s"]],null,null,null,null,null)),(e()(),t.ub(9,0,null,null,4,"a",[["mat-icon-button",""]],[[1,"tabindex",0],[1,"disabled",0],[1,"aria-disabled",0],[2,"_mat-animation-noopable",null]],[[null,"click"]],(function(e,n,l){var i=!0;return"click"===n&&(i=!1!==t.Gb(e,10)._haltDisabledEvents(l)&&i),i}),f.c,f.a)),t.tb(10,180224,null,0,y.a,[p.h,t.k,[2,d.a]],null,null),(e()(),t.ub(11,0,null,0,2,"ws-widget-btn-fullscreen",[],[[8,"id",0],[8,"style",2],[8,"className",0]],null,null,x.c,x.b)),t.tb(12,4440064,null,0,_.a,[],{widgetType:[0,"widgetType"],widgetSubType:[1,"widgetSubType"],widgetData:[2,"widgetData"]},null),t.Jb(13,{fsContainer:0}),(e()(),t.kb(16777216,null,null,1,null,A)),t.tb(15,16384,null,0,g.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(16,0,null,null,4,"button",[["aria-label","previous"],["mat-icon-button",""]],[[1,"disabled",0],[2,"_mat-animation-noopable",null]],[[null,"click"]],(function(e,n,l){var t=!0;return"click"===n&&(t=!1!==e.component.pageChange(-1)&&t),t}),f.d,f.b)),t.tb(17,180224,null,0,y.b,[t.k,p.h,[2,d.a]],{disabled:[0,"disabled"]},null),(e()(),t.ub(18,0,null,0,2,"mat-icon",[["class","mat-icon notranslate"],["role","img"]],[[2,"mat-icon-inline",null],[2,"mat-icon-no-color",null]],null,null,S.b,S.a)),t.tb(19,9158656,null,0,w.b,[t.k,w.d,[8,null],[2,w.a]],null,null),(e()(),t.Ob(-1,0,["arrow_left"])),(e()(),t.ub(21,0,null,null,1,"span",[],null,null,null,null,null)),(e()(),t.Ob(-1,null,["Page  "])),(e()(),t.ub(23,0,null,null,6,"input",[["aria-label","Page Number"],["class","page-input"],["name","Web Module slide"],["type","number"]],[[8,"min",0],[8,"max",0],[8,"readOnly",0],[2,"ng-untouched",null],[2,"ng-touched",null],[2,"ng-pristine",null],[2,"ng-dirty",null],[2,"ng-valid",null],[2,"ng-invalid",null],[2,"ng-pending",null]],[[null,"ngModelChange"],[null,"input"],[null,"blur"],[null,"compositionstart"],[null,"compositionend"],[null,"change"]],(function(e,n,l){var i=!0,a=e.component;return"input"===n&&(i=!1!==t.Gb(e,24)._handleInput(l.target.value)&&i),"blur"===n&&(i=!1!==t.Gb(e,24).onTouched()&&i),"compositionstart"===n&&(i=!1!==t.Gb(e,24)._compositionStart()&&i),"compositionend"===n&&(i=!1!==t.Gb(e,24)._compositionEnd(l.target.value)&&i),"change"===n&&(i=!1!==t.Gb(e,25).onChange(l.target.value)&&i),"input"===n&&(i=!1!==t.Gb(e,25).onChange(l.target.value)&&i),"blur"===n&&(i=!1!==t.Gb(e,25).onTouched()&&i),"ngModelChange"===n&&(i=!1!==a.setPage(l)&&i),i}),null,null)),t.tb(24,16384,null,0,m.d,[t.D,t.k,[2,m.a]],null,null),t.tb(25,16384,null,0,m.x,[t.D,t.k],null,null),t.Lb(1024,null,m.q,(function(e,n){return[e,n]}),[m.d,m.x]),t.tb(27,671744,null,0,m.v,[[8,null],[8,null],[8,null],[6,m.q]],{name:[0,"name"],model:[1,"model"]},{update:"ngModelChange"}),t.Lb(2048,null,m.r,null,[m.v]),t.tb(29,16384,null,0,m.s,[[4,m.r]],null,null),(e()(),t.ub(30,0,null,null,3,"span",[],null,null,null,null,null)),(e()(),t.ub(31,0,null,null,1,null,null,null,null,null,null,null)),(e()(),t.Ob(-1,null,["of"])),(e()(),t.Ob(33,null,[" "," "])),(e()(),t.ub(34,0,null,null,4,"button",[["aria-label","next"],["mat-icon-button",""]],[[1,"disabled",0],[2,"_mat-animation-noopable",null]],[[null,"click"]],(function(e,n,l){var t=!0;return"click"===n&&(t=!1!==e.component.pageChange(1)&&t),t}),f.d,f.b)),t.tb(35,180224,null,0,y.b,[t.k,p.h,[2,d.a]],{disabled:[0,"disabled"]},null),(e()(),t.ub(36,0,null,0,2,"mat-icon",[["class","mat-icon notranslate"],["role","img"]],[[2,"mat-icon-inline",null],[2,"mat-icon-no-color",null]],null,null,S.b,S.a)),t.tb(37,9158656,null,0,w.b,[t.k,w.d,[8,null],[2,w.a]],null,null),(e()(),t.Ob(-1,0,["arrow_right"])),(e()(),t.ub(39,0,null,null,1,"span",[["class","width-expand text-truncate"]],null,null,null,null,null)),(e()(),t.Ob(40,null,[" "," "])),(e()(),t.ub(41,0,null,null,2,"div",[["class","audio-container"]],[[8,"hidden",0]],null,null,null,null)),(e()(),t.kb(16777216,null,null,1,null,L)),t.tb(43,16384,null,0,g.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(44,0,null,null,15,"mat-sidenav-container",[["class","web-module-sidenav-container mat-drawer-container mat-sidenav-container"]],[[2,"mat-drawer-container-explicit-backdrop",null]],null,null,C.j,C.e)),t.tb(45,1490944,null,2,k.f,[[2,s.b],t.k,t.y,t.h,h.e,k.a,[2,d.a]],null,null),t.Mb(603979776,14,{_drawers:1}),t.Mb(603979776,15,{_content:0}),(e()(),t.ub(48,0,null,0,7,"mat-sidenav",[["class","web-module-sidenav mat-drawer mat-sidenav"],["mode","over"],["tabIndex","-1"]],[[1,"align",0],[2,"mat-drawer-end",null],[2,"mat-drawer-over",null],[2,"mat-drawer-push",null],[2,"mat-drawer-side",null],[2,"mat-drawer-opened",null],[2,"mat-sidenav-fixed",null],[4,"top","px"],[4,"bottom","px"],[40,"@transform",0]],[[null,"openedChange"],["component","@transform.start"],["component","@transform.done"]],(function(e,n,l){var i=!0,a=e.component;return"component:@transform.start"===n&&(i=!1!==t.Gb(e,49)._animationStartListener(l)&&i),"component:@transform.done"===n&&(i=!1!==t.Gb(e,49)._animationDoneListener(l)&&i),"openedChange"===n&&(i=!1!==(a.sideListOpened=l)&&i),i}),C.l,C.d)),t.tb(49,3325952,[[14,4]],0,k.e,[t.k,p.i,p.h,u.a,t.y,[2,g.d]],{mode:[0,"mode"],opened:[1,"opened"]},{openedChange:"openedChange"}),(e()(),t.ub(50,0,null,0,3,"mat-action-list",[["class","mat-list mat-list-base"]],null,null,null,M.h,M.a)),t.tb(51,704512,null,0,P.a,[t.k],null,null),(e()(),t.kb(16777216,null,0,1,null,O)),t.tb(53,278528,null,0,g.o,[t.P,t.M,t.r],{ngForOf:[0,"ngForOf"]},null),(e()(),t.kb(16777216,null,0,1,null,z)),t.tb(55,16384,null,0,g.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null),(e()(),t.ub(56,0,null,1,3,"mat-sidenav-content",[["class","mat-drawer-content mat-sidenav-content"]],[[4,"margin-left","px"],[4,"margin-right","px"]],null,null,C.k,C.f)),t.tb(57,1294336,[[15,4]],0,k.g,[t.h,k.f,t.k,h.b,t.y],null,null),(e()(),t.kb(16777216,null,0,1,null,N)),t.tb(59,16384,null,0,g.p,[t.P,t.M],{ngIf:[0,"ngIf"]},null)],(function(e,n){var l=n.component;e(n,6,0);var i=e(n,13,0,t.Gb(n,1));e(n,12,0,"actionButton","actionButtonFullscreen",i),e(n,15,0,!l.screenSizeIsXSmall),e(n,17,0,l.currentSlideNumber<2),e(n,19,0),e(n,27,0,"Web Module slide",l.currentSlideNumber),e(n,35,0,l.currentSlideNumber>=l.slides.length),e(n,37,0),e(n,43,0,l.slideAudioUrl),e(n,45,0),e(n,49,0,"over",l.sideListOpened),e(n,53,0,l.slides),e(n,55,0,l.screenSizeIsXSmall),e(n,57,0),e(n,59,0,l.iframeUrl)}),(function(e,n){var l=n.component;e(n,3,0,t.Gb(n,4).disabled||null,"NoopAnimations"===t.Gb(n,4)._animationMode),e(n,5,0,t.Gb(n,6).inline,"primary"!==t.Gb(n,6).color&&"accent"!==t.Gb(n,6).color&&"warn"!==t.Gb(n,6).color),e(n,9,0,t.Gb(n,10).disabled?-1:t.Gb(n,10).tabIndex||0,t.Gb(n,10).disabled||null,t.Gb(n,10).disabled.toString(),"NoopAnimations"===t.Gb(n,10)._animationMode),e(n,11,0,t.Gb(n,12).widgetInstanceId,t.Gb(n,12).widgetSafeStyle,t.Gb(n,12).className),e(n,16,0,t.Gb(n,17).disabled||null,"NoopAnimations"===t.Gb(n,17)._animationMode),e(n,18,0,t.Gb(n,19).inline,"primary"!==t.Gb(n,19).color&&"accent"!==t.Gb(n,19).color&&"warn"!==t.Gb(n,19).color),e(n,23,0,1,l.slides.length,l.slides.length<2,t.Gb(n,29).ngClassUntouched,t.Gb(n,29).ngClassTouched,t.Gb(n,29).ngClassPristine,t.Gb(n,29).ngClassDirty,t.Gb(n,29).ngClassValid,t.Gb(n,29).ngClassInvalid,t.Gb(n,29).ngClassPending),e(n,33,0,l.slides.length),e(n,34,0,t.Gb(n,35).disabled||null,"NoopAnimations"===t.Gb(n,35)._animationMode),e(n,36,0,t.Gb(n,37).inline,"primary"!==t.Gb(n,37).color&&"accent"!==t.Gb(n,37).color&&"warn"!==t.Gb(n,37).color),e(n,40,0,l.slides[l.currentSlideNumber-1].title),e(n,41,0,!l.slideAudioUrl),e(n,44,0,t.Gb(n,45)._backdropOverride),e(n,48,0,null,"end"===t.Gb(n,49).position,"over"===t.Gb(n,49).mode,"push"===t.Gb(n,49).mode,"side"===t.Gb(n,49).mode,t.Gb(n,49).opened,t.Gb(n,49).fixedInViewport,t.Gb(n,49).fixedInViewport?t.Gb(n,49).fixedTopGap:null,t.Gb(n,49).fixedInViewport?t.Gb(n,49).fixedBottomGap:null,t.Gb(n,49)._animationState),e(n,56,0,t.Gb(n,57)._container._contentMargins.left,t.Gb(n,57)._container._contentMargins.right)}))}}}]);