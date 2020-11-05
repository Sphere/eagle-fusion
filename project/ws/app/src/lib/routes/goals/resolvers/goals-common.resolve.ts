import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { BtnGoalsService, NsGoal } from '@ws-widget/collection'
import { IResolveResponse } from '@ws-widget/utils'

@Injectable()
export class GoalsCommonResolve
  implements
  Resolve<
  | Observable<IResolveResponse<NsGoal.IGoalsGroup[]>>
  | IResolveResponse<NsGoal.IGoalsGroup[]>
  > {
  constructor(private goalSvc: BtnGoalsService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsGoal.IGoalsGroup[]>> {
    return this.goalSvc.getCommonGoals().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
