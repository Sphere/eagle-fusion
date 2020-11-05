import { NsContent } from '../../_services/widget-content.model'

export interface IReqMarkAsComplete {
  content_type: NsContent.EContentTypes,
  current: ['1'],
  max_size: 1,
  mime_type: NsContent.EMimeTypes,
  user_id_type: 'uuid',
}
