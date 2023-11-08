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
import { Location } from '@angular/common'
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
  givenName = ''
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
    location: Location,
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchButton = false
    }

    if (location.path().includes('/app/profile-view')) {
      this.currentText = 'Account'
    } else if (location.path().includes('/page/home')) {
      this.currentText = 'Home'
    } else if (location.path().includes('competency')) {
      this.currentText = 'Competency'
    } else if (location.path().includes('search')) {
      this.currentText = 'Search'
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
    console.log(text)
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    console.log(url1)
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }

    if (text.name === 'Home' || text.name === "होम") {
      this.currentText = text.name
      let url = '/page/home'
      location.href = `${url3}${url1}${url}`
    } else if (text.name === 'Competency' || text.name === "योग्यता") {
      this.currentText = text.name
      let url = '/app/user/competency'
      location.href = `${url3}${url1}${url}`
    } else if (text.name === "खोज" || text.name === "Search") {
      this.currentText = text.name
      let url = `${text.url}`
      location.href = `${url3}${url1}${url}`
    } else {
      console.log(this.configSvc.unMappedUser!.profileDetails!.profileReq!.personalDetails!)
      let result = await this.signupService.getUserData()
      console.log(result)
      if (result && result.profileDetails!.profileReq!.personalDetails!.dob) {
        this.currentText = text.name
        let url = '/app/profile-view'
        location.href = `${url3}${url1}${url}`
      } else {
        if (localStorage.getItem('url_before_login')) {
          const courseUrl = localStorage.getItem('url_before_login')
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          // window.location.assign(`${location.origin}/${this.lang}/${url}/${courseUrl}`)
        } else {
          this.currentText = 'Home'
          const url = '/page/home'
          let url4 = `${document.baseURI}`
          if (url4.includes('hi')) {
            url1 = ''
          }
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: `${url1}${url}` } })
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
