import {
  CONTENT_BASE_STATIC,
  CONTENT_BASE_STREAM,
  CONTENT_BASE_WEBHOST,
  CONTENT_BASE_WEBHOST_ASSETS,
} from '../constants/apiEndpoints'
import { NSContent } from './content'

export namespace NSApiRequest {
  export interface ICreateMetaRequestGeneral {
    name: string
    description: string
    mimeType: string
    contentType: string
    resourceType?: string
    isTranslationOf?: string
    locale?: string
    isExternal?: boolean
  }

  export interface ICreateMetaRequest {
    content: {
      name: string
      description: string
      mimeType: string
      contentType: string
      createdBy: string
      resourceType?: string
      locale: string
      authoringDisabled?: boolean
      isMetaEditingDisabled?: boolean
      isContentEditingDisabled?: boolean
      isExternal?: boolean
      categoryType?: string
      accessPaths?: string
      category?: string
    }
  }

  export interface IForwardBackwardActionGeneral {
    comment: string
    operation: 1 | 0 | -1 | 100000
  }

  export interface IForwardBackwardAction {
    actor: string
    comment: string
    operation: 1 | 0 | -1 | 100000
    appName: string
    appUrl: string
    rootOrg: string
    org: string
    actorName: string
    action: string
  }

  export interface IContentUpdate {
    nodesModified: {
      [key: string]: {
        isNew: boolean
        root: boolean
        metadata: NSContent.IContentMeta
      }
    }
    hierarchy: {} | { [key: string]: { root: boolean; children: string[] } }
  }

  export interface IContentData {
    contentId: string
    contentType:
      | typeof CONTENT_BASE_STATIC
      | typeof CONTENT_BASE_STREAM
      | typeof CONTENT_BASE_WEBHOST
      | typeof CONTENT_BASE_WEBHOST_ASSETS
  }
}
