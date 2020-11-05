import { AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'relativeUrl',
})
export class RelativeUrlPipe implements PipeTransform {

  transform(value: string): any {
    return value ? `${AUTHORING_CONTENT_BASE}${encodeURIComponent(value)}` : ''
  }

}
