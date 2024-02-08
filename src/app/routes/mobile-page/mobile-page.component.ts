import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { DomSanitizer } from '@angular/platform-browser'
import { forkJoin } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
// import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import { ScrollService } from '../../services/scroll.service'
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
  preferedLanguage: any = { id: 'en', lang: 'English' }
  homeFeature: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  topCertifiedCourse: any = []
  featuredCourse: any = []
  cneCoursesIdentifier: any = []
  cneCourse: any = []
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef
  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private orgService: OrgServiceService,
    private scrollService: ScrollService,

  ) { }

  async ngOnInit() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        console.log("test")
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
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
    forkJoin([this.orgService.getLiveSearchResults(this.preferedLanguage.id),
    await this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {
      console.log('res', res)
      this.homeFeature = res[0].userLoggedInSection
      this.topCertifiedCourseIdentifier = res[1].topCertifiedCourseIdentifier
      this.featuredCourseIdentifier = res[1].featuredCourseIdentifier
      this.cneCoursesIdentifier = res[1].cneCoursesIdentifier
      if (res[0].result.content.length > 0) {
        this.formatTopCertifiedCourseResponse(res[0])
        this.formatFeaturedCourseResponse(res[0])
        this.formatcneCourseResponse(res[0])
        // console.log('this.formatTopCertifiedCourseResponse', this.featuredCourse)
      }
    })
  }
  formatcneCourseResponse(res: any) {

    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier, ckey.identifier)
    })

    this.cneCourse = uniqBy(cneCourse, 'identifier')
  }
  formatFeaturedCourseResponse(res: any) {
    // const featuredCourse = filter(res.result.content, ckey => {
    //   return includes(this.featuredCourseIdentifier, ckey.identifier)
    // })

    // this.featuredCourse = reduce(uniqBy(featuredCourse, 'identifier'), (result, value) => {
    //   console.log(value)
    //   result['identifier'] = value.identifier
    //   result['appIcon'] = value.appIcon
    //   result['name'] = value.name
    //   result['sourceName'] = value.sourceName
    //   result['competencies_v1'] = value.competencies_v1
    //   return result

    // }, {})

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
  viewAllCourse() {
    this.router.navigateByUrl(`app/search/learning`)
  }
}
