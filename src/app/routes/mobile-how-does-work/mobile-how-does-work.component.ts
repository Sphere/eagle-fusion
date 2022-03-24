import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ws-mobile-how-does-work',
  templateUrl: './mobile-how-does-work.component.html',
  styleUrls: ['./mobile-how-does-work.component.scss']
})
export class MobileHowDoesWorkComponent implements OnInit {
  @Input() data: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()

  videos = [
    {
      "url": "./../../fusion-assets/videos/videoplayback.mp4",
      "title": "Register for a course",
      "description": "Explore various courses and pick the ones you like"
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
  constructor() { }

  ngOnInit() {
  }
  openIframe(data?: any) {
    this.openPlayer.emit(data)
  }
}
