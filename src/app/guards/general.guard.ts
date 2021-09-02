import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/public-api'

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard implements CanActivate {
  constructor(private router: Router, private configSvc: ConfigurationsService) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const requiredFeatures = (next.data && next.data.requiredFeatures) || []
    const requiredRoles = (next.data && next.data.requiredRoles) || []
    return await this.shouldAllow<boolean | UrlTree>(state, requiredFeatures, requiredRoles)
  }

  private async shouldAllow<T>(
    state: RouterStateSnapshot,
    requiredFeatures: string[],
    requiredRoles: string[],
  ): Promise<T | UrlTree | boolean> {
    /**
     * Test IF User is authenticated
     */
    // if (!this.configSvc.isAuthenticated) {
    //   let refAppend = ''
    //   if (state.url) {
    //     refAppend = `?ref=${encodeURIComponent(state.url)}`
    //   }
    //   console.log(!this.configSvc.isAuthenticated)
    //   console.log(refAppend)

    //   return this.router.parseUrl(`/login${refAppend}`)
    // }
    // If invalid user
    if (
      this.configSvc.userProfile === null &&
      this.configSvc.instanceConfig &&
      !Boolean(this.configSvc.instanceConfig.disablePidCheck)
    ) {
      return this.router.parseUrl('/app/invalid-user')
    }
    /**
     * Test IF User Tnc Is Accepted
     */
    if (!this.configSvc.hasAcceptedTnc) {
      if (
        state.url &&
        !state.url.includes('/app/setup/') &&
        !state.url.includes('/app/tnc') &&
        !state.url.includes('/page/home')
      ) {
        this.configSvc.userUrl = state.url
      }
      // if (
      //   this.configSvc.restrictedFeatures &&
      //   !this.configSvc.restrictedFeatures.has('firstTimeSetupV2')
      // ) {
      //   return this.router.parseUrl(`/app/setup/home/lang`)
      // }
      // return this.router.parseUrl(`/app/tnc`)
    }
    /**
       * Test IF User updated the profile details
       */
    if (!this.configSvc.profileDetailsStatus) {
      // return this.router.parseUrl('/app/user-profile/details')
    }

    /**
     * Test IF User has requried role to access the page
     */
    if (requiredRoles && requiredRoles.length && this.configSvc.userRoles) {
      const requiredRolePreset = requiredRoles.some(item =>
        (this.configSvc.userRoles || new Set()).has(item),
      )

      if (!requiredRolePreset) {
        return this.router.parseUrl('/page/home')
      }
    }

    // check if feature is restricted
    if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
      const requiredFeaturesMissing = requiredFeatures.some(item =>
        (this.configSvc.restrictedFeatures || new Set()).has(item),
      )

      if (requiredFeaturesMissing) {
        return this.router.parseUrl('/page/home')
      }
    }
    return true
  }
}
