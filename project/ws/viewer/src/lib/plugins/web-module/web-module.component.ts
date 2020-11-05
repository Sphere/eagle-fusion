import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core'
import { Subscription, fromEvent } from 'rxjs'
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { WidgetContentService, NsContent } from '@ws-widget/collection'
import { ViewerUtilService } from '../../viewer-util.service'
import { EventService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'viewer-plugin-web-module',
  templateUrl: './web-module.component.html',
  styleUrls: ['./web-module.component.scss'],
})
export class WebModuleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() collectionId = ''
  @Input() widgetData: any
  @Input() webModuleManifest: any
  @Input() theme = { className: '' }
  private screenSizeSubscription: Subscription | null = null
  oldIdentifier = ''
  sideListOpened = false
  screenSizeIsXSmall = false
  currentFontSize!: string
  defaultFontSize = 14
  fontSizes = [10, 12, 14, 16, 18, 20, 22]
  currentSlideNumber = 0
  maxLastPageNumber = 0
  urlPrefix = ''
  slides: {
    title: string
    URL: string
    audio?: {
      URL: string
      title: string
      label: string
      srclang: string
    }[]
    safeUrl?: SafeResourceUrl
  }[] = []
  iframeUrl: SafeResourceUrl = ''
  iframeLoadingInProgress = true
  isCompleted = false
  slideAudioUrl: SafeUrl = ''
  @ViewChild('iframeElem', { static: false }) iframeElem: ElementRef<HTMLIFrameElement>
  current: string[] = []
  counter = false
  isScrolled = false
  firstScroll = true
  scrollTimeInterval: any

  constructor(
    private events: EventService,
    private domSanitizer: DomSanitizer,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private configurationSvc: ConfigurationsService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.iframeElem = {} as ElementRef
  }
  ngOnInit() {
    this.screenSizeSubscription = this.valueSvc.isXSmall$.subscribe(data => {
      this.screenSizeIsXSmall = data
    })
    if (this.configurationSvc.activeFontObject && this.configurationSvc.activeFontObject.baseFontSize) {
      this.currentFontSize = this.configurationSvc.activeFontObject.baseFontSize
      this.defaultFontSize = +this.currentFontSize.slice(0, - 2)

    }
    this.loadWebModule()
    this.configurationSvc.prefChangeNotifier.subscribe(() => {
      this.setTheme()
    })
  }

  ngOnChanges(change: SimpleChanges) {
    for (const prop in change) {
      if (prop === 'widgetData') {
        if (this.widgetData.identifier !== this.oldIdentifier) {
          if (this.current.length > 0) {
            this.saveContinueLearning(this.oldIdentifier)
            this.fireRealTimeProgress(this.oldIdentifier)
          }
        }
      }
    }
    this.current = []
    this.currentSlideNumber = 0
    this.maxLastPageNumber = 0
    this.urlPrefix = this.widgetData.artifactUrl.substring(0, this.widgetData.artifactUrl.lastIndexOf('/'))
    this.oldIdentifier = this.widgetData.identifier
    this.loadWebModule()
  }

  ngOnDestroy() {
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    this.saveContinueLearning(this.widgetData.identifier)
    this.fireRealTimeProgress(this.widgetData.identifier)
  }

  saveContinueLearning(id: string) {
    if (this.widgetData.mimeType === (NsContent.EMimeTypes.WEB_MODULE || NsContent.EMimeTypes.WEB_MODULE_EXERCISE)) {
      if (this.activatedRoute.snapshot.queryParams.collectionType &&
        this.activatedRoute.snapshot.queryParams.collectionType.toLowerCase() === 'playlist') {
        const reqBody = {
          contextPathId: this.collectionId ? this.collectionId : id,
          resourceId: id,
          dateAccessed: Date.now(),
          contextType: 'playlist',
          data: JSON.stringify({
            progress: this.currentSlideNumber,
            timestamp: Date.now(),
            contextFullPath: [this.activatedRoute.snapshot.queryParams.collectionId, id],
          }),
        }
        this.contentSvc.saveContinueLearning(reqBody).toPromise().catch()
      } else {
        const reqBody = {
          contextPathId: this.collectionId ? this.collectionId : id,
          resourceId: id,
          dateAccessed: Date.now(),
          data: JSON.stringify({
            progress: this.currentSlideNumber,
            timestamp: Date.now(),
          }),
        }
        this.contentSvc.saveContinueLearning(reqBody).toPromise().catch()
      }
    }
  }
  fireRealTimeProgress(id: string) {
    if (this.widgetData.mimeType === (NsContent.EMimeTypes.WEB_MODULE || NsContent.EMimeTypes.WEB_MODULE_EXERCISE)) {
      if (this.current.length > 0 && this.slides.length > 0) {
        const realTimeProgressRequest = {
          content_type: 'Resource',
          mime_type: this.widgetData.mimeType,
          user_id_type: 'uuid',
          current: this.current,
          max_size: this.slides.length,
        }
        this.viewerSvc.realTimeProgressUpdate(id, realTimeProgressRequest)
      }
    }
  }

  loadWebModule() {
    if (this.webModuleManifest.resources) {
      this.slides = this.webModuleManifest.resources.map((u: { artifactUrl: string }) => ({
        ...u,
        safeUrl: this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlPrefix + u.artifactUrl),
      }))
    } else {
      this.slides = this.webModuleManifest.map((u: { URL: string }) => ({
        ...u,
        safeUrl: this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlPrefix + u.URL),
      }))
    }
    // this.slides = this.webModuleManifest.map(u => ({
    //   ...u,
    //   safeUrl: this.domSanitizer.bypassSecurityTrustResourceUrl(
    //     `/apis/protected/v8/content/getWebModuleFiles?url=${encodeURIComponent(this.urlPrefix + u.URL)}`
    //   )
    // }));
    this.setPage(this.widgetData.resumePage ? this.widgetData.resumePage : 1)
  }

  setPage(pageNumber: number) {
    if (!this.current.includes(pageNumber.toString())) {
      this.current.push(pageNumber.toString())
    }
    if (this.iframeUrl && pageNumber === this.currentSlideNumber) {
      return
    }
    if (pageNumber >= 1 && pageNumber <= this.slides.length) {
      this.currentSlideNumber = pageNumber
      this.iframeUrl = this.slides[this.currentSlideNumber - 1].safeUrl as SafeResourceUrl
      if (this.slides[this.currentSlideNumber - 1].audio) {
        this.setAudio(this.slides[this.currentSlideNumber - 1].audio as any)
      }
      this.iframeLoadingInProgress = true
    } else if (this.iframeUrl === null) {
      this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.urlPrefix + this.slides[0].URL,
      )
      if (this.slides[this.currentSlideNumber - 1].audio) {
        this.setAudio(this.slides[0].audio as any)
      }
      this.iframeLoadingInProgress = true
    }
    if (this.currentSlideNumber === this.slides.length) {
      this.isCompleted = true
    }

    this.setAudio(this.slides[this.currentSlideNumber - 1].audio as any)
    if (this.currentSlideNumber > this.maxLastPageNumber) {
      this.maxLastPageNumber = this.currentSlideNumber
    }

    return this.currentSlideNumber
  }

  setAudio(audios: { URL: string }[]) {
    if (Array.isArray(audios) && audios.length && audios[0].URL) {
      this.slideAudioUrl = this.domSanitizer.bypassSecurityTrustUrl(this.urlPrefix + audios[0].URL)
    } else {
      this.slideAudioUrl = (null as unknown) as SafeResourceUrl
    }
  }

  pageChange(increment: number) {
    this.raiseTelemetry('pageChange', 'click')
    if (increment === 1 && this.currentSlideNumber < this.slides.length) {
      this.setPage(this.currentSlideNumber + 1)
    } else if (increment === -1 && this.currentSlideNumber > 1) {
      this.setPage(this.currentSlideNumber - 1)
    }
  }
  raiseTelemetry(action: string, event: string) {
    if (this.widgetData.identifier) {
      this.events.raiseInteractTelemetry(action, event, {
        contentId: this.widgetData.identifier,
      })
    }
    if (event === 'scroll') {
      this.isScrolled = false
    }
  }

  raiseScrollTelemetry() {
    this.scrollTimeInterval = setInterval(
      () => {
        if (this.isScrolled) {
          this.raiseTelemetry('pageScroll', 'scroll')
        }
      },
      2 * 60000,
    )
  }

  async modifyIframeDom(iframe: HTMLIFrameElement) {
    let iframeDocument
    let docFrag
    let fontRoboto
    let prettyCSSSkin
    let prettyJS
    let webModuleCSS
    let normalizeCSS
    let stylePart
    let executeJS
    if (!iframe.contentWindow) {
      return
    }

    iframeDocument = iframe.contentWindow.document
    if (!iframeDocument) {
      return
    }
    fromEvent(iframeDocument, 'scroll')
      .subscribe(() => {
        this.isScrolled = true
        if (this.isScrolled && this.firstScroll) {
          this.raiseTelemetry('pageScroll', 'scroll')
          this.raiseScrollTelemetry()
        }
        this.firstScroll = false
      })

    docFrag = iframeDocument.createDocumentFragment()
    fontRoboto = iframeDocument.createElement('link')
    prettyCSSSkin = iframeDocument.createElement('link')
    prettyJS = iframeDocument.createElement('script')
    webModuleCSS = iframeDocument.createElement('link')
    normalizeCSS = iframeDocument.createElement('link')
    stylePart = iframeDocument.createElement('style')
    executeJS = iframeDocument.createElement('script')

    fontRoboto.setAttribute('href', 'https://fonts.googleapis.com/css?family=Roboto:300,400,500')
    fontRoboto.setAttribute('rel', 'stylesheet')

    prettyCSSSkin.setAttribute('href', '/assets/common/lib/google-code-prettify/skins/sunburst.css')
    prettyCSSSkin.setAttribute('rel', 'stylesheet')

    if (prettyJS) {
      prettyJS.type = 'text/javascript'
      prettyJS.setAttribute('src', '/assets/common/lib/google-code-prettify/prettify.js')
    }
    if (webModuleCSS) {
      webModuleCSS.setAttribute('href', '/assets/common/plugins/web-module/web-module.css')
      webModuleCSS.setAttribute('rel', 'stylesheet')
    }
    if (normalizeCSS) {
      normalizeCSS.setAttribute('href', '/assets/common/lib/normalize.min.css')
      normalizeCSS.setAttribute('rel', 'stylesheet')
    }
    docFrag = iframeDocument.createDocumentFragment()
    fontRoboto = iframeDocument.createElement('link')
    fontRoboto.setAttribute('href', 'https://fonts.googleapis.com/css?family=Roboto:300,400,500')
    fontRoboto.setAttribute('rel', 'stylesheet')

    prettyCSSSkin = iframeDocument.createElement('link')
    prettyCSSSkin.setAttribute('href', '/assets/common/lib/google-code-prettify/skins/sunburst.css')
    prettyCSSSkin.setAttribute('rel', 'stylesheet')

    prettyJS = iframeDocument.createElement('script')
    prettyJS.type = 'text/javascript'
    prettyJS.setAttribute('src', '/assets/common/lib/google-code-prettify/prettify.js')

    webModuleCSS = iframeDocument.createElement('link')
    webModuleCSS.setAttribute('href', '/assets/common/plugins/web-module/web-module.css')
    webModuleCSS.setAttribute('rel', 'stylesheet')

    normalizeCSS = iframeDocument.createElement('link')
    normalizeCSS.setAttribute('href', '/assets/common/lib/normalize.min.css')
    normalizeCSS.setAttribute('rel', 'stylesheet')

    stylePart = iframeDocument.createElement('style')
    stylePart.innerHTML = `
          .transparent-button {
            background: transparent;
            border: none;
            cursor: pointer;
          }
          .transparent-button:focus {
            outline: none;
          }
          .button-of-material {
          background-color: #3f51b5;
          color: #fff !important;
          box-sizing: border-box;
          position: relative;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          cursor: pointer;
          outline: 0;
          border: none;
          -webkit-tap-highlight-color: transparent;
          display: inline-block;
          white-space: nowrap;
          text-decoration: none;
          vertical-align: baseline;
          text-align: center;
          margin: 0;
          line-height: 32px;
          padding: 0 8px;
          border-radius: 4px;
          overflow: visible;
          transform: translate3d(0, 0, 0);
          transition: background .4s cubic-bezier(.25, .8, .25, 1), box-shadow 280ms cubic-bezier(.4, 0, .2, 1);
          font-family: Roboto, "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 300;
      }

      .disabled-button {
          color: black !important;
          background-color: white;
      }

      .ripple {
          background-position: center;
          transition: background 0.8s;
      }

      .ripple:hover {
          background: #2f41a5 radial-gradient(circle, transparent 1%, #2f41a5 1%) center/15000%;
      }

      .ripple:active {
          background-color: #5f7fdf;
          background-size: 100%;
          transition: background 0s;
      }`

    executeJS = iframeDocument.createElement('script')
    const theme = this.theme
    executeJS.type = 'text/javascript'
    executeJS.innerHTML = `
          document.body.classList.add('app-background', '${theme.className}', 'custom-scroll-small');
          for(var i=0; i < document.querySelectorAll("[style]").length; i++ ) {
            document.querySelectorAll("[style]")[i].setAttribute('style', null);
          }
          for(var i=0; i < document.querySelectorAll("pre").length; i++ ) {
            document.querySelectorAll("pre")[i].classList.add('prettyprint');
            document.querySelectorAll("pre")[i].setAttribute("id", "codepane"+i);
            document.querySelectorAll("pre")[i].classList.add('prettyprint');
            var btn = document.createElement("BUTTON");
            btn.innerHTML = "<img src='/assets/common/plugins/web-module/copyButtonImage.svg'/>";
            var newParam = "codepane"+i;
            var nParam = "copyButton"+i;
            btn.setAttribute("id", nParam);
            btn.setAttribute("class", "transparent-button")
            btn.style.float = "right";
            btn.style.color = "white";
            btn.setAttribute("onclick", "copyToClipBoardFunction("+newParam+","+nParam+")");
            document.querySelectorAll("pre")[i].appendChild(btn)
          }
          for(var i=0; i < document.querySelectorAll(".prettyprint").length; i++ ) {
            document.querySelectorAll(".prettyprint")[i].classList.add('linenums:1');
          }
          function copyToClipBoardFunction(param, nParam) {
            nParam.innerText = "Copied!";
            nParam.setAttribute("class","button-of-material disabled-button");
            const id = 'mycustom-clipboard-textarea-hidden-id';
            let existsTextarea = document.getElementById(id);
            if (!existsTextarea) {
              const textarea = document.createElement('textarea');
              textarea.id = id;
              // Place in top-left corner of screen regardless of scroll position.
              textarea.style.position = 'fixed';
              textarea.style.top = '0px';
              textarea.style.left = '0px';
              // Ensure it has a small width and height. Setting to 1px / 1em
              // doesn't work as this gives a negative w/h on some browsers.
              textarea.style.width = '1px';
              textarea.style.height = '1px';
              // We don't need padding, reducing the size if it does flash render.
              textarea.style.padding = '0px';
              // Clean up any borders.
              textarea.style.border = 'none';
              textarea.style.outline = 'none';
              textarea.style.boxShadow = 'none';
              // Avoid flash of white box if rendered for any reason.
              textarea.style.background = 'transparent';
              document.querySelector('body').appendChild(textarea);
              existsTextarea = document.getElementById(id);
            } else {
            }
            existsTextarea.value = param.innerText.slice(0,param.innerText.length-7);
            existsTextarea.select();
            try {
              const status = document.execCommand('copy');
              if (!status) {
                logger.error('Cannot copy text');
              } else {
                const tooltip = document.getElementById('myTooltip');
                tooltip.innerHTML = 'Code Copied!';
              }
            } catch (err) {
            }
            setTimeout(
              function() {
                nParam.innerHTML = "<img src='/assets/common/plugins/web-module/copyButtonImage.svg'/>";
                nParam.setAttribute("class","transparent-button");
              }, 1000);
          }
          setTimeout(function() {
            try {
              PR.prettyPrint();
            } catch (e) {
              setTimeout(function() {
                PR.prettyPrint();
              }, 1000);
            }
          }, 500);
        `
    docFrag.appendChild(normalizeCSS as any)
    docFrag.appendChild(fontRoboto as any)
    docFrag.appendChild(webModuleCSS as any)
    docFrag.appendChild(prettyCSSSkin as any)
    docFrag.appendChild(prettyJS as any)
    docFrag.appendChild(executeJS as any)
    docFrag.appendChild(stylePart as any)
    iframeDocument.head.appendChild(docFrag as any)
    setTimeout(
      () => {
        this.iframeLoadingInProgress = false
        this.setTheme()
      },
      1000,
    )
  }

  setTheme() {
    const color = this.getColor('color')
    const backgroundColor = this.getColor('backgroundColor')
    if (this.currentFontSize) {
      this.modifyIframeStyle('fontSize', this.currentFontSize)
    }
    this.modifyIframeStyle('backgroundColor', backgroundColor)
    this.modifyIframeStyle('color', color)

  }

  modifyIframeStyle(styleProp: string, styleValue: any) {
    let doc: Document | null = null
    const iframeElem = this.iframeElem
    if (iframeElem) {
      doc = (iframeElem.nativeElement.contentWindow as Window).document
    }
    if (doc) {
      doc.body.style[styleProp as any] = styleValue
    }
    if (styleProp === 'fontSize') {
      this.currentFontSize = styleValue
    }
  }

  getColor(type: string): string {
    const color = (getComputedStyle(document.body as any)[type as any] as any)
      .replace('rgba', '')
      .replace('rgb', '')
      .replace('(', '')
      .replace(')', '')
      .split(',')
    return (
      // tslint:disable-next-line: prefer-template
      '#' +
      ('0' + parseInt(color[0], 10).toString(16)).slice(-2) +
      ('0' + parseInt(color[1], 10).toString(16)).slice(-2) +
      ('0' + parseInt(color[2], 10).toString(16)).slice(-2)
    )
  }

}
