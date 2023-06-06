import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'ws-mobile-page',
  templateUrl: './mobile-page.component.html',
  styleUrls: ['./mobile-page.component.scss'],
})
export class MobilePageComponent implements OnInit {
  courseContent: any
  topThreeCourse: any
  showCreateBtn = false
  pageLayout: any
  videoData: any
  leaderBoard = false
  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.videoData = [
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/1fqlys8mkHg'),
        title: 'Register for a course',
        description: 'Explore various courses and pick the ones you like',
      },
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Kl28R7m2k50'),
        title: 'Take the course',
        description: 'Access the course anytime, at your convinience',
      },
      {
        url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/JTGzCkEXlmU'),
        title: 'Get certified',
        description: 'Receive downloadable and shareable certificates',
      },
    ]

    this.http.get(`assets/configurations/mobile-public.json`).pipe(delay(500)).subscribe((res: any) => {
      this.pageLayout = res.pageLayout
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
  leaderBoardSection() {
    if (this.leaderBoard) {
      this.leaderBoard = false
    }
  }
}
