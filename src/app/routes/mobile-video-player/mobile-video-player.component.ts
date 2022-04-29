import { Component, OnInit } from '@angular/core'
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import * as _ from 'lodash'
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
      this.videoIndex = _.toNumber(params['video'])
    })
    if (this.videoIndex === 1) {
      this.videoData = this.videoData.slice(this.videoIndex + 1, this.videoData.length)
    } else if (this.videoIndex === 2) {
      this.videoData = this.videoData.slice(0, 1)
    } else {
      this.videoData = this.videoData.slice(this.videoIndex + 1, this.videoData.length - 1)
    }
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
