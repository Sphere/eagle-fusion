import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { IResolveResponse } from '@ws-widget/utils'

import { TrainingApiService } from '../../../apis/training-api.service'

@Injectable()
export class TrainingCountResolver implements Resolve<IResolveResponse<number>> {
  constructor(private trainingApi: TrainingApiService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<number>> {
    const contentId = route.paramMap.get('contentId')
    if (contentId) {
      return this.trainingApi.getTrainingCount(contentId).pipe(
        map(trainingCount => {
          return {
            data: trainingCount,
            error: null,
          }
        }),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
