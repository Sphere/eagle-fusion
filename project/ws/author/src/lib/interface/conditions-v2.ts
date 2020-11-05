import { NSContent } from '@ws/author/src/lib/interface/content'

export interface IConditionsV2 {
  fit?: { [key in keyof NSContent.IContentMeta]: any[] }[]
  notFit?: { [key in keyof NSContent.IContentMeta]: any[] }[]
}
