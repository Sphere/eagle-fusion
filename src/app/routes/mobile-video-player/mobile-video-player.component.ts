import { Component, OnInit } from '@angular/core'
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
@Component({
  selector: 'ws-mobile-video-player',
  templateUrl: './mobile-video-player.component.html',
  styleUrls: ['./mobile-video-player.component.scss'],
})
export class MobileVideoPlayerComponent implements OnInit {
  videoIndex: any
  videoData: any
  constructor(public router: Router, public route: ActivatedRoute,
    public configsvc: ConfigurationsService) {
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
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.videoIndex = params['video']
    })
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
