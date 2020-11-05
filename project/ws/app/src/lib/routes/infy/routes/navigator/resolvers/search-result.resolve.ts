import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { IResolveResponse } from '@ws-widget/utils'
import { NavigatorService } from '../services/navigator.service'

@Injectable()
export class SearchResultResolve
  implements Resolve<Observable<IResolveResponse<any>> | IResolveResponse<any>> {
  constructor(private navigatorSvc: NavigatorService) {}

  resolve(): Observable<IResolveResponse<any>> | IResolveResponse<any> {
    return this.navigatorSvc.fetchLearningPathData().pipe(
      map(data => ({ data, error: null })),
      catchError(_ => of({ data: null, error: null })),
    )
  }
}
