import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { DowntimeConfigService } from '../services/downtime-config.service'

@Injectable({
  providedIn: 'root',
})
export class EmptyRouteGuard {
  constructor(
    private downtimeService: DowntimeConfigService,
  ) { }

  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check downtime status with take(1) to complete after first emission
    // This allows guard to evaluate current state and complete the navigation check
    // On next navigation attempt, guard will re-evaluate the (potentially updated) state
    return this.downtimeService.getDowntimeState().pipe(
      take(1),
      map(downtimeState => {
        // Block navigation during full downtime
        if (downtimeState.isDowntime && downtimeState.type === 'full') {
          return false
        }
        // Allow navigation if no downtime
        return true
      })
    )
  }
}

