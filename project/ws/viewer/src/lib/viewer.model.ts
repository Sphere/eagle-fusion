/**
 * Type definitions for ViewerComponent
 * Replaces loose 'any' types with proper interfaces
 */

import { NsContent } from '@ws-widget/collection'

export interface IContentData {
  result: {
    content: NsContent.IContent
  }
}

export interface ILicenseConfig {
  licenseName: string
  [key: string]: any
}

export interface ILicenseMetadata {
  licenses: ILicenseConfig[]
}

export interface ITocConfig {
  [key: string]: any
}

export interface IDiscussionConfigData {
  userName?: string
  contextIdArr?: string[]
  contextType?: string
  categoryObj?: {
    category: {
      name: string
      pid: string
      description: string
      context: Array<{
        type: string
        identifier: string
      }>
    }
  }
}

export interface ContentEventData {
  activatedRoute: any
  data?: {
    content: {
      data: NsContent.IContent
    }
  }
}
