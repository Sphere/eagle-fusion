import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, EventService, LoggerService, NsPage, ValueService, WsEvents } from '@ws-widget/utils'
import { fromEvent, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { SubapplicationRespondService } from '../../../../utils/src/lib/services/subapplication-respond.service'
import { CustomTourService } from '../_common/tour-guide/tour-guide.service'

@Component({
  selector: 'ws-widget-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent extends WidgetBaseComponent
  implements OnInit, AfterViewInit, OnDestroy, NsWidgetResolver.IWidgetData<NsPage.IPage | null> {
  @Input() widgetData: NsPage.IPage | null = null
  pageData: NsPage.IPage | null = null
  oldData: NsPage.IPage | null = null
  private responseSubscription: Subscription | null = null
  alreadyRaised = false
  error: any
  isXSmall = false
  navbarIcon?: SafeUrl
  isTourGuideAvailable = false
  isHlpMenuXs = false
  navBackground: Partial<NsPage.INavBackground> | null = null
  links: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []
  constructor(
    private activateRoute: ActivatedRoute,
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private eventSvc: EventService,
    private tour: CustomTourService,
    private domSanitizer: DomSanitizer,
    private respondSvc: SubapplicationRespondService,
  ) {
    super()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
      this.links = this.getNavLinks()

    })
  }
  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      if (this.configSvc.instanceConfig.logos.navbarLogo) {
        this.navbarIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.navbarLogo,
        )
      }
      if (this.configSvc.restrictedFeatures) {
        this.isHlpMenuXs = this.configSvc.restrictedFeatures.has('helpMenuXs')
      }
    }
    this.configSvc.tourGuideNotifier.subscribe(canShow => {
      if (
        this.configSvc.restrictedFeatures &&
        !this.configSvc.restrictedFeatures.has('tourGuide')
      ) {
        this.isTourGuideAvailable = canShow
        // this.createTour()
      }
    })
    this.activateRoute.data.subscribe(routeData => {

      if (this.alreadyRaised && this.oldData) {
        this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded)
      }
      if (routeData.pageData && routeData.pageData.data) {
        this.error = null
        this.pageData = routeData.pageData.data
        if (this.pageData && this.pageData.navigationBar) {
          this.navBackground = this.pageData.navigationBar.background || this.configSvc.pageNavBar
          this.links = this.isXSmall ? this.getNavLinks() : this.getNavLinks().filter(data =>
            data.widgetData.actionBtnId !== 'channel_how_to')
        }
      } else if (this.widgetData) {
        this.pageData = this.widgetData
        if (this.pageData && this.pageData.navigationBar) {
          this.navBackground = this.pageData.navigationBar.background || this.configSvc.pageNavBar
          this.links = this.isXSmall ? this.getNavLinks() : this.getNavLinks().filter(data =>
            data.widgetData.actionBtnId !== 'channel_how_to')
        }
      } else {
        this.pageData = null
        this.error = routeData.pageData.error
        this.logger.warn('No page data available')
      }
      if (this.pageData) {
        this.oldData = this.pageData
        this.alreadyRaised = true
        this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded)
        this.responseSubscription = fromEvent<MessageEvent>(window, 'message')
          .pipe(
            filter(
              (event: MessageEvent) =>
                Boolean(event) &&
                Boolean(event.data) &&
                Boolean(event.source && typeof event.source.postMessage === 'function'),
            ),
          )
          .subscribe(async (event: MessageEvent) => {
            const contentWindow = event.source as Window
            if (event.data.requestId) {
              switch (event.data.requestId) {
                case 'LOADED':
                  this.respondSvc.loadedRespond(contentWindow, event.data.subApplicationName)
                  break
                default:
                  break
              }
            }
          })
      }

    })
  }

  ngAfterViewInit() {
    const hash: any = window.location.hash ? window.location.hash.split('#')[1] : ''
    if (hash && isNaN(hash)) {
      setTimeout(
        () => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView()
          }
        },
        1000,
      )
    }
    if (this.pageData && this.pageData.tourGuide) {
      this.configSvc.tourGuideNotifier.next(true)
      this.tour.data = this.pageData.tourGuide
    }
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType) {
    const path = window.location.pathname.replace('/', '')
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'channel-page',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Page,
        mode: WsEvents.WsTimeSpentMode.View,
        pageId: path,
      },
    }
    this.eventSvc.dispatchEvent(event)

  }
  getNavLinks(): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] {
    if (this.pageData && this.pageData.navigationBar && Array.isArray(this.pageData.navigationBar.links)) {
      if (this.isXSmall) {
        return this.pageData.navigationBar.links.map(link => ({
          ...link,
          widgetData: {
            ...link.widgetData,
            config: {
              ...link.widgetData.config,
              type: 'mat-menu-item',
            },
          },
        }))
      }
      return this.pageData.navigationBar.links
    }
    return []
  }
  ngOnDestroy() {
    if (this.pageData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded)
    }
    this.configSvc.tourGuideNotifier.next(false)
  }
  startTour() {
    this.tour.startTour()
    if (this.responseSubscription) {
      this.respondSvc.unsubscribeResponse()
      this.responseSubscription.unsubscribe()
    }
  }

}
