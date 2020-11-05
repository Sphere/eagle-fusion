import { Injectable } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { filter } from 'rxjs/operators'
import { AuthKeycloakService } from './auth-keycloak.service'
import { NsInstanceConfig } from './configurations.model'
import { ConfigurationsService } from './configurations.service'
import { WsEvents } from './event.model'
import { EventService } from './event.service'
import { LoggerService } from './logger.service'

declare var $t: any

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  previousUrl: string | null = null
  telemetryConfig: NsInstanceConfig.ITelemetryConfig | null = null
  pData: any = null
  externalApps: any = {
    RBCP: 'rbcp-web-ui',
  }
  constructor(
    private configSvc: ConfigurationsService,
    private eventsSvc: EventService,
    private authSvc: AuthKeycloakService,
    private logger: LoggerService,
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.telemetryConfig = instanceConfig.telemetryConfig
      this.telemetryConfig = {
        ...this.telemetryConfig,
        pdata: {
          ...this.telemetryConfig.pdata,
          pid: navigator.userAgent,
        },
        uid: this.configSvc.userProfile && this.configSvc.userProfile.userId,
        authtoken: this.authSvc.token,
      }
      this.pData = this.telemetryConfig.pdata
      this.addPlayerListener()
      this.addInteractListener()
      this.addTimeSpentListener()
      this.addSearchListener()
      this.addHearbeatListener()
    }
  }

  start(type: string, mode: string, id: string) {
    if (this.telemetryConfig) {
      $t.start(this.telemetryConfig, id, '1.0', {
        id,
        type,
        mode,
        stageid: '',
      })
    } else {
      this.logger.error('Error Initializing Telemetry. Config missing.')
    }
  }

  end(type: string, mode: string, id: string) {
    $t.end(
      {
        type,
        mode,
        contentId: id,
      },
      {
        context: {
          pdata: {
            ...this.pData,
            id: this.pData.id,
          },
        },
      },
    )
  }

  audit(type: string, props: string, data: any) {
    $t.audit(
      {
        type,
        props,
        data,
      },
      {
        context: {
          pdata: {
            ...this.pData,
            id: this.pData.id,
          },
        },
      },
    )
  }

  heartbeat(type: string, mode: string, id: string) {
    $t.heartbeat({
      id,
      mode,
      type,
    })
  }

  impression() {
    const page = this.getPageDetails()
    if (page.objectId) {
      const config = {
        context: {
          pdata: {
            ...this.pData,
            id: this.pData.id,
          },
        },
        object: {
          id: page.objectId,
        },
      }
      $t.impression(page, config)
    } else {
      $t.impression(page, {
        context: {
          pdata: {
            ...this.pData,
            id: this.pData.id,
          },
        },
      })
    }
    this.previousUrl = page.pageUrl
  }

  externalImpression(impressionData: any) {
    const page = this.getPageDetails()
    if (this.externalApps[impressionData.subApplicationName]) {
      const externalConfig = page.objectId ? {
        context: {
              pdata: {
                ...this.pData,
            id: this.externalApps[impressionData.subApplicationName],
              },
            },
        object: {
          id: page.objectId,
        },
      } : {
          context: {
              pdata: {
              ...this.pData,
              id: this.externalApps[impressionData.subApplicationName],
              },
            },
        }
      $t.impression(impressionData.data, externalConfig)
    }
  }

  addTimeSpentListener() {
    this.eventsSvc.events$
      .pipe(
        filter(
          event =>
            event &&
            event.eventType === WsEvents.WsEventType.Telemetry &&
            event.data.type === WsEvents.WsTimeSpentType.Page &&
            event.data.mode &&
            event.data,
        ),
      )
      .subscribe(event => {
        if (event.data.state === WsEvents.EnumTelemetrySubType.Loaded) {
          this.start(
            event.data.type || WsEvents.WsTimeSpentType.Page,
            event.data.mode || WsEvents.WsTimeSpentMode.View,
            event.data.pageId,
          )
        }
        if (event.data.state === WsEvents.EnumTelemetrySubType.Unloaded) {
          this.end(
            event.data.type || WsEvents.WsTimeSpentType.Page,
            event.data.mode || WsEvents.WsTimeSpentMode.View,
            event.data.pageId,
          )
        }
      })
  }
  addPlayerListener() {
    this.eventsSvc.events$
      .pipe(
        filter(
          event =>
            event &&
            event.eventType === WsEvents.WsEventType.Telemetry &&
            event.data.type === WsEvents.WsTimeSpentType.Player &&
            event.data.mode &&
            event.data,
        ),
      )
      .subscribe(event => {
        const content: NsContent.IContent | null = event.data.content
        if (
          event.data.state === WsEvents.EnumTelemetrySubType.Loaded &&
          (!content ||
            content.isIframeSupported.toLowerCase() === 'maybe' ||
            content.isIframeSupported.toLowerCase() === 'yes')
        ) {
          this.start(
            event.data.type || WsEvents.WsTimeSpentType.Player,
            event.data.mode || WsEvents.WsTimeSpentMode.Play,
            event.data.identifier,
          )
        }
        if (
          event.data.state === WsEvents.EnumTelemetrySubType.Unloaded &&
          (!content ||
            content.isIframeSupported.toLowerCase() === 'maybe' ||
            content.isIframeSupported.toLowerCase() === 'yes')
        ) {
          this.end(
            event.data.type || WsEvents.WsTimeSpentType.Player,
            event.data.mode || WsEvents.WsTimeSpentMode.Play,
            event.data.identifier,
          )
        }
      })
  }

  addInteractListener() {
    this.eventsSvc.events$
      .pipe(
        filter(
          (event: WsEvents.WsEventTelemetryInteract) =>
            event &&
            event.data &&
            event.eventType === WsEvents.WsEventType.Telemetry &&
            event.data.eventSubType === WsEvents.EnumTelemetrySubType.Interact,
        ),
      )
      .subscribe(event => {
        const page = this.getPageDetails()
        if (typeof event.from === 'string' && this.externalApps[event.from]) {
          const externalConfig = {
            context: {
              pdata: {
                ...this.pData,
                id: this.externalApps[event.from],
              },
            },
          }
          $t.interact(event.data, externalConfig)
        } else {
          $t.interact(
            {
              type: event.data.type,
              subtype: event.data.subType,
              object: event.data.object,
              pageid: page.pageid,
              target: { page },
            },
            {
              context: {
              pdata: {
                ...this.pData,
                id: this.pData.id,
              },
            },
            })
        }
      })
  }
  addHearbeatListener() {
    this.eventsSvc.events$
      .pipe(
        filter(
          (event: WsEvents.WsEventTelemetryHeartBeat) =>
            event &&
            event.data &&
            event.eventType === WsEvents.WsEventType.Telemetry &&
            event.data.eventSubType === WsEvents.EnumTelemetrySubType.HeartBeat,
        ),
      )
      .subscribe(event => {
        if (typeof event.from === 'string' && this.externalApps[event.from]) {
          const externalConfig = {
            context: {
              pdata: {
                ...this.pData,
                id: this.externalApps[event.from],
              },
            },
          }
          $t.heartbeat(event.data, externalConfig)
        } else {
          $t.heartbeat(
            {
              type: event.data.type,
              subtype: event.data.eventSubType,
              identifier: event.data.identifier,
              mimeType: event.data.mimeType,
              mode: event.data.mode,
            },
            {
              context: {
              pdata: {
                ...this.pData,
                id: this.pData.id,
              },
            },
            })
        }
      })
  }

  addSearchListener() {
    this.eventsSvc.events$
      .pipe(
        filter(
          (event: WsEvents.WsEventTelemetrySearch) =>
            event &&
            event.data &&
            event.eventType === WsEvents.WsEventType.Telemetry &&
            event.data.eventSubType === WsEvents.EnumTelemetrySubType.Search,
        ),
      )
      .subscribe(event => {
        $t.search(
          {
            query: event.data.query,
            filters: event.data.filters,
            size: event.data.size,
          },
          {
            context: {
              pdata: {
                ...this.pData,
                id: this.pData.id,
              },
            },
          },
        )
      })
  }

  getPageDetails() {
    const path = window.location.pathname.replace('/', '')
    const url = path + window.location.search
    return {
      pageid: path,
      pageUrl: url,
      pageUrlParts: path.split('/'),
      refferUrl: this.previousUrl,
      objectId: this.extractContentIdFromUrlParts(path.split('/')),
    }
  }

  extractContentIdFromUrlParts(urlParts: string[]) {
    // TODO: pick toc and viewer url from some configuration
    const tocIdx = urlParts.indexOf('toc')
    const viewerIdx = urlParts.indexOf('viewer')

    if (tocIdx === -1 && viewerIdx === -1) {
      return null
    }

    if (tocIdx !== -1 && tocIdx < urlParts.length - 1) {
      return urlParts[tocIdx + 1] // e.g. url /app/toc/<content_id>
    }

    if (viewerIdx !== -1 && viewerIdx < urlParts.length - 2) {
      return urlParts[viewerIdx + 2] // e.g. url /app/viewer/<content_type>/<content_id>
    }

    return null
  }
}
