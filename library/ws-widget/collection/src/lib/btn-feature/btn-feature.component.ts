import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Event, NavigationEnd, Router } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, EventService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { MobileAppsService } from '../../../../../../src/app/services/mobile-apps.service'
// import { CustomTourService } from '../_common/tour-guide/tour-guide.service'
import { BtnFeatureService } from './btn-feature.service'
import { SearchApiService } from '@ws/app/src/lib/routes/search/apis/search-api.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { appNavBarService } from 'src/app/component/app-nav-bar/app-nav-bar.service'
import { LocalStorageService } from '../../../../../../src/app/services/local-storage.service'
import { Events } from '../../../../../../src/app/routes/notification/events'
// import { LocalStorageService } from "../../services/local-storage.service"

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
  // @Input()
  // @HostBinding('id')
  // public id!: string
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
  private navigationSubs?: Subscription
  currentText = ''
  numberOfNotification: any
  constructor(
    private events: EventService,
    private configurationsSvc: ConfigurationsService,
    private btnFeatureSvc: BtnFeatureService,
    private router: Router,
    private mobileSvc: MobileAppsService,
    private configSvc: ConfigurationsService,
    // private tour: CustomTourService,
    private searchApi: SearchApiService,
    private signupService: SignupService,
    public navOption: appNavBarService,
    public storage: LocalStorageService,
    private readonly event: Events,
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchButton = false
    }
    this.navOption.currentOption.subscribe((option: any) => {
      console.log('options', option, window.location.href)
      if (window.location.href.includes('/app/profile-view')) {
        if (window.location.href.includes('/hi/app/profile-view')) {
          this.currentText = 'अकाउंट'
        } else {
          this.currentText = 'Account'
        }
      }
      if (window.location.href.includes('/app/toc')) {
        //this.currentText = ''
        if (window.location.href.includes('/hi/app/toc')) {
          this.currentText = 'होम'
        } else {
          this.currentText = 'Home'
        }
      }
    })

    if (window.location.href.includes('/app/profile-view')) {
      if (window.location.href.includes('/hi/app/profile-view')) {
        this.currentText = 'अकाउंट'
      } else {
        this.currentText = 'Account'
      }
    } else if (window.location.href.includes('user/my_courses')) {
      if (window.location.href.includes('/hi/app/user/my_courses')) {
        this.currentText = 'आपके पाठ्यक्रम'
      } else {
        this.currentText = 'My Courses'
      }
    } else if (window.location.href.includes('/page/home')) {
      if (window.location.href.includes('/hi/page/home')) {
        this.currentText = 'होम'
      } else {
        this.currentText = 'Home'
      }
    } else if (window.location.href.includes('competency')) {
      localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
      if (window.location.href.includes('/hi/app/user/competency')) {
        this.currentText = 'योग्यता'
      } else {
        this.currentText = 'Competency'
      }
    } else if (window.location.href.includes('search')) {
      if (window.location.href.includes('/hi/app/search/home')) {
        this.currentText = 'खोज'
      } else {
        this.currentText = 'Search'
      }
    }
    else if (window.location.href.includes('notification')) {
      if (window.location.href.includes('/hi/notification')) {
        this.currentText = 'अधिसूचना'
      } else {
        this.currentText = 'Notification'
      }
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
    // Use user preference ONLY, don't detect from URL to avoid double /hi
    const local = this.configSvc.unMappedUser?.profileDetails?.preferences?.language ?? 'en'
    const langPrefix = local === 'hi' ? '/hi' : ''
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
        console.log('🏫 Redirecting to selective org homepage for:', org)
      }

      location.href = `${baseUrl}${langPrefix}${url}`
    }

    else if (text.name === 'आपके पाठ्यक्रम' || text.name === 'My Courses') {
      this.currentText = text.name
      let url = '/app/user/my_courses'
      let result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        location.href = `${baseUrl}${langPrefix}${url}`
      } else {
        let redirectUrl = `${langPrefix}/page/home`
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: redirectUrl } })
      }
    } else if (text.name === 'अधिसूचना' || text.name === 'Notification') {
      this.currentText = text.name
      let url = '/notification'
      location.href = `${baseUrl}${langPrefix}${url}`
    } else if (text.name === 'Competency' || text.name === 'योग्यता') {
      this.currentText = text.name
      let result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        localStorage.setItem('isOnlyPassbook', JSON.stringify(false))
        let url = '/app/user/competency'
        location.href = `${baseUrl}${langPrefix}${url}`
      } else {
        let redirectUrl = `${langPrefix}/page/home`
        this.router.navigate(['/app/about-you'], { queryParams: { redirect: redirectUrl } })
      }
    } else if (text.name === 'खोज' || text.name === 'Search') {
      this.navOption.changeNavBarActive('search')
      this.currentText = text.name
      let url = '/app/search/home'
      location.href = `${baseUrl}${langPrefix}${url}`
    } else {
      let result = await this.signupService.getUserData()
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.currentText = text.name
        let url = '/app/profile-view'
        location.href = `${baseUrl}${langPrefix}${url}`
      } else {
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
        } else {
          this.currentText = 'Home'
          let redirectUrl = `${langPrefix}/page/home`
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

      if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
        this.navigationSubs = this.router.events.subscribe((e: Event) => {
          if (e instanceof NavigationEnd) {
            // this.updateBadge()
          }
        })
      }

      const sashakt_token = sessionStorage.getItem('sashakt_token') || null
      const sashakt_moduleId = sessionStorage.getItem('sashakt_moduleId') || null

      if (sashakt_token && sashakt_moduleId) {
        this.isSashakth = true
        this.local = 'hi'
        // this.local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
      } else {
        this.isSashakth = false
      }
    }
    const count = this.storage.getNumberOfNotifications()
    let notificationText = count > 0 ? '1' : ''

    this.numberOfNotification = (count > 1) ? '1+' : notificationText
    this.event.subscribe('notificationCountUpdated', (data) => {
      let notificationText = data > 0 ? '1' : ''
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
    if (this.navigationSubs) {
      this.navigationSubs.unsubscribe()
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
    this.events.raiseInteractTelemetry('pin', 'feature', {
      featureId,
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

  startTour() {
    // this.tour.startTour()
  }
}
