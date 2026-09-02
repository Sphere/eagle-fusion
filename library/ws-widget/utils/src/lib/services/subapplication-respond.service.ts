import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { WidgetContentService } from '../../../../collection/src/lib/_services/widget-content.service'
import { ConfigurationsService } from './configurations.service'
import { WsEvents } from './event.model'
import { EventService } from './event.service'
import { TelemetryService } from './telemetry.service'
@Injectable({
  providedIn: 'root',
})
export class SubapplicationRespondService {
  subAppname = ''
  continueLearningData: any = null
  contentWindowinfo: any
  loaded = false
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly contentSvc: WidgetContentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly eventSvc: EventService,
    private readonly teleSvc: TelemetryService,
  ) {
    this.changeContextrespond()
    queueMicrotask(() => {
      this.configSvc.prefChangeNotifier.subscribe(() => {
        this.changeContextrespond()
      })
    })
  }
  loadedRespond(contentWindow: any, applicationName: string, id?: string) {
    const isResumeMode = Boolean(id && this.activatedRoute.snapshot.queryParams.viewMode
      && this.activatedRoute.snapshot.queryParams.viewMode === 'RESUME')
    if (isResumeMode) {
      this.continueLearningData = null
      this.contentSvc.fetchContentHistory(id as string).subscribe(
        data => {
          this.continueLearningData = data.continueData
          const continueLearningPayload = this.continueLearningData.data ? {
            continueLearning: this.continueLearningData.data,
          } : null
          this.sendLoadedResponse(contentWindow, applicationName, continueLearningPayload)
        })
    } else {
      this.sendLoadedResponse(contentWindow, applicationName, null)
    }
  }

  private sendLoadedResponse(contentWindow: any, applicationName: string, data: any) {
    if (!this.configSvc || !this.configSvc.userProfile) {
      return
    }
    const response = {
      subApplicationName: applicationName,
      requestId: 'LOADED',
      parentContext: this.buildParentContext(),
      data,
    }
    const targetOrigin = this.getTargetOrigin(contentWindow)
    contentWindow.postMessage(response, targetOrigin)
    this.contentWindowinfo = contentWindow
    this.loaded = true
    this.subAppname = applicationName
  }

  private getUserInfo() {
    const userName = this.configSvc.userProfile.userName
    const firstName = userName ? userName.split(' ', 2)[0] : ''
    const lastName = userName ? userName.split(' ', 2)[1] : ''
    return {
      firstName,
      lastName,
      userId: this.configSvc.userProfile.userId ? this.configSvc.userProfile.userId : '',
      roles: this.configSvc.userRoles ? Array.from(this.configSvc.userRoles) : [],
    }
  }

  private buildParentContext() {
    const viewMode: string = this.activatedRoute.snapshot.queryParams.viewMode ?
      this.activatedRoute.snapshot.queryParams.viewMode : ''
    return {
      domainName: window.location.host,
      url: this.router.url,
      rootOrg: this.configSvc.rootOrg,
      theme: this.configSvc.activeThemeObject ? {
        name: this.configSvc.activeThemeObject.themeName,
        ...this.configSvc.activeThemeObject.color,
      } : '',
      fontSize: this.configSvc.activeFontObject ? this.configSvc.activeFontObject.baseFontSize : '14px',
      locale: (this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale) || 'en',
      darkMode: this.configSvc.isDarkMode,
      subApplicationStartMode: viewMode.toUpperCase(),
      user: this.getUserInfo(),
      heartbeatFrequency: '200',
    }
  }

  private getTargetOrigin(win: Window): string | null {
    try {
      return win.location.origin
    } catch {
      return null
    }
  }
  telemetryEvents(tData: any) {
    if (tData) {
      switch (tData.eventId) {
        case 'INTERACT':
          this.eventSvc.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
            eventType: WsEvents.WsEventType.Telemetry,
            eventLogLevel: WsEvents.WsEventLogLevel.Warn,
            data: {
              ...tData.data,
              eventSubType: WsEvents.EnumTelemetrySubType.Interact,
            },
            from: tData.subApplicationName,
            to: 'Telemetry',
          })
          break
        case 'HEARTBEAT':
          this.eventSvc.dispatchEvent<WsEvents.IWsEventTelemetryHeartBeat>({
            eventType: WsEvents.WsEventType.Telemetry,
            eventLogLevel: WsEvents.WsEventLogLevel.Trace,
            data: {
              ...tData.data,
              eventSubType: WsEvents.EnumTelemetrySubType.HeartBeat,
            },
            from: tData.subApplicationName,
            to: 'Telemetry',
          })
          break
        case 'IMPRESSION':
          this.teleSvc.externalImpression(tData.data)
          break
        default:
          break
      }
    }
  }
  unsubscribeResponse() {
    this.subAppname = ''
    this.continueLearningData = null
    this.contentWindowinfo = null
    this.loaded = false
  }
  changeContextrespond() {
    if (!(this.loaded && this.contentWindowinfo && this.configSvc && this.configSvc.userProfile && this.subAppname)) {
      return
    }
    const response = {
      subApplicationName: this.subAppname,
      requestId: 'CONTEXT_CHANGE',
      parentContext: this.buildParentContext(),
    }
    const targetOrigin = this.getTargetOrigin(this.contentWindowinfo)
    this.contentWindowinfo.postMessage(response, targetOrigin)
  }
}
