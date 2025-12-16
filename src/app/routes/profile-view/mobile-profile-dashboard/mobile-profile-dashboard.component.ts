import { Component, OnInit, Inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { ConfigurationsService, ValueService, LogoutComponent, TelemetryService } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'
import { forkJoin, from } from 'rxjs'
// import * as  _ from 'lodash'
import { DomSanitizer } from '@angular/platform-browser'
import { map, mergeMap } from 'rxjs/operators'
import { ConfigService as CompetencyConfiService } from '../../competency/services/config.service'
import * as _ from './lodash'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { DOCUMENT } from '@angular/common'
import { LanguageService } from '../../../../../src/app/services/language.service'

@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss'],
})
export class MobileProfileDashboardComponent implements OnInit {
  firstName!: string
  lastName!: string
  showMobileView = false
  showAcademicElse = false
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  certificates: any = []
  imgURI: any = []
  certificateThumbnail: any = []
  photoUrl: any
  image = '/fusion-assets/icons/prof1.png'
  loader = true
  showbackButton = false
  showLogOutIcon = false
  profileData: any
  navigateTohome = true
  selectedIndex = 'personal'
  showView: any = ''
  gotData: any
  userForm: UntypedFormGroup
  userData: any
  hideData = false
  currentProfession: any
  showLogOutBtn = false
  language: any
  userInfo: any
  isCommonChatEnabled = true
  isEkshamata = false
  domain!: string

  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private contentSvc: WidgetContentService,
    private domSanitizer: DomSanitizer,
    private valueSvc: ValueService,
    private CompetencyConfiService: CompetencyConfiService,
    private languageService: LanguageService,
    // private readonly _renderer2: Renderer,
    @Inject(DOCUMENT) private _document: Document,
    private telemetrySvc: TelemetryService

  ) {
    this.gotData = this.contentSvc.workMessage.subscribe(async (data: any) => {
      console.log(data)
      if (data.type === 'work' || data.type === 'academic') {
        if (data.back === true || data.edit === 'save') {
          this.showView = ''
        } else {
          this.showView = await data
        }
      }
      if (data.type === 'onListPage') {
        this.hideData = false
        this.selectedIndex = 'personal'
        this.selectedIndex = ''
      }
      if (data.type === 'back' && this.showMobileView) {
        this.hideData = false
        this.selectedIndex = 'personal'
        this.selectedIndex = ''
      }
      // sessionStorage.removeItem('academic')
      // sessionStorage.removeItem('currentWindow')
    })
    this.userForm = new UntypedFormGroup({
      language: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.domain = window.location.hostname
    if (this.configSvc.hostedInfo || this.domain.includes('ekshamata')) {
      this.isEkshamata = true
    }
    if (sessionStorage.getItem('currentWindow')) {
      sessionStorage.removeItem('currentWindow')
    }
    this.userProfileSvc.updateuser$.pipe().subscribe(item => {
      if (item) {
        // this.selectedIndex = 'academic'
        this.getUserDetails()
      }
    })
    this.contentSvc.fetchGeneralAndRcCertificates().pipe().subscribe((res: any) => {
      this.processCertiFicate(res)
    })

    forkJoin([this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
    this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id)]).pipe().subscribe((res: any) => {

      console.log(res)
      this.loader = false
      this.profileData = _.get(res[0], 'profileDetails.profileReq')
      this.userInfo = res[0]
      const lang = (res[0] && res[0].profileDetails && res[0].profileDetails!.preferences && res[0].profileDetails!.preferences!.language !== undefined) ? res[0].profileDetails.preferences.language : location.href.includes('/hi/') ? 'hi' : 'en'
      this.language = lang
      this.setAcademicDetail(res[0])
      // this.processCertiFicate(res[1])
    })

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showMobileView = isXSmall
      if (isXSmall) {
        this.selectedIndex = ''
        this.showbackButton = true
        this.showLogOutIcon = true
        this.showLogOutBtn = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
        this.showLogOutBtn = true
      }
    })

    // this.CompetencyConfiService.setConfig(this.profileData)
  }
  changeFunction(text: string) {
    if (text === 'organization') {
      sessionStorage.setItem('currentWindow', 'organization')
      this.showView = ''
      sessionStorage.removeItem('work')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text == 'language') {
      window.scroll(0, 0)
      sessionStorage.setItem('currentWindow', 'language')
      this.showLogOutIcon = false
      this.getUserDetails()
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text === 'personal') {
      sessionStorage.setItem('currentWindow', 'personal')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text && this.showMobileView) {
      console.log(text, 'mobileview', this.showMobileView)
      this.hideData = true
    }
    if (text === 'academic') {
      sessionStorage.setItem('currentWindow', 'education')
    }

    if (text === 'certificates') {
      // this.hideData = true
      window.scroll(0, 0)
      sessionStorage.setItem('currentWindow', 'certificates')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
  }

  showChat() {
    const el = this._document.getElementById('widget')
    if (el) {
      el.style.display = 'block'
      console.log("this.userData", this.profileData)
      el.setAttribute('userId', this.profileData.userId)
      el.setAttribute('firstName', this.profileData.personalDetails.firstname)
      el.setAttribute('lastName', this.profileData.personalDetails.surname)

      setTimeout(() => {
        const btn = el.querySelector('button') as HTMLElement
        if (btn) {
          const ariaLabel = btn.getAttribute('aria-label')
          if (ariaLabel === 'Open chat') {
            btn.click()
            console.log('Chat opened')
          }
        } else {
          console.warn('Button not found inside widget yet')
        }
      }, 300)
    }
  }

  showSocialChats() {
    try {
      setTimeout(() => {
        this.isCommonChatEnabled = false

      }, 300)
    } catch (error) {
      console.error('Error showing social chats:', error)
    }
  }
  backToChatIcon() {
    try {
      this.isCommonChatEnabled = true
      const el = this._document.getElementById('widget')
      if (el) {
        el.style.display = 'none'
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error)
    }
  }
  logout() {
    this.telemetrySvc.getTelemetryConfig()
    this.telemetrySvc.interact('clicked', 'logout-clicked', 'profile', {}, { id: this.userInfo.profileDetails.profileReq.id, type: 'user' })
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
  processCertiFicate(data: any) {

    const certificateIdArray = _.map(_.flatten(_.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), 'identifier')
    this.formatAllRequest(data)
    from(certificateIdArray).pipe(
      map(certId => {
        this.certificateThumbnail.push({ identifier: certId })
        return certId
      }),
      mergeMap(certId =>
        this.contentSvc.getCertificateAPI(certId)
      )
    ).subscribe(() => {
      setTimeout(() => {
        this.contentSvc.updateValue$.subscribe((res: any) => {
          if (res) {
            _.forEach(this.certificates, cvalue => {
              if (res[cvalue.identifier]) {
                cvalue['image'] = this.domSanitizer.bypassSecurityTrustUrl(res[cvalue.identifier])
                cvalue['printUri'] = res[cvalue.identifier]
              }
            })
          }
        })
      }, 500)
    })

  }
  formatAllRequest(data: any) {
    this.certificates = _.concat(this.formateRequest(data), this.rcCertiface(data))
  }

  formateRequest(data: any) {
    const issuedCertificates = _.reduce(_.flatten(_.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), (result: any, value) => {
      result.push({
        identifier: value.identifier,
        name: value.name,
        rcCertiface: false
      })
      return result
    }, [])
    return issuedCertificates
  }
  rcCertiface(data: any) {
    if (data.sunbirdRcCertificates && data.sunbirdRcCertificates.length > 0) {
      return _.reduce(
        data.sunbirdRcCertificates,
        (result: any[], certificate: any) => {
          result.push({
            name: certificate.certificateName,
            downloadUrl: certificate.certificateDownloadUrl,
            image: certificate.thumbnail,
            rcCerticate: true
          })
          return result
        },
        []
      )
    } else {
      return []
    }
  }
  openAboutDialog() {
    if (this.userProfileSvc.isBackgroundDetailsFilled(this.profileData)) {
      const dialogRef = this.dialog.open(MobileAboutPopupComponent, {
        width: '312px',
        height: '369px',
        data: this.userProfileData.personalDetails.about ? this.userProfileData.personalDetails.about : '',
      })

      dialogRef.afterClosed().subscribe(result => {
        // tslint:disable-next-line: no-console
        console.log('The dialog was closed', result)
      })
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `/page/home` } })
    }
  }
  assignProfession(data: any) {
    this.currentProfession = data
  }
  assignUserName(data: any) {
    if (data.firstname)
      this.userProfileData.personalDetails.firstname = data.firstname
    if (data.surname)
      this.userProfileData.personalDetails.surname = data.surname
  }
  setAcademicDetail(data: any) {
    if (data) {
      this.userProfileData = data.profileDetails.profileReq
      if (this.userProfileData
        && this.userProfileData.professionalDetails
        && this.userProfileData.professionalDetails.length > 0) {
        this.currentProfession = this.userProfileData.professionalDetails[0].profession
      } else {
        this.currentProfession = 'Not specified'
      }
      //this.currentProfession = this.userProfileData.professionalDetails[0].profession
      if (_.get(this.userProfileData, 'personalDetails')) {
        this.photoUrl = this.userProfileData.personalDetails.photo
      } else {
        this.photoUrl = this.userProfileData.photo
      }

      if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
        this.academicsArray = this.userProfileData.academics
      }
      this.CompetencyConfiService.setConfig(this.userProfileData, data.profileDetails)
    }
  }
  storeLanguage(lang: string) {
    // Update language using LanguageService
    this.languageService.setLanguage(lang)

    // Update user profile in backend
    const obj = {
      preferences: {
        language: lang,
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
    }

    const userdata = Object.assign(this.userInfo.profileDetails, obj)
    userdata.profileReq.personalDetails["profileLocation"] = 'sphere-web/mobile-profile-dashboard-store-language'

    const reqUpdate = {
      request: {
        userId: userdata.profileReq.id,
        profileDetails: {
          ...userdata, profileLocation: 'sphere-web/mobile-profile-dashboard-store-language'
        },
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(result => {
      console.log('Language updated in profile:', result)
      // No page reload needed anymore!
    },
      (error) => {
        console.error('Error updating language:', error)
      })
  }
  saveLanguage(form: any) {
    console.log('Saving language preference:', form.value)

    // Update language using LanguageService
    this.languageService.setLanguage(form.value.language)

    const obj = {
      preferences: {
        language: form.value.language,
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
    }
    const userdata = Object.assign(this.userData['profileDetails'], obj)

    const reqUpdate = {
      request: {
        userId: this.userData.identifier,
        profileDetails: { ...userdata, profileLocation: 'sphere-web/mobile-profile-dashboard-save-language' },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(result => {
      console.log('Language saved successfully:', result)
      // No page reload needed! LanguageService handles the UI update
    },
      (error) => {
        console.error('Error saving language:', error)
      })
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        async (data: any) => {
          if (data) {
            this.loader = false
            this.userProfileData = await data.profileDetails.profileReq
            this.userData = await data
            //this.currentProfession = this.userProfileData.professionalDetails[0].profession
            if (this.userProfileData
              && this.userProfileData.professionalDetails
              && this.userProfileData.professionalDetails.length > 0) {
              this.currentProfession = this.userProfileData.professionalDetails[0].profession
            } else {
              this.currentProfession = 'Not specified'
            }
            const lang = (data && data.profileDetails && data.profileDetails!.preferences && data.profileDetails!.preferences!.language !== undefined) ? data.profileDetails.preferences.language : location.href.includes('/hi/') ? 'hi' : 'en'
            this.language = lang
            console.log(lang, 'oo')
            this.userForm.patchValue({ language: lang })
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
            if (this.userProfileData.personalDetails.photo) {
              this.photoUrl = this.userProfileData.personalDetails.photo
            }
            if (this.userProfileData.personalDetails.firstname) {
              this.firstName = this.userProfileData.personalDetails.firstname
              this.lastName = this.userProfileData.personalDetails.surname
            }

          }
        })
    }
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px',
    })
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line: no-console
      console.log('The dialog was closed', result)
    })
  }

  eductionEdit() {
    this.navigate(`app/education-list`)
  }

  workInfoEdit() {
    this.navigate(`app/workinfo-list`)
  }

  personalDetailEdit() {
    this.navigate('app/personal-detail-edit')
  }

  navigate(navigateUrl: any) {
    if (this.userProfileSvc.isBackgroundDetailsFilled(this.profileData)) {
      this.router.navigate([navigateUrl])
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `/page/home` } })
    }
  }

  openCompetency(event: any) {
    console.log(event)
    this.router.navigate([`app/user/self-assessment`])
  }
  ngOnDestroy() {
    if (this.gotData) {
      this.gotData.unsubscribe()
    }
  }

  openCompetencyDashboard(event: any) {
    console.log(event)
    this.router.navigate([`app/user/competency`])
  }
}
