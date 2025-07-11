import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  // RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard implements CanActivate {
  dobFlag = false
  isXSmall = false
  locale = ''
  constructor(private router: Router, private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const requiredFeatures = (next.data && next.data.requiredFeatures) || []
    const requiredRoles = (next.data && next.data.requiredRoles) || []

    return await this.shouldAllow<boolean | UrlTree>(requiredFeatures, requiredRoles)
  }

  private async shouldAllow<T>(
    // state: RouterStateSnapshot,
    requiredFeatures: string[],
    requiredRoles: string[],
  ): Promise<T | UrlTree | boolean> {
    // console.log("came here 1")
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
    console.log(this.locale)
    // console.log("came here 2")

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
      return this.router.parseUrl(`/public/home`)
    }
    // console.log("came here 3")

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
      // console.log("came here 4")

      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          // console.log("came here 5")
          console.log(data.profileDetails, data.profileDetails!.profileReq!.personalDetails!.dob === undefined)
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
          console.log(data.profileDetails!.profileReq!.personalDetails)
          // console.log("came here 6")

          if (data.profileDetails && data.profileDetails!.profileReq && data.profileDetails!.profileReq!.personalDetails) {
            if (data.profileDetails!.profileReq!.personalDetails.tncAccepted === "true") {
              if (data.profileDetails!.profileReq!.personalDetails!.dob !== undefined) {
                console.log(data.profileDetails!.profileReq!.personalDetails!.tncAccepted)
              }
            } else {
              if (data.profileDetails!.profileReq!.personalDetails!.dob === undefined) {
                // console.log('true')
                if (localStorage.getItem('preferedLanguage') && (sessionStorage.getItem('fromOTPpage'))) {
                  let data: any
                  let lang: any
                  data = localStorage.getItem('preferedLanguage')
                  lang = JSON.parse(data)
                  if (lang.id) {
                    lang = lang.id !== 'en' ? lang.id : ''
                    let url4 = `${document.baseURI}`
                    if (url4.includes('hi')) {
                      lang = ''
                    }
                    const url = lang === '' ? `${lang}app/new-tnc` : `${lang}/app/new-tnc`
                    console.log(url)
                    location.href = `${url}`
                    //this.router.navigate([url, 'new-tnc'])
                  }
                  //this.router.navigate(['app', 'new-tnc'])
                } else {
                  // console.log('alerr')
                  this.router.navigate(['app', 'new-tnc'])
                }
              }
            }
          } else {
            // console.log("afdssssssssssssss")
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
    // console.log("came here 7")

    // check if feature is restricted
    if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
      const requiredFeaturesMissing = requiredFeatures.some(item =>
        (this.configSvc.restrictedFeatures || new Set()).has(item),
      )

      if (requiredFeaturesMissing) {
        return this.router.parseUrl(`/page/home`)
      }
    }
    // console.log("came here 8")

    return true
  }
}
