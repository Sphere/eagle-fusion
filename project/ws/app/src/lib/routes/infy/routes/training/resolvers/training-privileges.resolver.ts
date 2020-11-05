import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { IResolveResponse } from '@ws-widget/utils'
import { ITrainingUserPrivileges } from '../models/training-api.model'
import { Observable, of } from 'rxjs'
import { TrainingApiService } from '../apis/training-api.service'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class TrainingPrivilegesResolver
  implements Resolve<IResolveResponse<ITrainingUserPrivileges>> {
  constructor(private trainingApi: TrainingApiService) {}

  resolve(): Observable<IResolveResponse<ITrainingUserPrivileges>> {
    return this.trainingApi.getUserTrainingPrivileges().pipe(
      map(data => ({ data, error: null })),
      catchError((error: any) => of({ error, data: null })),
    )
  }
}
