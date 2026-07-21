import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, EventService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { MobileAppsService } from '../../../../../../src/app/services/mobile-apps.service'
import { BtnFeatureService } from './btn-feature.service'
import { SearchApiService } from '@ws/app/src/lib/routes/search/apis/search-api.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { appNavBarService } from 'src/app/component/app-nav-bar/app-nav-bar.service'
import { LocalStorageService } from '../../../../../../src/app/services/local-storage.service'
import { Events } from '../../../../../../src/app/routes/notification/events'
import { LanguageService } from '../../../../../../src/app/services/language.service'
import { LoggerService } from '@ws-widget/utils'

export const typeMap = {
  cardFull: 'card-full',
  cardMini: 'card-mini',
  cardSmall: 'card-small',
  matButton: 'mat-button',
  matFabButton: 'mat-fab',
  matFlatButton: 'mat-flat-button',
  matIconButton: 'mat-icon-button',
  matMiniFabButton: 'mat-mini-fab',
  matRaisedButton: 'mat-raised-button',
  matStrokedButton: 'mat-stroked-button',
  menuItem: 'mat-menu-item',
  featureItem: 'feature-item',
  externalLinkButton: 'external-link-button',
}

@Component({
    standalone: false,
    selector: 'ws-widget-btn-feature',
    templateUrl: './btn-feature.component.html',
    styleUrls: ['./btn-feature.component.scss'],
    
})
export class BtnFeatureComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<NsPage.INavLink> {
  @Input() widgetData!: NsPage.INavLink
  @Input() showFixedLength = false
  profileImage!: string | null
  givenName: any
  readonly displayType = typeMap
  badgeCount = ''
  defaultIconSize = 24
  isPinned = false
  instanceVal = ''
  isPinFeatureAvailable = true
  searchButton = true
  isSashakth = false
  local = 'en'
  private pinnedAppsChangeSubs?: Subscription
  currentText = ''
  numberOfNotification: any
  constructor(
    private readonly events: EventService,
    private readonly configurationsSvc: ConfigurationsService,
    private readonly btnFeatureSvc: BtnFeatureService,
    private readonly router: Router,
    private readonly mobileSvc: MobileAppsService,
    private readonly configSvc: ConfigurationsService,
    private readonly searchApi: SearchApiService,
    private readonly signupService: SignupService,
    public navOption: appNavBarService,
    public storage: LocalStorageService,
    private readonly event: Events,
    private readonly languageSvc: LanguageService,
    private readonly logger: LoggerService
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchButton = false
    }
    const isHindi = this.languageSvc.isHindi()

    this.navOption.currentOption.subscribe((option: any) => {
      this.logger.log('options', option, window.location.href)
      if (window.location.href.includes('/app/profile-view')) {
        this.currentText = isHindi ? 'अकाउंट' : 'Account'
      }
      if (window.location.href.includes('/app/toc')) {
        this.currentText = isHindi ? 'होम' : 'Home'
      }
    })

