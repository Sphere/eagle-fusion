import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { forkJoin } from 'rxjs'
import _ from 'lodash'
@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any
  userEnrollCourse: any
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  constructor(private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private userSvc: WidgetUserService,
    private router: Router,
    private http: HttpClient
  ) {

  }

  async ngOnInit() {
    this.videoData = [
      {
        "url": "./../../fusion-assets/videos/videoplayback.mp4",
        "title": "Register for a course",
        "description": "Explore various courses and pick the ones you like",
      },
      {
        "url": "./../../fusion-assets/videos/videoplayback.mp4",
        "title": "Take the course",
        "description": "Access the course anytime, at your convinience"
      },
      {
        "url": "./../../fusion-assets/videos/videoplayback.mp4",
        "title": "Get certified",
        "description": "Receive downloadable and shareable certificates"
      },
    ]

    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      forkJoin([this.userSvc.fetchUserBatchList(this.userId), this.orgService.getLiveSearchResults()]).pipe().subscribe((res: any) => {
        this.formatmyCourseResponse(res[0])
        if (res[1].result.content.length > 0) {
          this.topCertifiedCourse = res[1].result.content.slice(1, 4)
          this.formatTopCertifiedCourseResponse(res[1])
          console.log(this.topCertifiedCourse)
        }

      })
    }

  }
  formatTopCertifiedCourseResponse(res: any) {
    const topCertifiedIdentifier = ['do_11346794242655027211', 'do_1134178372845649921545']
    _.forEach(topCertifiedIdentifier, (key) => {
      const certiedObject = _.filter(res.result.content, { 'identifier': key })
      console.log(certiedObject)
    })

  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}
    _.forEach(res, (key) => {
      if (res.completionPercentage !== 100) {
        myCourseObject = {
          'identifier': key.content.identifier,
          'appIcon': key.content.appIcon,
          'name': key.content.name
        }
        myCourse.push(myCourseObject)
      }
    })
    this.userEnrollCourse = myCourse
  }
  mobileJsonData() {
    this.http.get(`assets/configurations/mobile-home.json`).pipe(delay(500)).subscribe((res: any) => {
      this.homeFeature = res.userLoggedInSection
      console.log(this.homeFeature)
    })
  }
  //For certified courses
  searchV6Wrapper() {
    this.orgService.getLiveSearchResults().subscribe((response: any) => {
      this.myCourse = response.result.content
      this.topCertifiedCourse = this.myCourse.slice(1, 4)
    })
  }



  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
  }

  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }

}
