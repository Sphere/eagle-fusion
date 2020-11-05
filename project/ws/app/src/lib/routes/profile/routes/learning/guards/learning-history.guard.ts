import { Injectable } from '@angular/core'
import { CanActivate, Router, UrlTree } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class LearningHistoryGuard implements CanActivate {
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
  ) {
  }
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.configSvc.userRoles && (this.configSvc.userRoles.has('my-analytics') || this.configSvc.userRoles.has('admin'))) {
      return true
    }
    return this.router.parseUrl('/page/home')
  }

}