    if (window.location.href.includes('/app/profile-view')) {
      this.currentText = isHindi ? 'अकाउंट' : 'Account'
    } else if (window.location.href.includes('user/my_courses')) {
      this.currentText = isHindi ? 'आपके पाठ्यक्रम' : 'My Courses'
    } else if (window.location.href.includes('/page/home')) {
      this.currentText = isHindi ? 'होम' : 'Home'
    } else if (window.location.href.includes('competency')) {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
      this.currentText = isHindi ? 'योग्यता' : 'Competency'
    } else if (window.location.href.includes('search')) {
      this.currentText = isHindi ? 'खोज' : 'Search'
    } else if (window.location.href.includes('notification')) {
      this.currentText = isHindi ? 'अधिसूचना' : 'Notification'
    } else {
      this.currentText = ''
    }
  }

  updateBadge() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
      this.btnFeatureSvc
        .getBadgeCount(this.widgetData.actionBtn.badgeEndpoint)
        .then(count => {
          if (count > 99) {
            this.badgeCount = '99+'
          } else if (count > 0) {
            this.badgeCount = count.toString()
          } else {
            this.badgeCount = ''
          }
        })
        .catch(_err => { })
    }
  }
  async redirect(text: any) {
    // Note: Language is now managed by ngx-translate (TranslateService)
    // Do NOT use URL-based language prefixes (/hi) with ngx-translate
    const baseUrl = document.baseURI.endsWith('/') ? document.baseURI.slice(0, -1) : document.baseURI

    // ✅ Selective org config
    const org = this.configSvc?.userProfile?.rootOrgId || ''
    const selectiveData = this.configSvc.orgSelectiveCourseConfig

    if (text.name === 'Home' || text.name === 'होम') {
      this.currentText = text.name

      // ✅ Default home path
      let url = '/page/home'

      // ✅ If org matches selective config, redirect to selective course page
      if (selectiveData && selectiveData.orgId === org) {
        url = '/app/org-selective-course'
        this.logger.log('Redirecting to selective org homepage for:', org)
      }

      location.href = `${baseUrl}${url}`
    }

    else if (text.name === 'आपके पाठ्यक्रम' || text.name === 'My Courses') {
      this.currentText = text.name
      const url = '/app/user/my_courses'
      const result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        location.href = `${baseUrl}${url}`
      } else {
        const redirectUrl = '/page/home'
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: redirectUrl } })
      }
    } else if (text.name === 'अधिसूचना' || text.name === 'Notification') {
      this.currentText = text.name
      const url = '/notification'
      location.href = `${baseUrl}${url}`
    } else if (text.name === 'Competency' || text.name === 'योग्यता') {
      this.currentText = text.name
      const result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
        const url = '/app/user/competency'
        location.href = `${baseUrl}${url}`
      } else {
        const redirectUrl = '/page/home'
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: redirectUrl } })
      }
    } else if (text.name === 'खोज' || text.name === 'Search') {
      this.navOption.changeNavBarActive('search')
      this.currentText = text.name
      const url = '/app/search/home'
      location.href = `${baseUrl}${url}`
    } else {
      const result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.currentText = text.name
        const url = '/app/profile-view'
        location.href = `${baseUrl}${url}`
      } else {
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
        } else {
          this.currentText = 'Home'
          const redirectUrl = '/page/home'
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: redirectUrl } })
        }
      }
    }
  }

  search() {
    if (this.router.url.includes('/page/home')) {
      this.searchApi.changeMessage('search')
    }
    if (this.router.url.includes('/app/search/learning')) {
      this.router.navigateByUrl('/app/search/home')
    }
  }
  ngOnInit() {
    this.instanceVal = this.configSvc.rootOrg || ''
    if (this.configSvc.userProfile && this.configSvc.userProfile.firstName) {
      this.givenName = `${this.configSvc!.userProfile!.firstName!} ${this.configSvc!.userProfile!.lastName!}`
    }
    if (this.configSvc.restrictedFeatures) {
      this.isPinFeatureAvailable = !this.configSvc.restrictedFeatures.has('pinFeatures')
    }
    if (
      !this.widgetData.actionBtn &&
      this.widgetData.actionBtnId &&
      this.configurationsSvc.appsConfig
    ) {
      this.widgetData.actionBtn = this.configurationsSvc.appsConfig.features[this.widgetData.actionBtnId]

      const sashakt_token = sessionStorage.getItem('sashakt_token') || null
      const sashakt_moduleId = sessionStorage.getItem('sashakt_moduleId') || null

      if (sashakt_token && sashakt_moduleId) {
        this.isSashakth = true
        this.local = 'hi'
      } else {
        this.isSashakth = false
      }
    }
    const count = this.storage.getNumberOfNotifications()
    const notificationText = count > 0 ? '1' : ''

    this.numberOfNotification = (count > 1) ? '1+' : notificationText
    this.event.subscribe('notificationCountUpdated', data => {
      const notificationText = data > 0 ? '1' : ''
      this.numberOfNotification = (data > 1) ? '1+' : notificationText
    })
    this.pinnedAppsChangeSubs = this.configurationsSvc.pinnedApps.subscribe(pinnedApps => {
      this.isPinned = Boolean(
        this.widgetData.actionBtn && pinnedApps.has(this.widgetData.actionBtn.id),
      )
    })
  }

  ngOnDestroy() {
    if (this.pinnedAppsChangeSubs) {
      this.pinnedAppsChangeSubs.unsubscribe()
    }
  }

  get featureStatusColor() {
    if (this.widgetData.actionBtn) {
      switch (this.widgetData.actionBtn.status) {
        case 'earlyAccess':
          return 'primary'
        case 'beta':
          return 'accent'
        case 'alpha':
          return 'warn'
        default:
          return null
      }
    }
    return null
  }

  get desktopVisible() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.mobileAppFunction) {
      if (!this.mobileSvc.isMobile) {
        return false
      }
      return true
    }
    return true
  }

  togglePin(featureId: string, event: any) {
    event.preventDefault()
    event.stopPropagation()
    this.events.raiseInteractTelemetry('btn-clicked', 'pin', 'feature', {
      id: featureId,
      type: "",
      version: "",
      rollup: {},
    }, {
      values: [{
        id: featureId,
      }],
    })
    this.configurationsSvc.pinnedApps.pipe(take(1)).subscribe(pinnedApps => {
      const newPinnedApps = new Set(pinnedApps)
      if (newPinnedApps.has(featureId)) {
        newPinnedApps.delete(featureId)
      } else {
        newPinnedApps.add(featureId)
      }
      this.isPinned = newPinnedApps.has(featureId)
      this.configurationsSvc.prefChangeNotifier.next({
        pinnedApps: Array.from(newPinnedApps).join(','),
      })
      this.configurationsSvc.pinnedApps.next(newPinnedApps)
    })
  }
}
