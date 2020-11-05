import { NsContent } from '../_services/widget-content.model'

export interface IKBContentCard extends NsContent.IContentMinimal {
  lastUpdatedOn: string
  averageRating: number
  viewCount: number
  status: string
  isInIntranet?: boolean
  totalRating?: number
}
