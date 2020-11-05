import { Injectable } from '@angular/core'
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router'
import { Observable } from 'rxjs'
import { ConfigurationsService } from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class EmptyRouteGuard implements CanActivate {
  constructor(private router: Router, private configSvc: ConfigurationsService) {}
  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.configSvc.isAuthenticated) {
      // logger.log('Redirecting to application home page');
      return this.router.parseUrl('/page/home')
    }
    // logger.log('redirecting to login page as the user is not loggedIn');
    return this.router.parseUrl('/login')
  }
}
