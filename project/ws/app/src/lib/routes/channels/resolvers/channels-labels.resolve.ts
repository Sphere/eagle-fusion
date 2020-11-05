import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { WidgetContentService } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'

@Injectable()
export class ChannelsLabelsResolve
  implements
  Resolve<
  | Observable<IResolveResponse<any>>
  | IResolveResponse<any>
  > {
  constructor(private contentSvc: WidgetContentService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {

    return this.contentSvc.search({
      pageNo: 0,
      pageSize: 0,
    }).pipe(
      map(data => {
        const labels = data.notToBeShownFilters.find(unit => unit.type === 'labels')
        if (labels) {
          return labels.content
        }
        return []
      }),
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
