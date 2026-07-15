/**
 * Telemetry Data Models
 */

export interface ITelemetryEventData {
  type: string
  mode: string
  pageid: string
  uri?: string
  extras?: Record<string, any>
  browserName?: string
  OS?: string
  timestamp?: number
  userAgent?: any
  cookie?: string
}

export interface ITelemetryConfig {
  pdata: {
    id: string
    ver?: string
    pid?: string
  }
  channel: string
  env?: string
  uid?: string
  sid?: string
}

export interface IPageDetails {
  pageid: string
  pageUrl: string
  pageUrlParts: string[]
  refferUrl: string | null
  objectId: string | null
}

export interface IExternalAppConfig {
  [key: string]: string
}

export interface ITelemetryAuditData {
  type: string
  props: string
  state: any
  prevstate?: string
  duration?: string
}

export interface ITelemetryActor {
  id: string
  type: string
}

export interface IUserContext {
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
}

export interface IRegistrationEdataExtra {
  pos?: any[]
  values?: Record<string, any>[]
}

export interface IRegistrationEdata {
  type: string
  subtype: string
  id: string
  pageid: string
  extra?: IRegistrationEdataExtra
}

export interface ITelemetryObject {
  id: string
  type: string
  version: string
  rollup: any
}

export interface IPublicTelemetryEvent {
  id: string
  ver: string
  ets: number
  events: any[]
}

export interface ITelemetryImpressionData {
  pageid: string
  type: string
  uri: string
  browserName?: string
  OS?: string
  timestamp?: number
  cookie?: string
  [key: string]: any
}

export interface IExternalImpressionData {
  subApplicationName: string
  data: any
}
