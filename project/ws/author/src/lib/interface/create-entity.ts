export interface ICreateEntity {
  id: string
  name: string
  description: string
  icon: string
  parent?: string
  children?: string[]
  contentType: string
  resourceType?: string
  mimeType: string
  hasRole: string[]
  available: boolean
  isExpanded: boolean
  enabled: boolean
  url?: string
  isCollection?: boolean
  additionalMeta?: { [key: string]: any }
}
