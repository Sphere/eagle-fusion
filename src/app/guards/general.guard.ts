import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot, Router,
  // RouterStateSnapshot,
  UrlTree,
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
    private readonly router: Router,
    private readonly configSvc: ConfigurationsService,
    private readonly userProfileSvc: UserProfileService,
    private readonly userDataCacheSvc: UserDataCacheService,
    private readonly logger: LoggerService,
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
    this.restoreUserFromCacheIfNeeded()
    this.resolveLocale()
    this.logger.log(this.locale)

    // If invalid user
    if (
      this.configSvc.userProfile === null &&
      this.configSvc.instanceConfig &&
      !Boolean(this.configSvc.instanceConfig.disablePidCheck)
    ) {
      return this.router.parseUrl(`/public/home`)
    }

    this.checkTncAcceptance()

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

    // check if feature is restricted
    if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
      const requiredFeaturesMissing = requiredFeatures.some(item =>
        (this.configSvc.restrictedFeatures || new Set()).has(item),
      )

      if (requiredFeaturesMissing) {
        return this.router.parseUrl(`/page/home`)
      }
    }

    return true
  }

  // Try to restore user data from cache if it's not already set
  // This handles the case where user data exists in sessionStorage but hasn't been loaded yet
  private restoreUserFromCacheIfNeeded() {
    if (this.configSvc.userProfile !== null) {
      return
    }
    const cachedUserData = this.userDataCacheSvc.getCachedUserData()
    if (!cachedUserData || !cachedUserData.userId) {
      return
    }
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

  private resolveLocale() {
    const lang = localStorage.getItem('lang')

    if (lang) {
      // Any locale-from-profile value would be overwritten by the localStorage value below,
      // so localStorage always takes precedence when present (matches prior behavior).
      this.locale = lang === 'en' ? '' : lang
      return
    }
    if (this.configSvc.userProfile !== null && this.configSvc.userProfile!.language !== 'en') {
      this.locale = this.configSvc.userProfile!.language || 'en-US'
    }
  }

  private checkTncAcceptance() {
    if (!this.configSvc.unMappedUser) {
      return
    }
    this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
      (data: any) => this.handleTncRegistryData(data),
      (_err: any) => {
        this.logger.error('Error retrieving user details from registry:', _err)
      })
  }

  private handleTncRegistryData(data: any) {
    const personalDetails = data.profileDetails?.profileReq?.personalDetails
    this.logger.log(data.profileDetails, personalDetails?.dob === undefined)
    this.logger.log(personalDetails)

    if (!personalDetails) {
      localStorage.setItem('datanow', JSON.stringify(data))
      this.router.navigate(['app', 'new-tnc'])
      return
    }

    if (personalDetails.tncAccepted === 'true') {
      if (personalDetails.dob !== undefined) {
        this.logger.log(personalDetails.tncAccepted)
      }
      return
    }

    if (personalDetails.dob === undefined) {
      this.router.navigate(['app', 'new-tnc'])
    }
  }
}
