import { Injectable } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { filter } from 'rxjs/operators'
import { NsInstanceConfig } from '../resolvers/configurations.model'
import { ConfigurationsService } from './configurations.service'
import { WsEvents } from './event.model'
import { EventService } from './event.service'
import { LoggerService } from './logger.service'
import { HttpClient } from '@angular/common/http'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { ConfigCacheService } from 'src/app/services/config-cache.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'
import {
  ITelemetryEventData,
  IPageDetails,
  IExternalAppConfig,
  IPublicTelemetryEvent,
  IExternalImpressionData,
} from './telemetry.model'

declare let $t: any

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  previousUrl: string | null = null
  telemetryConfig: NsInstanceConfig.ITelemetryConfig | null = null
  pData: any = null
  externalApps: IExternalAppConfig = {
    RBCP: 'rbcp-web-ui',
  }

  constructor(
    readonly http: HttpClient,
    readonly configSvc: ConfigurationsService,
    readonly configCacheSvc: ConfigCacheService,
    readonly eventsSvc: EventService,
    readonly logger: LoggerService,
    readonly UserAgentResolverService: UserAgentResolverService,

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
        channel: this.rootOrgId || this.telemetryConfig.channel,
        uid: this.configSvc.userProfile && this.configSvc.userProfile.userId,
        sid: this.getTelemetrySessionId,
      }
      this.pData = this.telemetryConfig.pdata
      this.addInteractListener()
      this.addSearchListener()
      this.addHearbeatListener()
    }
  }

  get getTelemetrySessionId(): string {
    return localStorage.getItem('telemetrySessionId') || ''
  }

  get rootOrgId(): string {
    if (this.configSvc && this.configSvc.userProfile && this.configSvc.userProfile.rootOrgId) {
      return this.configSvc.userProfile.rootOrgId
    }
    return ''
  }

  interact(type: string, mode: string, id: string, data?: Record<string, any>, actor?: Record<string, any>, extras?: Record<string, any>) {
    try {
      if (this.telemetryConfig) {
        const page = this.getPageDetails()
        const userAgent = this.UserAgentResolverService.getUserAgent()
        const cookie = this.UserAgentResolverService.generateCookie()
        const edata: ITelemetryEventData = {
          type,
          mode,
          pageid: id,
          extras,
          uri: page.pageUrl,
          browserName: userAgent.browserName,
          OS: userAgent.OS,
          timestamp: Date.now(),
          userAgent,
          cookie,
        }
        $t.interact(edata, {
          actor: {
            ...actor && actor,
          },
          context: {
            env: this.telemetryConfig.env,
            channel: this.telemetryConfig.channel,
            pdata: {
              ...this.pData,
              id: 'web-ui',
              pid: 'sphere.aastrika.org',
            },
            sid: this.getTelemetrySessionId,
          },
          object: {
            ...(data) && data,
          },
        })
      } else {
        this.logger.error('Error Initializing Telemetry. Config missing.')
      }
    } catch (e) {
      this.logger.error('Error in telemetry interact', e)
    }
  }

  // New method for login telemetry - sends to postPublicTelemetry instead of $t.interact
  interactForLogin(type: string, mode: string, id: string, actor?: Record<string, any>, extras?: Record<string, any>) {
    try {
      if (this.telemetryConfig) {
        const page = this.getPageDetails()
        const userAgent = this.UserAgentResolverService.getUserAgent()
        const cookie = this.UserAgentResolverService.generateCookie()
        const utmParams = this.UserAgentResolverService.getUtmParams()
        const edata = {
          type,
          mode,
          subtype: extras?.subtype || '',
          pageid: id,
          uri: page.pageUrl,
          browserName: userAgent.browserName,
          OS: userAgent.OS,
          timestamp: Date.now(),
          userAgent,
          cookie,
          ...(utmParams.utm_source ? { utm_source: utmParams.utm_source } : {}),
          ...(utmParams.utm_medium ? { utm_medium: utmParams.utm_medium } : {}),
          ...(utmParams.utm_campaign ? { utm_campaign: utmParams.utm_campaign } : {}),
          ...(utmParams.utm_content ? { utm_content: utmParams.utm_content } : {}),
          ...(utmParams.utm_term ? { utm_term: utmParams.utm_term } : {}),
          ...extras,
        }

        const finalObject = {
          id: 'ekstep.telemetry',
          ver: '3.0',
          ets: Date.now(),
          events: [
            {
              eid: 'INTERACT',
              ets: Date.now(),
              ver: '3.0',
              mid: '',
              actor: {
                ...actor && actor,
              },
              context: {
                channel: this.telemetryConfig.channel,
                pdata: {
                  id: 'web-ui',
                  ver: '1.0.0',
                  pid: 'sphere.aastrika.org',
                },
                env: this.telemetryConfig.env,
                sid: this.getTelemetrySessionId,
                did: '',
                cdata: [
                  {
                    id: actor?.id || '',
                    type: actor?.type || '',
                  },
                ],
                rollup: {},
              },
              object: {
                ver: '1.0.0',
                id: '',
              },
              tags: [],
              edata,
            },
          ],
        }

        this.postPublicTelemetry(finalObject)
      } else {
        this.logger.error('Error Initializing Telemetry. Config missing.')
      }
    } catch (e) {
      this.logger.error('Error in telemetry interactForLogin', e)
    }
  }

  impression(type: string, mode: string, id: string, data?: Record<string, any>) {
    this.getTelemetryConfig()
    try {
      if (this.telemetryConfig) {
        const page = this.getPageDetails()
        const userAgent = this.UserAgentResolverService.getUserAgent()
        const cookie = this.UserAgentResolverService.generateCookie()
        const edata = {
          type,
          subtype: mode,
          pageid: id,
          uri: page.pageUrl,
          browserName: userAgent.browserName,
          OS: userAgent.OS,
          timestamp: Date.now(),
          userAgent,
          cookie,
        }
        $t.impression(edata, {
          context: {
            env: this.telemetryConfig.env,
            channel: this.telemetryConfig.channel,
            pdata: {
              ...this.pData,
              id: 'web-ui',
              pid: 'sphere.aastrika.org',
            },
            sid: this.getTelemetrySessionId,
          },
          object: {
            ...(data) && data,
          },
        })
      } else {
        this.logger.error('Error Initializing Telemetry. Config missing.')
      }
    } catch (e) {
      this.logger.error('Error in telemetry impression', e)
    }
  }

  start(type: string, mode: string, id: string, data?: Record<string, any>, extras?: Record<string, any>) {
    try {
      if (this.telemetryConfig) {
        $t.start(
          this.telemetryConfig,
          id,
          '1.0',
          {
            // id,
            type,
            mode,
            pageid: id,
            extras,
          },
          {
            context: {
              pdata: {
                ...this.pData,
                id: this.pData.id,
              },
              sid: this.getTelemetrySessionId,
            },
            object: {
              ...(data) && data,
            },
          }
        )
      } else {
        this.logger.error('Error Initializing Telemetry. Config missing.')
      }
    } catch (e) {
      this.logger.error('Error in telemetry start', e)
    }
  }

  end(type: string, mode: string, id: string, data?: Record<string, any>, extras?: Record<string, any>) {
    try {
      $t.end(
        {
          type,
          mode,
          pageid: id,
          extras,
        },
        {
          context: {
            pdata: {
              ...this.pData,
              id: this.pData.id,
            },
            sid: this.getTelemetrySessionId,
          },
          object: {
            ...(data) && data,
          },
        },
      )
    } catch (e) {
      this.logger.error('Error in telemetry end', e)
    }
  }

  audit(type: string, props: string, data: Record<string, any>) {
    try {
      $t.audit(
        {
          type,
          props,
          // data,
          state: data, // Optional. Current State
          prevstate: '', // Optional. Previous State
          duration: '', // Optional.
        },
        {
          context: {
            pdata: {
              ...this.pData,
              id: this.pData.id,
            },
            sid: this.getTelemetrySessionId,
          },
        },
      )
    } catch (e) {
      this.logger.error('Error in telemetry audit', e)
    }
  }

  heartbeat(type: string, id: string) {
    try {
      $t.heartbeat({
        id,
        // mode,
        type,
      })
    } catch (e) {
      this.logger.error('Error in telemetry heartbeat', e)
    }
  }
  async getTelemetryConfig() {
    const publicConfig: NsInstanceConfig.IConfig = await this.configCacheSvc.getHostConfig().toPromise()
    const instanceConfig = publicConfig
    this.telemetryConfig = instanceConfig.telemetryConfig
    this.telemetryConfig = {
      ...this.telemetryConfig,
      pdata: {
        ...this.telemetryConfig.pdata,
        pid: navigator.userAgent,
        // id: `${environment.name}.${this.telemetryConfig.pdata.id}`,
      },
      channel: this.rootOrgId || this.telemetryConfig.channel,
      uid: this.configSvc.userProfile && this.configSvc.userProfile.userId,
      sid: this.getTelemetrySessionId,
      // authtoken: this.authSvc.token,
    }
    this.pData = instanceConfig.telemetryConfig.pdata
  }

  async publicImpression(param: string, browserName: string, OS: string) {
    try {
      const page = this.getPageDetails()
      await this.getTelemetryConfig()
      const cookie = this.UserAgentResolverService.generateCookie()

      let edata = {
        pageid: page.pageid, // Required. Unique page id
        type: page.pageUrlParts[0], // Required. Impression type (list, detail, view, edit, workflow, search)
        uri: page.pageUrl,
        browserName,
        OS,
        timestamp: Date.now(),
        cookie,
      }
      const parsedParam = JSON.parse(param)
      edata = {
        ...edata, ...parsedParam,
      }
      const finalObject = {
        id: 'ekstep.telemetry',
        ver: '3.0',
        ets: Date.now(),
        events: [
          {
            eid: 'PUBLICIMPRESSION',
            ets: Date.now(),
            ver: '3.0',
            mid: '',
            actor: {
              id: 'anonymous',
              type: 'User',
            },
            context: {
              channel: '',
              pdata: {
                id: 'web-ui',
                ver: '1.0.0',
                pid: '',
              },
              env: 'prod',
              sid: this.getTelemetrySessionId,
              did: '',
              cdata: [],
              rollup: {},
            },
            object: {
              ver: '1.0.0',
              id: '',
            },
            tags: [],
            edata,
          },
        ],
      }
      if (page.objectId) {
        // const config = {
        //   context: {
        //     pdata: {
        //       ...this.pData,
        //       id: this.pData.id,
        //     },
        //   },
        //   object: {
        //     id: page.objectId,
        //   },
        // }
        this.postPublicTelemetry(finalObject)

        // $t.impression(edata, config)
      } else {
        this.postPublicTelemetry(finalObject)

        // $t.impression(edata, {
        //   context: {
        //     pdata: {
        //       ...this.pData,
        //       id: this.pData.id,
        //     },
        //   },
        // })
      }
      this.previousUrl = page.pageUrl
    } catch (e) {
      this.logger.error('Error in telemetry publicImpression', e)
    }
  }
  async paramTriggerEnd(param: string, browserName: string, OS: string, eparams: Record<string, any>, user: Record<string, any>, rollup: Record<string, any>) {
    const page = this.getPageDetails()
    try {
      let edata = {
        browserName,
        OS,
        timestamp: Date.now(),
        type: eparams.type,
        mode: eparams.mode,
        pageid: eparams.pageid,
        duration: eparams.duration,
      }
      const parsedParam = JSON.parse(param)
      edata = {
        ...edata, ...parsedParam,
      }
      const finalObject = {
        id: 'ekstep.telemetry',
        ver: '3.0',
        ets: Date.now(),
        events: [
          {
            eid: 'END',
            ets: Date.now(),
            ver: '3.0',
            mid: '',
            actor: {
              id: user.userId,
              type: 'User',
            },
            context: {
              channel: '',
              pdata: {
                id: 'web-ui',
                ver: '1.0.0',
                pid: '',
              },
              env: 'prod',
              sid: this.getTelemetrySessionId,
              did: '',
              cdata: [],
              rollup: rollup,
            },
            object: {
              ver: '1.0.0',
              id: '',
              type: "",
              rollup: rollup,
            },
            tags: [],
            edata,
          },
        ],
      }
      this.postPublicTelemetry(finalObject)
      this.previousUrl = page.pageUrl
    } catch (e) {
      this.logger.error('Error in telemetry paramTriggerEnd', e)
    }
  }
  async paramTriggerStart(param: string, browserName: string, OS: string, eparams: Record<string, any>, user: Record<string, any>, rollup: Record<string, any>) {
    const page = this.getPageDetails()
    try {
      let edata = {
        browserName,
        OS,
        timestamp: Date.now(),
        type: eparams.type,
        mode: eparams.mode,
        pageid: eparams.pageid,
        duration: eparams.duration,
      }
      const parsedParam = JSON.parse(param)
      edata = {
        ...edata, ...parsedParam,
      }
      const finalObject = {
        id: 'ekstep.telemetry',
        ver: '3.0',
        ets: Date.now(),
        events: [
          {
            eid: 'START',
            ets: Date.now(),
            ver: '3.0',
            mid: '',
            actor: {
              id: user.userId,
              type: 'User',
            },
            context: {
              channel: '',
              pdata: {
                id: 'web-ui',
                ver: '1.0.0',
                pid: '',
              },
              env: 'prod',
              sid: this.getTelemetrySessionId,
              did: '',
              cdata: [],
              rollup: rollup,
            },
            object: {
              ver: '1.0.0',
              id: '',
              type: '',
              rollup: rollup,
            },
            tags: [],
            edata,
          },
        ],
      }
      this.postPublicTelemetry(finalObject)
      this.previousUrl = page.pageUrl
    } catch (e) {
      this.logger.error('Error in telemetry paramTriggerStart', e)
    }
  }
  /**
   * Fires an INTERACT telemetry event for the registration/create-account flow.
   * Matches the mobile app event structure. Guest events use sessionId as actor id;
   * post-registration events use the real userId with type 'User'.
   */
  registrationInteract(
    actor: { id: string; type: string },
    env: string,
    edata: {
      type: string
      subtype: string
      id: string
      pageid: string
      extra?: { pos: any[]; values?: Record<string, any>[] }
    },
    object?: { id: string; type: string; version: string; rollup: any },
    userContext?: {
      referrer?: string
      screenWidth?: number
      screenHeight?: number
      language?: string
      utmParams?: {
        utm_source?: string | null
        utm_medium?: string | null
        utm_campaign?: string | null
        utm_content?: string | null
        utm_term?: string | null
      }
    },
  ) {
    try {
      if (this.telemetryConfig) {
        const userAgent = this.UserAgentResolverService.getUserAgent()
        const cookie = this.UserAgentResolverService.generateCookie()
        const deviceModel = this.UserAgentResolverService.getDeviceModel()
        const guestId = this.getTelemetrySessionId

        const geo = this.UserAgentResolverService.getStoredGeolocation()
        const contextValues: Record<string, any>[] = [
          { browserName: userAgent.browserName },
          { OS: userAgent.OS },
          ...(deviceModel ? [{ deviceModel }] : []),
          ...(userContext?.referrer ? [{ referrer: userContext.referrer }] : []),
          ...(userContext?.screenWidth ? [{ screenWidth: userContext.screenWidth, screenHeight: userContext.screenHeight }] : []),
          ...(userContext?.language ? [{ language: userContext.language }] : []),
          ...(userContext?.utmParams?.utm_source ? [{ utm_source: userContext.utmParams.utm_source }] : []),
          ...(userContext?.utmParams?.utm_medium ? [{ utm_medium: userContext.utmParams.utm_medium }] : []),
          ...(userContext?.utmParams?.utm_campaign ? [{ utm_campaign: userContext.utmParams.utm_campaign }] : []),
          ...(userContext?.utmParams?.utm_content ? [{ utm_content: userContext.utmParams.utm_content }] : []),
          ...(userContext?.utmParams?.utm_term ? [{ utm_term: userContext.utmParams.utm_term }] : []),
          ...(geo ? [{ latitude: geo.latitude, longitude: geo.longitude, geoAccuracy: geo.accuracy }] : []),
        ]

        const enrichedEdata = {
          ...edata,
          extra: {
            pos: [],
            ...edata.extra,
            values: [
              ...(edata.extra?.values || []),
              ...contextValues,
            ],
          },
        }

        const finalObject = {
          id: 'ekstep.telemetry',
          ver: '3.0',
          ets: Date.now(),
          events: [
            {
              eid: 'INTERACT',
              ets: Date.now(),
              ver: '3.0',
              mid: '',
              actor,
              context: {
                cdata: [{ id: guestId, type: 'Guest user' }],
                env,
                channel: this.telemetryConfig.channel,
                pdata: {
                  id: 'web-ui',
                  pid: 'sphere.aastrika.org',
                  ver: '1.0.0',
                  platform: userAgent.OS || '',
                },
                sid: guestId,
                did: cookie,
              },
              edata: enrichedEdata,
              object: object || { id: '', type: '', version: '', rollup: {} },
              tags: [],
            },
          ],
        }
        this.postPublicTelemetry(finalObject)
      } else {
        this.logger.error('Error Initializing Telemetry. Config missing.')
      }
    } catch (e) {
      this.logger.error('Error in telemetry registrationInteract', e)
    }
  }

  postPublicTelemetry(data: IPublicTelemetryEvent) {
    return this.http
      .post<any>(API_END_POINTS.PUBLIC_TELEMETRY, data)
      .toPromise()
      .catch((error: any) => {
        this.logger.error('Error posting telemetry', error)
      })
  }
  async paramTriggerImpression(param: string, browserName: string, OS: string) {
    try {
      const page = this.getPageDetails()
      await this.getTelemetryConfig()

      const cookie = this.UserAgentResolverService.generateCookie()

      let edata = {
        pageid: page.pageid, // Required. Unique page id
        type: page.pageUrlParts[0], // Required. Impression type (list, detail, view, edit, workflow, search)
        uri: page.pageUrl,
        browserName,
        OS,
        timestamp: Date.now(),
        cookie,
      }
      const parsedParam = JSON.parse(param)
      edata = {
        ...edata, ...parsedParam,
      }

      if (page.objectId) {
        const config = {
          context: {
            pdata: {
              ...this.pData,
              id: this.pData.id,
            },
            sid: this.getTelemetrySessionId,
          },
          object: {
            id: page.objectId,
          },
        }
        $t.impression(edata, config)
      } else {
        $t.impression(edata, {
          context: {
            pdata: {
              ...this.pData,
              id: this.pData.id,
            },
            sid: this.getTelemetrySessionId,
          },
        })
      }
      this.previousUrl = page.pageUrl
    } catch (e) {
      this.logger.error('Error in telemetry paramTriggerImpression', e)
    }
  }

  externalImpression(impressionData: IExternalImpressionData) {
    try {
      const page = this.getPageDetails()
      if (this.externalApps[impressionData.subApplicationName]) {
        const externalConfig = page.objectId ? {
          context: {
            pdata: {
              ...this.pData,
              id: this.externalApps[impressionData.subApplicationName],
            },
            sid: this.getTelemetrySessionId,
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
            sid: this.getTelemetrySessionId,
          },
        }
        $t.impression(impressionData.data, externalConfig)
      }
    } catch (e) {
      this.logger.error('Error in telemetry externalImpression', e)
    }
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
        // event.data.content['isIframeSupported'] = 'Yes'
        event.data['isIframeSupported'] = 'Yes'
        // const content: NsContent.IContent | null = event.data.content
        const content: NsContent.IContent | null = event.data
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
            event.data.object
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
            event.data.object
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
              sid: this.getTelemetrySessionId,
            },
          }
          try {
            $t.interact(event.data, externalConfig)
          } catch (e) {
            this.logger.error('Error in telemetry interact', e)
          }
        } else {
          try {
            $t.interact(
              {
                type: event.data.type,
                mode: event.data.subType,
                // object: event.data.object,
                pageid: event.data.pageid || page.pageid,
                extras: event.data.extras,
                // target: { page },
              },
              {
                context: {
                  pdata: {
                    ...this.pData,
                    id: this.pData.id,
                  },
                  sid: this.getTelemetrySessionId,
                },
                object: {
                  ...event.data.object,
                },
              })
          } catch (e) {
            this.logger.error('Error in telemetry interact', e)
          }
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
              sid: this.getTelemetrySessionId,
            },
          }
          try {
            $t.heartbeat(event.data, externalConfig)
          } catch (e) {
            this.logger.error('Error in telemetry heartbeat', e)
          }
        } else {
          try {
            $t.heartbeat(
              {
                type: event.data.type,
                // mode: event.data.eventSubType,
                identifier: event.data.identifier,
                // mimeType: event.data.mimeType,
                // mode: event.data.mode,
              },
              {
                context: {
                  pdata: {
                    ...this.pData,
                    id: this.pData.id,
                  },
                  sid: this.getTelemetrySessionId,
                },
              })
          } catch (e) {
            this.logger.error('Error in telemetry heartbeat', e)
          }
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
        try {
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
                sid: this.getTelemetrySessionId,
              },
            },
          )
        } catch (e) {
          this.logger.error('Error in telemetry search', e)
        }
      })
  }

  getPageDetails(): IPageDetails {
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

  extractContentIdFromUrlParts(urlParts: string[]): string | null {
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
