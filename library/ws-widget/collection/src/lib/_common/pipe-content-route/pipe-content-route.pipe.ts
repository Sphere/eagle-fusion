import { Pipe, PipeTransform } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'
@Pipe({
  name: 'pipeContentRoute',
})
export class PipeContentRoutePipe implements PipeTransform {
  constructor() { }

  transform(
    content: NsContent.IContent,
    forPreview = false,
  ): { url: string; queryParams: { [key: string]: any } } {
    // commercial_begin
    const location = forPreview ? '/author' : '/app'
    // commercial_end
    if (content.contentType === 'Knowledge Board') {
      return {
        url: forPreview
          ? `${location}/toc/${content.identifier}/overview`
          : `${location}/knowledge-board/${content.identifier}`,
        queryParams: this.getQueryParams(),
      }
    }
    if (content.contentType === 'Channel') {
      return {
        url: `/${forPreview ? 'author/viewer/channel' : 'page'}/${content.identifier}`,
        queryParams: this.getQueryParams(),
      }
    }
    if (content.contentType === 'Learning Journeys') {
      if (content.resourceType === 'Dynamic Learning Paths') {
        return {
          url: `/app/learning-journey/dlp/${content.identifier}/0`,
          queryParams: this.getQueryParams(),
        }
      }
      return {
        url: `/app/learning-journey/cdp/${content.identifier}`,
        queryParams: this.getQueryParams(),
      }
    }
    if (content.continueLearningData
      && content.continueLearningData.contextType === 'playlist'
      && content.continueLearningData.contextPathId) {
      return {
        url: `/app/playlist/me/${content.continueLearningData.contextPathId}`,
        queryParams: this.getQueryParams(),
      }
    }
    return {
      url: `${location}/toc/${content.identifier}/overview`,
      queryParams: this.getQueryParams(),
    }
  }

  private getQueryParams() {
    return {}
  }
}
