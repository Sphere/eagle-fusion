import { Component, OnInit, Inject, HostListener } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import {
  ConfigurationsService,
  ValueService,
  LogoutComponent,
  TelemetryService,
} from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'
import { forkJoin, from } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { map, mergeMap } from 'rxjs/operators'
import { ConfigService as CompetencyConfiService } from '../../competency/services/config.service'
import * as _ from './lodash'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { DOCUMENT } from '@angular/common'
import { LanguageService } from '../../../../../src/app/services/language.service'
import { PlaylistService } from '../../../services/playlist.service'
import { LeadershipDashboardComponent } from '../leadership-dashboard/leadership-dashboard.component'

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
  loader = true
  showbackButton = false
  showLogOutIcon = false
  profileData: any
  navigateTohome = true
  selectedIndex = ''
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
  config: any
  uiConfig: any
  personalInfo: any
  menuItems: any
  isMobileView = false
  selectedIndexData: any
  rank = 0
  totalUsers = 0
  points = 0
  displayLeadership = false
  leaderBoardConfig: any
  leaderboardData: any[] = []
  currentUser: any
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
    @Inject(DOCUMENT) private _document: Document,
    private telemetrySvc: TelemetryService,
    private plylsSvc: PlaylistService
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
    })
    this.userForm = new UntypedFormGroup({
      language: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.detectScreen()
    this.setupMenuItems()
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

    forkJoin([
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
      this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id),
    ])
      .pipe()
      .subscribe((res: any) => {
        console.log(res)
        this.loader = false
        this.profileData = _.get(res[0], 'profileDetails.profileReq')
        this.userInfo = res[0]
        const lang =
          res[0] &&
            res[0].profileDetails &&
            res[0].profileDetails!.preferences &&
            res[0].profileDetails!.preferences!.language !== undefined
            ? res[0].profileDetails.preferences.language
            : location.href.includes('/hi/')
              ? 'hi'
              : 'en'
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

    console.log('this.configSvc.unMappedUser', this.configSvc.unMappedUser)
    if (this.hasRequiredLeaderboardDetails()) {
      this.getLeaderBoardList()
    }
  }


  @HostListener('window:resize')
  onResize() {
    this.detectScreen()
  }

  private detectScreen(): void {
    const prev = this.isMobileView
    this.isMobileView = window.innerWidth <= 768

    if (prev !== this.isMobileView) {
      console.log('📱 Screen mode changed →', this.isMobileView ? 'Mobile' : 'Desktop')

      // Your UI reactions on screen change
      if (this.isMobileView) {
        this.showbackButton = true
        this.hideData = false
      } else {
        this.showbackButton = false
        this.hideData = false
      }

      this.setupMenuItems()   // reapply config ordering
    }
  }

  async setupMenuItems() {
    let res
    if (this.plylsSvc.getSelectedTab() == 'accountTab') {
      res = this.plylsSvc.selectedTabConfig()
    } else {
      res = this.plylsSvc.bodyConfig()?.accountTab
    }

    if (res == '') {
      res = await this.plylsSvc.loadPlaylistData()
      this.config = res?.LAYOUT_BODY?.sections?.accountTab
    } else {
      this.config = res
    }
    const orderList = this.showMobileView ? this.config?.mobOrderList : this.config?.webOrderList
    this.menuItems = orderList?.map(id => this.config?.menuItems?.find(item => item.id === id)).filter(Boolean) || []

    // remove first and last item
    this.uiConfig = this.menuItems.length > 2 ? this.menuItems.slice(1, -1) : []
    console.log("res ", res, this.config, this.uiConfig)
    this.selectedIndex = this.uiConfig[0]?.name
    this.selectedIndexData = this.uiConfig[0]?.data
  }

  hasRequiredLeaderboardDetails(): boolean {
    const unMappedUser = this.configSvc.unMappedUser
    const userProfile = this.configSvc.userProfile

    // Check if all required fields are present
    const hasUserId = userProfile && userProfile.userId
    const hasProfessionalDetails =
      unMappedUser?.profileDetails?.profileReq?.professionalDetails &&
      unMappedUser.profileDetails.profileReq.professionalDetails.length > 0
    const hasDesignation =
      hasProfessionalDetails &&
      unMappedUser.profileDetails.profileReq.professionalDetails[0].designation
    const hasRootOrgId = unMappedUser && unMappedUser.rootOrgId
    const hasInstituteName =
      hasProfessionalDetails &&
      unMappedUser.profileDetails.profileReq.professionalDetails[0].instituteName

    return hasUserId && hasProfessionalDetails && hasDesignation && hasRootOrgId && hasInstituteName
  }
  changeFunction(item: any): void {
    if (!item?.name) return

    const removeOnListPage = () => {
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }

    const setWindow = (key: string) => {
      sessionStorage.setItem('currentWindow', key)
      removeOnListPage()
    }
    this.selectedIndexData = item?.data
    switch (item?.name) {
      case 'organization':
        setWindow('organization')
        this.showView = ''
        sessionStorage.removeItem('work')
        break

      case 'language':
        window.scroll(0, 0)
        setWindow('language')
        this.showLogOutIcon = false
        this.getUserDetails()
        break

      case 'personal':
        setWindow('personal')
        break

      case 'academic':
        setWindow('education')
        break

      case 'certificates':
        window.scroll(0, 0)
        this.contentSvc.fetchGeneralAndRcCertificates().pipe().subscribe((res: any) => {
          this.processCertiFicate(res)
        })
        setWindow('certificates')
        break
    }

    if (this.showMobileView) {
      console.log(item?.text, 'mobileview', this.showMobileView)
      this.hideData = true
    }
  }

  showChat() {
    const el = this._document.getElementById('widget')
    if (el) {
      el.style.display = 'block'
      console.log('this.userData', this.profileData)
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
    this.telemetrySvc.interact(
      'clicked',
      'logout-clicked',
      'profile',
      {},
      { id: this.userInfo.profileDetails.profileReq.id, type: 'user', version: '', rollup: {} },
    )
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
  processCertiFicate(data: any) {
    const certificateIdArray = _.map(
      _.flatten(
        _.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
          return certificate.length > 0
        }),
      ),
      'identifier',
    )
    this.formatAllRequest(data)
    from(certificateIdArray)
      .pipe(
        map(certId => {
          this.certificateThumbnail.push({ identifier: certId })
          return certId
        }),
        mergeMap(certId => this.contentSvc.getCertificateAPI(certId)),
      )
      .subscribe(() => {
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
    const issuedCertificates = _.reduce(
      _.flatten(
        _.filter(_.map(data.generalCertificates, 'issuedCertificates'), certificate => {
          return certificate.length > 0
        }),
      ),
      (result: any, value) => {
        result.push({
          identifier: value.identifier,
          name: value.name,
          rcCertiface: false,
        })
        return result
      },
      [],
    )
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
            rcCerticate: true,
          })
          return result
        },
        [],
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
        data: this.personalInfo.about ? this.personalInfo.about : '',
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
      this.personalInfo.firstname = data.firstname
    if (data.surname)
      this.personalInfo.surname = data.surname
  }
  setAcademicDetail(data: any) {
    if (data) {
      this.userProfileData = data.profileDetails.profileReq
      this.personalInfo = this.userProfileData?.personalDetails
      if (this.userProfileData?.professionalDetails?.length > 0) {
        this.currentProfession = this.userProfileData.professionalDetails[0].profession
      } else {
        this.currentProfession = 'Not specified'
      }
      //this.currentProfession = this.userProfileData.professionalDetails[0].profession
      if (_.get(this.userProfileData, 'personalDetails')) {
        this.photoUrl = this.personalInfo.photo
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
    userdata.profileReq.personalDetails['profileLocation'] =
      'sphere-web/mobile-profile-dashboard-store-language'

    const reqUpdate = {
      request: {
        userId: userdata.profileReq.id,
        profileDetails: {
          ...userdata,
          profileLocation: 'sphere-web/mobile-profile-dashboard-store-language',
        },
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      result => {
        console.log('Language updated in profile:', result)
        // No page reload needed anymore!
      },
      error => {
        console.error('Error updating language:', error)
      },
    )
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
        profileDetails: {
          ...userdata,
          profileLocation: 'sphere-web/mobile-profile-dashboard-save-language',
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      result => {
        console.log('Language saved successfully:', result)
        window.location.assign(`${location.origin}/app/profile-view`)
      },
      error => {
        console.error('Error saving language:', error)
      },
    )
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc
        .getUserdetailsFromRegistry(this.configSvc.unMappedUser.id)
        .subscribe(async (data: any) => {
          if (data) {
            this.loader = false
            this.userProfileData = await data.profileDetails.profileReq
            this.userData = await data
            if (this.userProfileData?.professionalDetails?.length > 0) {
              this.currentProfession = this.userProfileData.professionalDetails[0].profession
            } else {
              this.currentProfession = 'Not specified'
            }
            const lang =
              data &&
                data.profileDetails &&
                data.profileDetails!.preferences &&
                data.profileDetails!.preferences!.language !== undefined
                ? data.profileDetails.preferences.language
                : location.href.includes('/hi/')
                  ? 'hi'
                  : 'en'
            this.language = lang
            console.log(lang, 'oo')
            this.userForm.patchValue({ language: lang })
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
            if (this.personalInfo.photo) {
              this.photoUrl = this.personalInfo.photo
            }
            if (this.personalInfo.firstname) {
              this.firstName = this.personalInfo.firstname
              this.lastName = this.personalInfo.surname
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
  getLeaderBoardList() {
    console.log('this.configsvc', this.configSvc.unMappedUser)
    const request = {
      userId: this.configSvc.userProfile.userId,
      filters: {
        profession:
          this.configSvc.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]
            .designation,
        rootOrgId: this.configSvc.unMappedUser.rootOrgId,
        professional_institute_name:
          this.configSvc.unMappedUser?.profileDetails?.profileReq?.professionalDetails[0]?.instituteName
            ?.split(',')
            .join(''),
        background: 'Student',
      },
      limit: 10,
      offset: 0,
    }

    this.userProfileSvc.getLeaderBoardData(request).subscribe((res: any) => {
      this.totalUsers = res?.result?.count || 0
      this.leaderboardData = res?.result?.content?.leaderboardList || []
      this.currentUser = res?.result?.content?.activeUserDetails
    })
  }

  openCompetencyDashboard(event: any) {
    console.log(event)
    this.router.navigate([`app/user/competency`])
  }
  async openLeaderboard() {
    const isMobileView = window.innerWidth < 768

    this.dialog.open(LeadershipDashboardComponent, {
      width: isMobileView ? '100%' : '35%',
      maxHeight: isMobileView ? '100vh' : '85vh',
      maxWidth: isMobileView ? '100vw' : '800px',
      height: isMobileView ? '100%' : 'auto',
      panelClass: 'leadership-dashboard-dialog',
      data: {
        leaderboardData: this.leaderboardData,
        currentUser: this.currentUser,
      },
    })
  }
}
