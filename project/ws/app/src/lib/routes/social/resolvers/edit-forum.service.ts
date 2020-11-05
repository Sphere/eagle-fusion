import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import { map, catchError } from 'rxjs/operators'
import { ForumService } from '../routes/forums/service/forum.service'

@Injectable()
export class EditForumService implements
  Resolve<
  Observable<IResolveResponse<any>> | IResolveResponse<any>
  > {
  constructor(
    private forumSvc: ForumService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {
    const contentId = route.paramMap.get('id')
    if (contentId) {
      return this.forumSvc.fetchForumById(contentId).pipe(
        map(data => ({ data, error: null })),

        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
