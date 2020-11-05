import { IWidgetsPlayerMediaData } from '../_models/player-media.model'
import { NsEmbeddedPage } from '../embedded-page/embedded-page.model'

export interface IWidgetWrapperMedia {
  externalData?: NsEmbeddedPage.IEmbeddedPage
  videoData?: IWidgetsPlayerMediaData
}
