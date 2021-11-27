import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  // RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import * as _ from 'lodash'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/public-api'
// import { UserProfileService } from '../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard implements CanActivate {
  dobFlag = false
  constructor(private router: Router, private configSvc: ConfigurationsService,
    // private userProfileSvc: UserProfileService
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const requiredFeatures = (next.data && next.data.requiredFeatures) || []
    const requiredRoles = (next.data && next.data.requiredRoles) || []
    return await this.shouldAllow<boolean | UrlTree>(requiredFeatures, requiredRoles)
  }

  private async shouldAllow<T>(
    requiredFeatures: string[],
    requiredRoles: string[],
  ): Promise<T | UrlTree | boolean> {

    // setTimeout(() => {

    // }, 5000)

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
      return this.router.parseUrl(`/public/tnc`)
    }
    /**
       * Test IF User updated the profile details
       */
    // if (!this.configSvc.profileDetailsStatus) {
    //   return this.router.parseUrl('/app/user-profile/chatbot')
    // }

    // if (this.configSvc && this.configSvc.unMappedUser) {
    //   this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
    //     (data: any) => {
    //       if (_.isNull(data.profileDetails)) {
    //         return this.router.navigate(['/public/tnc'])
    //       }
    //       return true
    //     },
    //     (_err: any) => {
    //     })
    // }
    // else if (_.isUndefined(this.configSvc.unMappedUser)) {
    //   // return this.router.navigate(['/public/tnc'])
    //   this.router.navigate(['public', 'tnc'])
    // }

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
