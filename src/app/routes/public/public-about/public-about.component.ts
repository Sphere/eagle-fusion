import { Component, OnInit, OnDestroy } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { SafeHtml, SafeResourceUrl, SafeStyle } from '@angular/platform-browser'
import { map } from 'rxjs/operators'
import { ConfigurationsService, NsPage, SafeResourceUrlService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { IAboutObject } from './about.model'

@Component({
  standalone: false,
  selector: 'ws-public-about',
  templateUrl: './public-about.component.html',
  styleUrls: ['./public-about.component.scss'],

})
export class PublicAboutComponent implements OnInit, OnDestroy {
  objectKeys = Object.keys
  headerBanner: SafeStyle | null = null
  // footerBanner: SafeStyle | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  aboutPage: IAboutObject | null = null
  private subscriptionAbout: Subscription | null = null

  isSmallScreen$ = this.breakpointObserver
    .observe(Breakpoints.XSmall)
    .pipe(map(breakPointState => breakPointState.matches))

  videoLink: SafeResourceUrl | null = null
  overviewParaSafeHtml: SafeHtml | null = null

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly configSvc: ConfigurationsService,
    private readonly activateRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscriptionAbout = this.activateRoute.data.subscribe(data => {
      this.aboutPage = data.pageData.data
      if (this.aboutPage?.innerHtmlWithTitle?.para) {
        this.overviewParaSafeHtml = this.safeResourceUrlSvc.trustHtml(this.aboutPage.innerHtmlWithTitle.para)
      }
      if (this.aboutPage && this.aboutPage.banner && this.aboutPage.banner.videoLink) {
        this.videoLink = this.safeResourceUrlSvc.trust(
          this.aboutPage.banner.videoLink,
        )
      }
      if (this.aboutPage && this.aboutPage.banner) {
        this.headerBanner = this.safeResourceUrlSvc.trustStyle(
          `url('${this.aboutPage.banner.img}')`,
        )
      }
    })
  }

  ngOnDestroy() {
    if (this.subscriptionAbout) {
      this.subscriptionAbout.unsubscribe()
    }
  }
}
