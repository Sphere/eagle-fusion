import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  courseContent: any
  topThreeCourse: any
  videoData: any
  constructor(private orgService: OrgServiceService,
    private router: Router,
  ) {
  }

  ngOnInit() {
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
  }

  searchV6Wrapper() {
    this.orgService.getLiveSearchResults().subscribe((result: any) => {
      this.courseContent = result.result.content
      this.topThreeCourse = this.courseContent.slice(1, 4)
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
