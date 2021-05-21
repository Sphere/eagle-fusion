import { NsContent } from './widget-content.model'

export const VIEWER_ROUTE_FROM_MIME = (mimeType: NsContent.EMimeTypes) => {
  switch (mimeType) {
    case NsContent.EMimeTypes.MP3:
      return 'audio'
    case NsContent.EMimeTypes.M4A:
      return 'audio-native'
    case NsContent.EMimeTypes.COLLECTION:
      return 'html'
    case NsContent.EMimeTypes.CHANNEL:
    // case 'application/json' as any:
    //   return 'channel'
    case NsContent.EMimeTypes.CERTIFICATION:
      return 'certification'
    case NsContent.EMimeTypes.HTML:
    case NsContent.EMimeTypes.ZIP:
    case NsContent.EMimeTypes.TEXT_WEB:
      return 'html'
    case NsContent.EMimeTypes.IAP:
      return 'iap'
    case NsContent.EMimeTypes.ILP_FP:
      return 'ilp-fp'
    case NsContent.EMimeTypes.PDF:
      return 'pdf'
    case NsContent.EMimeTypes.MP4:
    case NsContent.EMimeTypes.M3U8:
      return 'video'
    case NsContent.EMimeTypes.YOUTUBE:
      return 'youtube'
    case NsContent.EMimeTypes.WEB_MODULE:
      return 'web-module'
    case NsContent.EMimeTypes.WEB_MODULE_EXERCISE:
      return 'web-module'
    case NsContent.EMimeTypes.CLASS_DIAGRAM:
      return 'class-diagram'
    case NsContent.EMimeTypes.HANDS_ON:
      return 'hands-on'
    case NsContent.EMimeTypes.RDBMS_HANDS_ON:
      return 'rdbms-hands-on'
    case NsContent.EMimeTypes.HTML_PICKER:
      return 'html-picker'
    case NsContent.EMimeTypes.QUIZ:
    case NsContent.EMimeTypes.APPLICATION_JSON:
      return 'quiz'
    case NsContent.EMimeTypes.COLLECTION_RESOURCE:
      return 'resource-collection'
    default:
      return ''
  }
}

// export function viewerRouteGenerator(
//   id: string,
//   mimeType: NsContent.EMimeTypes,
//   collectionId?: string,
//   collectionType?: string,
//   forPreview = false,
// ): { url: string; queryParams: { [key: string]: any } } {
//   let collId = collectionId
//   let collType = collectionType
//   if (collType && !NsContent.PLAYER_SUPPORTED_COLLECTION_TYPES.includes(collType)) {
//     collId = undefined
//     collType = undefined
//   }
//   const url = `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(mimeType)}/${id}`
//   let queryParams = {}
//   if (collectionId && collectionType) {
//     queryParams = { collectionId: collId, collectionType: collType }
//   }
//   return {
//     queryParams,
//     url,
//   }
// }

export function viewerRouteGenerator(
  id: string,
  mimeType: NsContent.EMimeTypes,
  collectionId?: string,
  collectionType?: string,
  forPreview = false,
  primaryCategory?: string,
  batchId?: string,
): { url: string; queryParams: { [key: string]: any } } {
  let collId = collectionId
  let collType = collectionType
  if (collType && !NsContent.PLAYER_SUPPORTED_COLLECTION_TYPES.includes(collType)) {
    collId = undefined
    collType = undefined
  }
  const url = `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(mimeType)}/${id}`
  let queryParams = {}
  if (primaryCategory) {
    queryParams = {
      primaryCategory,
    }
  }
  if (collectionId && collectionType) {
    queryParams = { ...queryParams, collectionId: collId, collectionType: collType }
  }
  if (batchId) {
    queryParams = { ...queryParams, batchId }
  }
  return {
    queryParams,
    url,
  }
}
