import { ExploreResolverService } from './../../../../resolver/src/lib/explore-resolver.service'
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { DomSanitizer, Meta, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import {
  ConfigurationsService, EventService, LoggerService, NsPage,
  WsEvents, LogoutComponent, ValueService,
} from '@ws-widget/utils'
import { fromEvent, Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
import { SubapplicationRespondService } from '../../../../utils/src/lib/services/subapplication-respond.service'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'

@Component({
  standalone: false,
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
  authenticated = true  // Default to true for logged-in users

  // Error type tracking
  isNetworkError = false
  isServerError = false
  isForbiddenError = false
  isClientError = false
  constructor(
    private activateRoute: ActivatedRoute,
    private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private eventSvc: EventService,
    private domSanitizer: DomSanitizer,
    private respondSvc: SubapplicationRespondService,
    private dialog: MatDialog,
    private exploreResolverSvc: ExploreResolverService,
    public router: Router,
    private meta: Meta
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }
  ngOnInit() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' })

    // Set authenticated based on user profile existence
    this.authenticated = !!(this.configSvc.userProfile)

    if (!this.authenticated && !this.exploreResolverSvc.isInitialized) {
      this.logger.info('Not Authenticated')
    }
    if (!this.exploreResolverSvc.isInitialized) {
      this.exploreResolverSvc.initialize()
    }

    if (this.configSvc.instanceConfig) {
      if (this.configSvc.instanceConfig.logos.app) {
        this.navbarIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.app,
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

        // Determine error type for better user messaging
        if (routeData.pageData.error && typeof routeData.pageData.error === 'object') {
          const err = routeData.pageData.error
          this.isNetworkError = err.type === 'NetworkError' || err.status === 0
          this.isServerError = err.type === 'ServerError' || (err.status >= 500 && err.status < 600)
          this.isForbiddenError = err.type === 'Forbidden' || err.status === 403
          this.isClientError = err.type === 'ClientError' || (err.status >= 400 && err.status < 500)

          // Log error details for debugging
          this.logger.error('Page resolver error:', {
            type: err.type,
            status: err.status,
            message: err.message,
            url: window.location.href,
          })
        } else {
          // Legacy error handling (string or simple error)
          this.isNetworkError = routeData.pageData.error !== 'NoContent'
        }

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

  logout() {
    this.dialog.open<LogoutComponent, MatDialogConfig>(LogoutComponent, {
      panelClass: 'logout-dialog-container',
    })
  }

  reloadPage() {
    // Clear error state first
    this.error = null
    this.isNetworkError = false
    this.isServerError = false
    this.isForbiddenError = false
    this.isClientError = false

    // Reload the current page
    window.location.reload()
  }

  ngOnDestroy() {
    if (this.pageData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded)
    }
    this.configSvc.tourGuideNotifier.next(false)
    if (this.responseSubscription) {
      this.responseSubscription.unsubscribe()
    }
  }
  startTour() {
    if (this.responseSubscription) {
      this.respondSvc.unsubscribeResponse()
      this.responseSubscription.unsubscribe()
    }
  }

}
