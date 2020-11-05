import { NSContent } from './content'
import { IFormMeta } from './form'

export type IRole = 'review' | 'publish' | 'qualityReview' | 'view' | 'author'

export interface IContentRender {
  name: string
  displayName: string
  icon: string,
  additionalMessage: string
  contentType: NSContent.IContentType | ''
  resourceType?: string
  mimeType: string
  hasEnabled: boolean
  canShow: boolean
  allowedRoles: string[]
  flow?: {
    internalFlow: {
      common: string[]
      conditional?: {
        condition: {
          [key in keyof NSContent.IContentMeta]: any[]
        }
        flow: string[]
      }[]
    }
    externalFlow: {
      common: string[]
      conditional?: {
        condition: {
          [key in keyof NSContent.IContentMeta]: any[]
        }
        flow: string[]
      }[]
    }
  },
  additionalMeta: {
    [key in keyof NSContent.IContentMeta]: any
  },
  children: string[]
}

export interface IInitialSetup {
  contentTypes: IContentRender[]
  form: IFormMeta
  roles: {
    [key in IRole]: {
      [key: string]: {
        condition: {
          [meta in keyof NSContent.IContentMeta]: any[]
        },
        fields?: string[]
      }
    }
  }
}
