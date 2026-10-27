import { Component, OnInit, Inject, effect, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import {
  ConfigurationsService, ValueService, LogoutComponent, TelemetryService, LoggerService, SafeResourceUrlService,
} from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
// import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'
import { from, of, forkJoin, Observable, Subscription } from 'rxjs'
import { map, mergeMap, finalize, catchError, take } from 'rxjs/operators'
import { ConfigService as CompetencyConfiService } from '../../competency/services/config.service'
import * as _ from './lodash'
import { FormControl, FormGroup } from '@angular/forms'
import { DOCUMENT } from '@angular/common'
import { LanguageService } from '../../../../../src/app/services/language.service'
import { PlaylistService } from '../../../services/playlist.service'
import { LeadershipDashboardComponent } from '../leadership-dashboard/leadership-dashboard.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { ThemeService } from '../../../services/theme.service'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'
import {
  MenuItemConfig,
  MenuConfiguration,
  Certificate,
  CertificateImage,
  Academic,
  UserRegistryData,
  WorkMessage,
  CertificateData,
  LeaderboardUser,
  ActiveUserDetails,
  OrgDetails,
  UserProfileRequest,
} from './mobile-profile-dashboard.model'
import { getPortalHost } from '../../../constants/portal'

@Component({
  standalone: false,
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss'],

})
export class MobileProfileDashboardComponent implements OnInit, OnDestroy {
  firstName!: string
  lastName!: string
  showMobileView = false
  showAcademicElse = false
  userProfileData!: UserProfileRequest
  academicsArray: Academic[] = []
  certificates: Certificate[] = []
  competencyCertificates: Certificate[] = []
  isCompetencyLoading = false
  // A failed API must not read as "you have no certificates" - the template shows Retry instead
  courseCertificatesFailed = false
  competencyCertificatesFailed = false
  imgURI: string[] = []
  // Object URLs minted for certificate thumbnails; revoked in ngOnDestroy so they do not
  // leak for the lifetime of the tab.
  certObjectUrls: string[] = []
  certificateThumbnail: CertificateImage[] = []
  photoUrl: string | null = null
  loader = true
  showbackButton = false
  showLogOutIcon = false
  profileData: UserRegistryData | null = null
  navigateTohome = true
  selectedIndex = 'personal'
  showView: WorkMessage | string = ''
  gotData!: Subscription
  userForm: FormGroup
  userData!: UserRegistryData
  hideData = false
  currentProfession: string | null = null
  showLogOutBtn = false
  language: string | null = null
  userInfo!: UserRegistryData
  isCommonChatEnabled = true
  isEkshamata = false
  domain!: string
  config!: MenuConfiguration
  uiConfig: MenuItemConfig[] = []
  menuItems: MenuItemConfig[] = []
  isMobileView = false
  selectedIndexData: any
  rank = 0
  totalUsers = 0
  points = 0
  displayLeadership = false
  leaderBoardConfig: any
  leaderboardData: LeaderboardUser[] = []
  currentUser!: ActiveUserDetails
  selectedIndextitle!: string
  earnedBadges$!: Observable<any>
  count = 3
  isLoading = false
  isDark = this.themeService.isDarkMode
  orgDet!: OrgDetails
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly router: Router,
    public readonly dialog: MatDialog,
    private readonly userProfileSvc: UserProfileService,
    private readonly contentSvc: WidgetContentService,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly valueSvc: ValueService,
    private readonly CompetencyConfiService: CompetencyConfiService,
    private readonly languageService: LanguageService,
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly telemetrySvc: TelemetryService,
    private readonly plylsSvc: PlaylistService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly logger: LoggerService,
    private readonly translate: TranslateService,
    private readonly themeService: ThemeService
  ) {
    this.userForm = new FormGroup({
      language: new FormControl(),
    })

    effect(() => {
      if (this.valueSvc.isMobile()) {
        this.showMobileView = true
        this.showbackButton = true
        this.hideData = false
        this.selectedIndex = ''
        this.showLogOutIcon = true
        this.showLogOutBtn = false
      } else {
        this.showMobileView = false
        this.showbackButton = false
        this.selectedIndex = 'personal'
        this.hideData = false
        this.showLogOutIcon = false
        this.showLogOutBtn = true
      }
      this.setupMenuItems()
    })

    this.earnedBadges$ = this.plylsSvc.earnedBadges$
  }

  async setupMenuItems(): Promise<void> {
    let res: MenuConfiguration | undefined
    if (this.plylsSvc.getSelectedTab() == 'accountTab') {
      res = this.plylsSvc.selectedTabConfig()
    } else {
      // sections() normalizes both LAYOUT_BODY response shapes (see
      // PlaylistService.normalizeLayoutBody) into `{ sections: { accountTab: ... } }`.
      res = this.plylsSvc.sections()?.accountTab
    }

    if (!res || (typeof res === 'object' && Object.keys(res).length === 0)) {
      const playlistData = await this.plylsSvc.loadPlaylistData()
      this.config = playlistData?.LAYOUT_BODY?.sections?.accountTab
    } else {
      this.config = res
    }
    this.orgDet = this.plylsSvc.orgDetails()
    const orderList = this.showMobileView ? this.config?.mobOrderList : this.config?.webOrderList
    this.menuItems = orderList?.map(id => this.config?.menuItems?.find(item => item.id === id)).filter(Boolean) || []

    // remove first and last item
    this.uiConfig = this.menuItems.length > 2 ? this.menuItems.slice(1, -1) : []
    this.logger.log("res ", res, this.config, this.uiConfig)
    this.selectedIndex = this.isEkshamata ? this.uiConfig[1]?.name : this.uiConfig[0]?.name
    this.selectedIndexData = this.isEkshamata ? this.uiConfig[1]?.data : this.uiConfig[0]?.data
    this.selectedIndextitle = this.isEkshamata ? this.uiConfig[1]?.text : this.uiConfig[0]?.text
    this.cdr.detectChanges()
  }

  private subscribeToWorkMessage(): void {
    this.gotData = this.contentSvc.workMessage.subscribe((data: WorkMessage) => {
      this.logger.log(data)
      if (data.type === 'work' || data.type === 'academic') {
        if (data.back === true || data.edit === 'save') {
          this.showView = ''
        } else {
          this.showView = data
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
  }

  ngOnInit(): void {
    this.subscribeToWorkMessage()
    this.setupMenuItems()
    this.domain = getPortalHost()
    if (this.configSvc.hostedInfo || this.domain.includes('ekshamata')) {
      this.isEkshamata = true
    }
    if (sessionStorage.getItem('currentWindow')) {
      sessionStorage.removeItem('currentWindow')
    }
    this.userProfileSvc.updateuser$.pipe().subscribe(item => {
      if (item) {
        this.getUserDetails()
      }
    })

    this.getUserDetails()

    this.logger.log('this.configSvc.unMappedUser', this.configSvc.unMappedUser)
    if (this.hasRequiredLeaderboardDetails()) {
      this.getLeaderBoardList()
    }
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

    return hasUserId && hasProfessionalDetails && hasDesignation && hasRootOrgId && hasInstituteName && this.isEkshamata
  }

  changeFunction(item: MenuItemConfig): void {
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
    this.selectedIndextitle = item?.text
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
        this.loadCertificates()
        setWindow('certificates')
        break
    }
    this.cdr.detectChanges()

    if (this.showMobileView) {
      this.logger.log(item?.text, 'mobileview', this.showMobileView)
      this.hideData = true
    }
  }

  showChat(): void {
    const el = this._document.getElementById('widget')
    if (el) {
      el.style.display = 'block'
      this.logger.log("this.userData", this.profileData)
      el.setAttribute('userId', this.profileData.userId)
      el.setAttribute('firstName', this.profileData?.profileDetails?.profileReq?.personalDetails?.firstname)
      el.setAttribute('lastName', this.profileData?.profileDetails?.profileReq?.personalDetails?.surname)

      setTimeout(() => {
        const btn = el.querySelector('button') as HTMLElement
        if (btn) {
          const ariaLabel = btn.getAttribute('aria-label')
          if (ariaLabel === 'Open chat') {
            btn.click()
            this.logger.log('Chat opened')
          }
        } else {
          this.logger.warn('Button not found inside widget yet')
        }
      }, 300)
    }
  }

  showSocialChats(event?: Event): void {
    try {
      event?.preventDefault()
      event?.stopPropagation()
      this.logger.log('clicked', this.isCommonChatEnabled)
      this.isCommonChatEnabled = false
    } catch (error) {
      this.logger.error('Error showing social chats:', error)
    }
  }
  backToChatIcon(): void {
    try {
      this.isCommonChatEnabled = true
      const el = this._document.getElementById('widget')
      if (el) {
        el.style.display = 'none'
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      this.logger.log(error)
    }
  }
  logout(): void {
    this.telemetrySvc.getTelemetryConfig()
    this.telemetrySvc.interact('clicked', 'logout-clicked', 'profile', {}, { id: this.userInfo.profileDetails.profileReq.id, type: 'user', version: "", rollup: {} })
    this.dialog.open<LogoutComponent>(LogoutComponent, {
      panelClass: 'logout-dialog-container',
    })
  }
  processCertiFicate(data: CertificateData): Observable<any> {
    this.formatAllRequest(data)
    // Download only the certificates that survived formateRequest, so a superseded legacy
    // certificate is neither rendered nor fetched (its v2 download returns 500).
    const certificateIdArray = this.certificates
      .filter(certificate => certificate.rcCertiface === false)
      .map(certificate => certificate.identifier)

    if (certificateIdArray.length === 0) {
      // Return a completed observable if no certificates
      return from([true])
    }

    return from(certificateIdArray).pipe(
      map(certId => {
        this.certificateThumbnail.push({ identifier: certId })
        return certId
      }),
      mergeMap(certId =>
        // Isolate each download. Without this, one failing certificate errors the whole
        // stream, mergeMap unsubscribes every in-flight request, and none of the
        // successful downloads reach updateValue$ - so every card loses its image and
        // renders as nothing. One bad certificate should cost one certificate.
        this.contentSvc.getCertificateAPI(certId).pipe(
          catchError((err: any) => {
            this.logger.error('[MobileProfileDashboard] certificate download failed: ' + certId, err)
            return of(null)
          })
        )
      ),
      finalize(() => {
        this.contentSvc.updateValue$.pipe(take(1)).subscribe((res: any) => {
          if (res) {
            _.forEach(this.certificates, cvalue => {
              if (res[cvalue.identifier]) {
                // Certificates arrive as data:image/svg+xml, which sanitizeUrl() rejects - it would
                // return null and every card would render with an empty image. Since rendering
                // moved to sunbird-rc they can also arrive as raw SVG markup, which sanitizeImageSrc()
                // would wrongly accept as a relative URL and the <img> would fail to load, so run
                // it through toImageSource() first.
                const src = this.safeResourceUrlSvc.toImageSource(res[cvalue.identifier], this.certObjectUrls)
                cvalue['image'] = this.safeResourceUrlSvc.sanitizeImageSrc(src)
                cvalue['printUri'] = src
              }
            })
            this.cdr.detectChanges()
          }
        })
      })
    )
  }
  trackByCertificate(_index: number, certificate: Certificate): string {
    return certificate.identifier
  }

  get certificatesFailed(): boolean {
    return this.courseCertificatesFailed || this.competencyCertificatesFailed
  }

  loadCertificates(): void {
    this.loadCourseCertificates()
    this.loadCompetencyCertificates()
  }

  loadCourseCertificates(): void {
    this.isLoading = true
    this.courseCertificatesFailed = false
    this.contentSvc.fetchGeneralAndRcCertificates().pipe(
      mergeMap((res: CertificateData) => this.processCertiFicate(res))
    ).subscribe({
      next: () => {
        this.logger.log('[MobileProfileDashboard] Certificate processing completed')
        this.loader = false
        this.cdr.detectChanges()
      },
      error: (err: any) => {
        this.logger.error('[MobileProfileDashboard] Error processing certificates:', err)
        this.certificates = []
        this.courseCertificatesFailed = true
        this.isLoading = false
        this.loader = false
        this.cdr.detectChanges()
      },
    })
  }

  // Status lists every competency the learner is tracked against; only GENERATED ones have a
  // certificate, and its URL comes from the download API. Each download is isolated so one
  // failure drops one certificate, not the tab.
  loadCompetencyCertificates(): void {
    const userId = this.configSvc.userProfile?.userId
    if (!userId) {
      this.competencyCertificates = []
      return
    }
    this.isCompetencyLoading = true
    this.competencyCertificatesFailed = false
    this.contentSvc.fetchCompetencyCertificateStatus(userId).pipe(
      mergeMap((statusList: any[]) => {
        const generated = (statusList || []).filter(item => item?.competencyId && item.status === 'GENERATED')
        if (generated.length === 0) {
          return of([])
        }
        return forkJoin(generated.map(item =>
          this.contentSvc.fetchCompetencyCertificate(userId, item.competencyId).pipe(
            catchError(err => {
              this.logger.error('[MobileProfileDashboard] competency certificate download failed: ' + item.competencyId, err)
              return of(null)
            })
          )
        ))
      }),
      finalize(() => {
        this.isCompetencyLoading = false
        this.cdr.detectChanges()
      })
    ).subscribe({
      next: (certs: any[]) => {
        this.competencyCertificates = this.mapCompetencyCertificates(certs)
      },
      error: (err: any) => {
        this.logger.error('[MobileProfileDashboard] Error loading competency certificates:', err)
        this.competencyCertificates = []
        this.competencyCertificatesFailed = true
      },
    })
  }

  mapCompetencyCertificates(certs: any[]): Certificate[] {
    const label = this.translate.instant('Competency')
    return (certs || [])
      .filter(cert => cert?.certificateUrl)
      .map(cert => ({
        identifier: `competency-${cert.competencyId}`,
        name: `${label} ${cert.competencyId}`,
        downloadUrl: cert.certificateUrl,
        image: cert.certificateUrl,
        rcCerticate: true,
      }))
  }

  formatAllRequest(data: CertificateData): void {
    this.isLoading = false
    this.certificates = _.concat(this.formateRequest(data), this.rcCertiface(data))
    this.cdr.detectChanges()
  }

  formateRequest(data: CertificateData): Certificate[] {
    // courseName lives on each generalCertificates entry (course level), a sibling of
    // issuedCertificates - not on the individual issued-certificate records. Attach it to
    // each certificate here, before flattening, or it's lost and value.courseName below
    // is always undefined.
    const issuedCertificates = _.reduce(_.flatten(_.filter(_.map(data.generalCertificates, (course: any) =>
      this.dropSupersededLegacyCertificates(course.issuedCertificates || [])
        .map((certificate: any) => ({ ...certificate, courseName: course.courseName }))
    ), certificate => {
      return certificate.length > 0
    })), (result: Certificate[], value: any) => {
      result.push({
        identifier: value.identifier,
        name: value.courseName || value.name,
        rcCertiface: false,
      })
      return result
    }, [])
    return issuedCertificates
  }
  // A course can carry a certificate from the legacy cert service (bare-UUID id, access-code
  // token, no templateUrl) alongside the one re-issued in the new format for the same batch.
  // certreg v2 cannot render the legacy one (500), so it showed up as a duplicate card with no
  // preview and a dead download. Drop it when the course has a new-format certificate; keep it
  // when it is the only one, so no earned certificate disappears.
  dropSupersededLegacyCertificates(issuedCertificates: any[]): any[] {
    const hasNewFormat = issuedCertificates.some(certificate => certificate?.templateUrl)
    return hasNewFormat ? issuedCertificates.filter(certificate => certificate?.templateUrl) : issuedCertificates
  }
  rcCertiface(data: CertificateData): Certificate[] {
    if (data.sunbirdRcCertificates && data.sunbirdRcCertificates.length > 0) {
      return _.reduce(
        data.sunbirdRcCertificates,
        (result: Certificate[], certificate: any) => {
          result.push({
            identifier: certificate.certificateName || `cert-${Date.now()}`,
            name: certificate.certificateName,
            downloadUrl: certificate.certificateDownloadUrl,
            image: certificate.thumbnail,
            rcCerticate: true,
          })
          return result
        },
        []
      )
    } else {
      return []
    }
  }

  assignProfession(data: string): void {
    this.currentProfession = data
  }
  assignUserName(data: any): void {
    if (data.firstname)
      this.userProfileData.personalDetails.firstname = data.firstname
    if (data.surname)
      this.userProfileData.personalDetails.surname = data.surname
  }
  setAcademicDetail(data: UserRegistryData): void {
    if (data) {
      this.userProfileData = data.profileDetails.profileReq
      if (this.userProfileData?.professionalDetails?.length > 0) {
        this.currentProfession = this.userProfileData.professionalDetails[0].profession
      } else {
        this.currentProfession = 'Not specified'
      }
      if (_.get(this.userProfileData, 'personalDetails')) {
        this.photoUrl = this.userProfileData?.personalDetails?.photo || null
      } else {
        this.photoUrl = null
      }

      if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
        this.academicsArray = this.userProfileData.academics
      }
      this.CompetencyConfiService.setConfig(this.userProfileData, data.profileDetails)
    }
  }
  storeLanguage(lang: string): void {
    // Update language using LanguageService
    this.languageService.setLanguage(lang)

    // Keep competency localStorage config in sync so the library picks up the new language on next init
    const competencyConfig = JSON.parse(localStorage.getItem('competency') || '{}')
    competencyConfig.language = lang
    localStorage.setItem('competency', JSON.stringify(competencyConfig))

    // Keep configSvc in sync so subsequent setConfig() calls read the correct language
    if (this.configSvc.unMappedUser?.profileDetails?.preferences) {
      this.configSvc.unMappedUser.profileDetails.preferences.language = lang
    }

    // Update user profile in backend
    const obj = {
      preferences: {
        language: lang,
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
    }

    const userdata = { ...this.userInfo?.profileDetails, ...obj }
    userdata.profileReq.personalDetails["profileLocation"] = 'sphere-web/mobile-profile-dashboard-store-language'

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
        this.logger.log('Language updated in profile:', result)
        // No page reload needed anymore!
      },
      error => {
        this.logger.error('Error updating language:', error)
      },
    )
  }
  saveLanguage(form: FormGroup): void {
    this.logger.log('Saving language preference:', form.value)

    // Update language using LanguageService
    this.languageService.setLanguage(form.value.language)

    // Keep competency localStorage config in sync so the library picks up the new language on next init
    const competencyConfig = JSON.parse(localStorage.getItem('competency') || '{}')
    competencyConfig.language = form.value.language
    localStorage.setItem('competency', JSON.stringify(competencyConfig))

    // Keep configSvc in sync so subsequent setConfig() calls read the correct language
    if (this.configSvc.unMappedUser?.profileDetails?.preferences) {
      this.configSvc.unMappedUser.profileDetails.preferences.language = form.value.language
    }

    const obj = {
      preferences: {
        language: form.value.language,
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
    }
    const userdata = { ...this.userData['profileDetails'], ...obj }

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
        this.logger.log('Language saved successfully:', result)
        this.snackBar.open(this.translate.instant("Language Updated"), undefined, { duration: 1000 })
      },
      error => {
        this.logger.error('Error saving language:', error)
      },
    )
  }
  getUserDetails(): void {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: UserRegistryData) => {
          if (data) {
            this.loader = false
            this.userProfileData = data.profileDetails.profileReq
            this.userData = data
            this.profileData = _.get(data, 'profileDetails.profileReq')
            this.userInfo = data
            if (this.userProfileData?.professionalDetails?.length > 0) {
              this.currentProfession = this.userProfileData.professionalDetails[0].profession
            } else {
              this.currentProfession = 'Not specified'
            }
            const lang = (data?.profileDetails?.preferences?.language !== undefined) ? data.profileDetails.preferences.language : this.languageService.getCurrentLanguage()
            this.language = lang
            this.logger.log(lang, 'oo')
            this.userForm.patchValue({ language: lang })
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
            if (this.userProfileData?.personalDetails?.photo) {
              this.photoUrl = this.userProfileData.personalDetails.photo
            }
            if (this.userProfileData?.personalDetails?.firstname) {
              this.firstName = this.userProfileData.personalDetails.firstname
              this.lastName = this.userProfileData.personalDetails.surname
            }
            this.setAcademicDetail(data)
          }
        })
    }
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px',
      panelClass: 'edit-profile-popup',
    })
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line: no-console
      this.logger.log('The dialog was closed', result)
      this.getUserDetails()
    })
  }

  eductionEdit(): void {
    this.navigate(`app/education-list`)
  }

  workInfoEdit(): void {
    this.navigate(`app/workinfo-list`)
  }

  personalDetailEdit(): void {
    this.navigate('app/personal-detail-edit')
  }

  navigate(navigateUrl: string): void {
    if (this.userProfileSvc.isBackgroundDetailsFilled(this.profileData)) {
      this.router.navigate([navigateUrl])
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `/page/home` } })
    }
  }

  openCompetency(event: Event): void {
    this.logger.log(event)
    localStorage.setItem('isOnlyPassbook', 'false')
    this.router.navigate([`app/user/self-assessment`])
  }
  ngOnDestroy(): void {
    if (this.gotData) {
      this.gotData.unsubscribe()
    }
    this.certObjectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl))
    this.certObjectUrls = []
  }
  getLeaderBoardList(): void {
    this.logger.log('this.configsvc', this.configSvc.unMappedUser)
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

  openCompetencyDashboard(event: Event): void {
    this.logger.log(event)
    localStorage.setItem('isOnlyPassbook', 'false')
    this.router.navigate([`app/user/competency`])
  }
  async openLeaderboard(): Promise<void> {
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

  onToggleChange(event: MatSlideToggleChange): void {
    this.themeService.setTheme(event.checked)
  }
}
