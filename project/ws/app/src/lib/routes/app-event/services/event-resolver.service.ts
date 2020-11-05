import { Injectable } from '@angular/core'
import { EventService } from './event.service'
import { catchError, map } from 'rxjs/operators'
import { of, Observable } from 'rxjs'
import { ActivatedRouteSnapshot } from '@angular/router'

@Injectable()
export class EventResolverService {

  constructor(private eventSvc: EventService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const id = Number(route.params['id']) || 1
    return this.eventSvc.getEventData().pipe(
      map((data: any) => {
        const requiredData = data.Events[Object.keys(data.Events)[id - 1]]
        return { data: requiredData, error: null }
      }),
      catchError((err: any) => {
        return of({ data: null, error: err })
      })
    )
  }
}
