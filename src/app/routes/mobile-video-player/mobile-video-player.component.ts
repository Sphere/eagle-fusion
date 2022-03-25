import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'ws-mobile-video-player',
  templateUrl: './mobile-video-player.component.html',
  styleUrls: ['./mobile-video-player.component.scss']
})
export class MobileVideoPlayerComponent implements OnInit {
  videoIndex: any
  videoData: any
  constructor(public route: ActivatedRoute) {
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
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.videoIndex = params['video']
      console.log(this.videoIndex)
    })
  }

}
