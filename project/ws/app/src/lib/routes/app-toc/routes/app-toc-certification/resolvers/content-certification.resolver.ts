import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { WidgetContentService, NsContent } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'

@Injectable()
export class ContentCertificationResolver {
  constructor(private contentSvc: WidgetContentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<NsContent.IContent>> {
    if (route.parent && route.parent.data.content) {
      const contentMetaResolve = route.parent.data.content as IResolveResponse<NsContent.IContent>
      return of(contentMetaResolve)
    }

    const contentId = route.paramMap.get('contentId')
    if (contentId) {
      return this.contentSvc.fetchContent(contentId, 'detail').pipe(
        map(data => ({ data, error: null })),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
