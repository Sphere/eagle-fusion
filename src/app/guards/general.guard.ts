import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot, Router,
  // RouterStateSnapshot,
  UrlTree
} from '@angular/router'
import { ConfigurationsService, LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { UserDataCacheService } from '../services/user-data-cache.service'

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard {
  dobFlag = false
  isXSmall = false
  locale = ''
  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private userDataCacheSvc: UserDataCacheService,
    private logger: LoggerService,
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const requiredFeatures = (next.data && next.data.requiredFeatures) || []
    const requiredRoles = (next.data && next.data.requiredRoles) || []

    // ─── Org-based home redirect ───────────────────────────────────────────────
    // When a logged-in user whose organisation is listed in orgMeta.json's
    // `homeRedirectOrgs` array navigates to /page/home, send them straight to
    // their org-details page instead of the generic home page.
    //
    // This covers every path to /page/home: post-login, nav-bar home click,
    // browser back button, or direct URL entry.
    //
    // To add a new org: append one entry to homeRedirectOrgs in orgMeta.json.
    // No code changes here are needed.
    if (next.params['id'] === 'home') {
      const rootOrgId = this.configSvc.userProfile?.rootOrgId
      if (rootOrgId && this.configSvc.orgHomeRedirectMap?.has(rootOrgId)) {
        const redirectUrl = this.configSvc.orgHomeRedirectMap.get(rootOrgId)!
        this.logger.log(`[GeneralGuard] Org ${rootOrgId} redirected from /page/home → ${redirectUrl}`)
        return this.router.parseUrl(redirectUrl)
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    return await this.shouldAllow<boolean | UrlTree>(requiredFeatures, requiredRoles)
  }

  private async shouldAllow<T>(
    // state: RouterStateSnapshot,
    requiredFeatures: string[],
    requiredRoles: string[],
  ): Promise<T | UrlTree | boolean> {
    // Try to restore user data from cache if it's not already set
    // This handles the case where user data exists in sessionStorage but hasn't been loaded yet
    if (this.configSvc.userProfile === null) {
      const cachedUserData = this.userDataCacheSvc.getCachedUserData()
      if (cachedUserData && cachedUserData.userId) {
        this.logger.log('[GeneralGuard] Restoring user data from cache for userId:', cachedUserData.userId)
        this.configSvc.unMappedUser = cachedUserData
        // Basic user profile setup from cache
        this.configSvc.userProfile = {
          userId: cachedUserData.userId,
          email: cachedUserData.email || cachedUserData.officialEmail,
          givenName: cachedUserData.firstName,
          firstName: cachedUserData.firstName,
          lastName: cachedUserData.lastName,
          userName: cachedUserData.userName,
          rootOrgId: cachedUserData.rootOrgId,
          rootOrgName: cachedUserData.channel,
          profileImage: cachedUserData.thumbnail,
          departmentName: cachedUserData.channel,
          dealerCode: null,
          isManager: false,
          phone: cachedUserData.phone,
          country: null,
          language: cachedUserData.profileDetails?.preferences?.language || 'en',
        }
        // Restore roles
        if (cachedUserData.roles && Array.isArray(cachedUserData.roles)) {
          this.configSvc.userRoles = new Set((cachedUserData.roles || []).map((v: string) => v.toLowerCase()))
        }
      }
    }

    // this.logger.log("came here 1")
    // tslint:disable-next-line: no-non-null-assertion
    if (localStorage.getItem('lang') && this.configSvc.userProfile!.language) {
      // tslint:disable-next-line: no-non-null-assertion
      this.locale = this.configSvc.userProfile!.language
      if (this.locale === 'en') {
        this.locale = ''
      }
    }
    // // tslint:disable-next-line: no-non-null-assertion
    // if (!localStorage.getItem('lang') && this.configSvc.userProfile!.language) {
    //   // tslint:disable-next-line: no-non-null-assertion
    //   this.locale = this.configSvc.userProfile!.language
    //   if (this.locale === 'en') {
    //     this.locale = ''
    //   }
    // }
    if (localStorage.getItem('lang')) {
      // tslint:disable-next-line: no-non-null-assertion
      this.locale = localStorage.getItem('lang') || ''
      if (this.locale === 'en') {
        this.locale = ''
      }
    }
    // tslint:disable-next-line: no-non-null-assertion
    if (!localStorage.getItem('lang') && this.configSvc.userProfile !== null) {
      // tslint:disable-next-line: no-non-null-assertion
      if (this.configSvc.userProfile!.language === 'en') {
        // this.locale = 'en-US'
      } else {
        // tslint:disable-next-line: no-non-null-assertion
        this.locale = this.configSvc.userProfile!.language || 'en-US'
      }
    }
    // tslint:disable-next-line:no-console
    this.logger.log(this.locale)
    // this.logger.log("came here 2")

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
    //   this.logger.log(!this.configSvc.isAuthenticated)
    //   this.logger.log(refAppend)

    //   return this.router.parseUrl(`/login${refAppend}`)
    // }
    // If invalid user
    if (
      this.configSvc.userProfile === null &&
      this.configSvc.instanceConfig &&
      !Boolean(this.configSvc.instanceConfig.disablePidCheck)
    ) {
      return this.router.parseUrl(`/public/home`)
    }
    // this.logger.log("came here 3")

    /**
     * Test IF User Tnc Is Accepted
     */
    // if (!this.configSvc.hasAcceptedTnc) {
    //   if (
    //     state.url &&
    //     !state.url.includes('/app/setup/') &&
    //     !state.url.includes('/app/tnc') &&
    //     !state.url.includes('/page/home')
    //   ) {
    //     this.configSvc.userUrl = state.url
    //   }
    // if (
    //   this.configSvc.restrictedFeatures &&
    //   !this.configSvc.restrictedFeatures.has('firstTimeSetupV2')
    // ) {
    //   return this.router.parseUrl(`/app/setup/home/lang`)
    // }
    // return this.router.parseUrl(`/app/tnc`)
    // }
    /**
       * Test IF User updated the profile details
       */
    // if (!this.configSvc.profileDetailsStatus) {
    // return this.router.parseUrl('/app/user-profile/details')
    // return this.router.parseUrl('/app/user-profile/chatbot')
    // }
    if (this.configSvc.unMappedUser) {
      // this.logger.log("came here 4")

      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          // this.logger.log("came here 5")
          this.logger.log(data.profileDetails, data.profileDetails!.profileReq!.personalDetails!.dob === undefined)
          // if (data) {
          //   const userData = data.profileDetails.personalDetails
          //   if (userData.dob) {
          //     this.dobFlag = userData.dob || ''
          //   }
          // }
          // if (this.dobFlag) {
          //   return this.router.parseUrl('/page/home')
          // }
          // if (data.tcStatus && data.tcStatus === 'false') {
          //   return this.router.navigate(['app', 'new-tnc'])
          // }
          // if (data.profileDetails) {
          //   return this.router.parseUrl(`/page/home`)
          // }
          this.logger.log(data.profileDetails!.profileReq!.personalDetails)
          // this.logger.log("came here 6")

          if (data.profileDetails && data.profileDetails!.profileReq && data.profileDetails!.profileReq!.personalDetails) {
            if (data.profileDetails!.profileReq!.personalDetails.tncAccepted === "true") {
              if (data.profileDetails!.profileReq!.personalDetails!.dob !== undefined) {
                this.logger.log(data.profileDetails!.profileReq!.personalDetails!.tncAccepted)
              }
            } else {
              if (data.profileDetails!.profileReq!.personalDetails!.dob === undefined) {
                // ✅ NO language prefix in URLs - ngx-translate handles language via localStorage
                // this.logger.log('true')
                this.router.navigate(['app', 'new-tnc'])
              }
            }
          } else {
            // this.logger.log("afdssssssssssssss")
            localStorage.setItem('datanow', JSON.stringify(data))
            this.router.navigate(['app', 'new-tnc'])
          }
        },
        (_err: any) => {
        })
    }
    /**
     * Test IF User has requried role to access the page
     */
    if (requiredRoles && requiredRoles.length && this.configSvc.userRoles) {
      const requiredRolePreset = requiredRoles.some(item =>
        (this.configSvc.userRoles || new Set()).has(item),
      )

      if (!requiredRolePreset) {
        return this.router.parseUrl(`/page/home`)
      }
    }
    // this.logger.log("came here 7")

    // check if feature is restricted
    if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
      const requiredFeaturesMissing = requiredFeatures.some(item =>
        (this.configSvc.restrictedFeatures || new Set()).has(item),
      )

      if (requiredFeaturesMissing) {
        return this.router.parseUrl(`/page/home`)
      }
    }
    // this.logger.log("came here 8")

    return true
  }
}
