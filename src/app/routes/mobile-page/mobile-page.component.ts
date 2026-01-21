import { HttpClient } from '@angular/common/http'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { catchError, delay, switchMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { filter, includes, uniqBy } from 'lodash'
import { ScrollService } from '../../services/scroll.service'
import { environment } from 'src/environments/environment'
import { PlaylistService } from '../../services/playlist.service'

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
  topCertifiedCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  topCNECourseDisplayConfig: { displayType: string; badges: { cneName: boolean; rating: boolean; sourceName: boolean } } | undefined
  myCourseDisplayConfig: any
  showAllItems: boolean = false;
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  showAllCourses: boolean = false;
  constructor(
    private router: Router,
    private http: HttpClient,
    private orgService: OrgServiceService,
    private scrollService: ScrollService,
    private playlistSvc: PlaylistService
  ) { }

  async ngOnInit() {
    let res = this.playlistSvc.selectedTabConfig()
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        console.log("test")
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
    this.videoData = res[5]

    this.http.get(`assets/configurations/mobile-public.json`).pipe(delay(500)).subscribe((res: any) => {
      this.pageLayout = res.pageLayout
    })
    let url: string

    if (environment.production) {
      url = "mobile-home.json" // For production environment
    } else {
      url = "mobile-home-stage.json" // For non-production (development) environment
    }
    url = 'mobile-home.json'


    this.http.get(`assets/configurations/` + url).pipe(
      switchMap((configData: any) => {
        const identifiers = [
          ...configData.topCertifiedCourseIdentifier,
          ...configData.cneCoursesIdentifier,
          ...configData.featuredCourseIdentifier
        ]
        this.topCertifiedCourseIdentifier = configData.topCertifiedCourseIdentifier
        this.cneCoursesIdentifier = configData.cneCoursesIdentifier
        this.featuredCourseIdentifier = configData.featuredCourseIdentifier
        return this.orgService.getTopLiveSearchResults(identifiers, this.preferedLanguage.id)
      }),
      catchError((error) => {
        // Handle error if needed
        return of(error) // Returning a default observable in case of error
      })
    ).subscribe((results: any) => {
      if (results.result.content.length > 0) {
        this.formatTopCertifiedCourseResponse(results)
        // this.formatFeaturedCourseResponse(res[0])
        this.formatcneCourseResponse(results)

      }

    })
  }
  formatcneCourseResponse(res: any) {

    const cneCourse = filter(res.result.content, ckey => {
      return includes(this.cneCoursesIdentifier, ckey.identifier)
    })

    this.cneCourse = uniqBy(cneCourse, 'identifier')
    if (this.cneCourse.length > 0) {
      this.topCNECourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          cneName: true,
          rating: true,
          sourceName: true
        },
      }
    }
  }
  formatFeaturedCourseResponse(res: any) {
    const featuredCourse = filter(res.result.content, ckey => {
      return includes(this.featuredCourseIdentifier, ckey.identifier)
    })

    this.featuredCourse = uniqBy(featuredCourse, 'identifier')

    if (this.featuredCourse.length > 0) {
      this.topCertifiedCourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          certification: true,
          rating: true,
          sourceName: true
        },
      }
    }
  }

  formatTopCertifiedCourseResponse(res: any) {

    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })

    this.topCertifiedCourse = uniqBy(topCertifiedCourse, 'identifier')
    console.log("yes here", this.topCertifiedCourse)
    if (this.topCertifiedCourse.length > 0) {
      this.topCertifiedCourseDisplayConfig = {
        displayType: 'card-badges',
        badges: {
          certification: true,
          rating: true,
          sourceName: true
        },
      }
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
  leaderBoardSection() {
    if (this.leaderBoard) {
      this.leaderBoard = false
    }
  }
  viewAllCourse() {
    this.router.navigateByUrl(`app/search/learning`)
  }
  viewAllItems(): void {
    this.showAllItems = !this.showAllItems
    // You can also update specific items here if needed
  }
  getDisplayedItems(items: any[]): any[] {
    if (this.showAllItems) {
      return items
    } else {
      if (items.length > 5) {
        return items.slice(0, 5)
      } else {
        return items
      }
      // Show only a limited number of items, like the first 5
    }
  }
}
