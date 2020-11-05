import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class ChannelsGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): UrlTree {
    try {
      if (route.parent && route.parent.data) {
        return this.router.parseUrl(
          route.parent.data.channelsData.data.tabs[0].tabDetails.routerLink,
        )
      }
    } catch (err) {}
    return this.router.parseUrl('/error/not-found')
  }
}
