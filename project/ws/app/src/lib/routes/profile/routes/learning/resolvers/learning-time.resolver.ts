import { Injectable } from '@angular/core'
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { ProfileService } from '../../../services/profile.service'
import { ITimeSpent } from '../models/learning.models'

export interface ITimeResolveData {
  start: Date
  end: Date
  data: ITimeSpent
}

@Injectable()
export class LearningTimeResolver implements Resolve<ITimeResolveData> {
  constructor(private profileSvc: ProfileService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<ITimeResolveData> | Promise<ITimeResolveData> | ITimeResolveData {
    const singleDay = 24 * 60 * 60 * 1000
    const now = Date.now()
    let start = new Date(now - 7 * singleDay)
    let end = new Date(now - singleDay)
    if (route.queryParams.start) {
      start = new Date(parseInt(route.queryParams.start, 10))
    }
    if (route.queryParams.end) {
      end = new Date(parseInt(route.queryParams.end, 10))
    }
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return this.profileSvc
      .getDashBoard(
        `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`,
        `${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`,
      )
      .pipe(
        map(
          data => ({
            start,
            end,
            data,
          }),
          catchError(() => of({ data: null, error: null })),
        ),
      )
  }
}
// export class LearningTimeResolver
//   implements
//     Resolve<
//       | Observable<IResolveResponse<{ response: NSProfileData.ITimeSpentResponse }>>
//       | IResolveResponse<NSProfileData.ITimeSpentResponse>
//     > {
//   constructor(private profileSvc: ProfileService) {}
//   startDate = '2018-04-01'
//   endDate = '2020-03-31'
//   contentType = 'Course'
//   isCompleted = 0

//   resolve():
//     | Observable<IResolveResponse<NSProfileData.ITimeSpentResponse>>
//     | IResolveResponse<NSProfileData.ITimeSpentResponse> {
//     return this.profileSvc
//       .timeSpent(this.startDate, this.endDate, this.contentType, this.isCompleted)
//       .pipe(
//         map(data => ({ data, error: null })),
//         catchError(() => of({ data: null, error: null })),
//       )
//   }
// }
