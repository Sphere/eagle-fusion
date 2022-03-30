import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { forkJoin } from 'rxjs'
import * as _ from 'lodash'
@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any = []
  userEnrollCourse: any
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  constructor(private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private userSvc: WidgetUserService,
    private router: Router,
    private http: HttpClient
  ) {

  }

  ngOnInit() {
    this.videoData = [
      {
        url: './../../fusion-assets/videos/videoplayback.mp4',
        title: 'Register for a course',
        description: 'Explore various courses and pick the ones you like',
      },
      {
        url: './../../fusion-assets/videos/videoplayback.mp4',
        title: 'Take the course',
        description: 'Access the course anytime, at your convinience',
      },
      {
        url: './../../fusion-assets/videos/videoplayback.mp4',
        title: 'Get certified',
        description: 'Receive downloadable and shareable certificates',
      },
    ]
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      forkJoin([this.userSvc.fetchUserBatchList(this.userId), this.orgService.getLiveSearchResults(), this.http.get(`assets/configurations/mobile-home.json`)],).pipe().subscribe((res: any) => {
        this.homeFeature = res[2].userLoggedInSection
        this.topCertifiedCourseIdentifier = res[2].topCertifiedCourseIdentifier
        this.featuredCourseIdentifier = res[2].featuredCourseIdentifier
        this.formatmyCourseResponse(res[0])
        if (res[1].result.content.length > 0) {
          this.formatTopCertifiedCourseResponse(res[1])
          this.formatFeaturedCourseResponse(res[1])
        }
      })
    }

  }
  formatFeaturedCourseResponse(res: any) {
    const featuredCourse: any = []
    let featuredObject = {}
    _.forEach(this.featuredCourseIdentifier, key => {
      _.forEach(res.result.content, ckey => {
        if (ckey.identifier === key) {
          featuredObject = {
            identifier: ckey.identifier,
            appIcon: ckey.appIcon,
            name: ckey.name,
            description: ckey.description,
          }
        }
      })
      featuredCourse.push(featuredObject)
    })
    this.featuredCourse = featuredObject
    console.log(this.featuredCourse)
  }
  formatTopCertifiedCourseResponse(res: any) {
    const topCertifiedCourse: any = []
    let certifiedObject = {}
    _.forEach(this.topCertifiedCourseIdentifier, key => {
      _.forEach(res.result.content, ckey => {
        if (ckey.identifier === key) {
          certifiedObject = {
            identifier: ckey.identifier,
            appIcon: ckey.appIcon,
            name: ckey.name,
            creator: ckey.creator,
          }
        }
      })
      topCertifiedCourse.push(certifiedObject)
    })
    this.topCertifiedCourse = topCertifiedCourse
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}
    _.forEach(res, key => {
      if (res.completionPercentage !== 100) {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          name: key.content.name,
        }
        myCourse.push(myCourseObject)
      }
    })
    this.userEnrollCourse = myCourse
  }
  mobileJsonData() {
    this.http.get(`assets/configurations/mobile-home.json`).pipe(delay(500)).subscribe((res: any) => {
      this.homeFeature = res.userLoggedInSection
      this.topCertifiedCourseIdentifier = res.topCertifiedCourseIdentifier
      this.featuredCourseIdentifier = res.featuredCourseIdentifier
    })
  }

  // For opening Course Page
  raiseTelemetry(contentIdentifier: any) {
    this.router.navigateByUrl(`/app/toc/${contentIdentifier}/overview`)
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
