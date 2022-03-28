import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { NsContent, WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any
  courseUserEnroll: any
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
    this.searchV6Wrapper()
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
      this.fetchEnrollCourse()
    }
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

  //For my courses
  fetchEnrollCourse() {
    this.userSvc.fetchUserBatchList(this.userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        if (courses && courses.length) {
          this.courseUserEnroll = courses
        }
      })
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
