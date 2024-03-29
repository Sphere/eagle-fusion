import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
// import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import { MatDialog } from '@angular/material'
import { forkJoin } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-web-public-container',
  templateUrl: './web-public-container.component.html',
  styleUrls: ['./web-public-container.component.scss'],
})
export class WebPublicComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any = []
  userEnrollCourse: any
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  // languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  displayConfig = {
    displayType: 'card-badges',
    badges: {
      orgIcon: true,
      certification: true,
    },
  }
  constructor(
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private orgService: OrgServiceService,
  ) {

  }

  async ngOnInit() {
    forkJoin([this.orgService.getLiveSearchResults(this.preferedLanguage.id),
    await this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {

      this.homeFeature = res[0].userLoggedInSection
      this.topCertifiedCourseIdentifier = res[1].topCertifiedCourseIdentifier

      this.featuredCourseIdentifier = res[1].featuredCourseIdentifier
      if (res[0].result.content.length > 0) {
        this.formatTopCertifiedCourseResponse(res[0])
        this.formatFeaturedCourseResponse(res[0])

      }
    })

  }

  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = filter(res.result.content, ckey => {
      return includes(this.featuredCourseIdentifier, ckey.identifier)
    })
    this.featuredCourse = uniqBy(featuredCourse, 'identifier')
  }

  formatTopCertifiedCourseResponse(res: any) {

    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })

    this.topCertifiedCourse = uniqBy(topCertifiedCourse, 'identifier')
  }

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }
  // To view all course
  viewAllCourse() {
    this.router.navigateByUrl(`app/search/learning`)
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }

}
