import { HttpClient } from '@angular/common/http'
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { NavigationExtras, Router } from '@angular/router'
import { delay } from 'rxjs/operators'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { forkJoin } from 'rxjs'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import uniqBy from 'lodash/uniqBy'
import { LanguageDialogComponent } from 'src/app/routes/language-dialog/language-dialog.component'
import { MatDialog } from '@angular/material'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { DomSanitizer } from '@angular/platform-browser'
import { ScrollService } from '../../services/scroll.service'
import { ConfigService as CompetencyConfiService } from '../competency/services/config.service'
import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

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
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  cneCoursesIdentifier: any = []
  // languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  cneCourse: any = []
  dataCarousel: any = [
    {
      "title": "Check out courses with CNE Hours",
      "titleHi": "सीएनई आवर्स के साथ पाठ्यक्रम देखें",
      "img": "https://aastar-app-assets.s3.ap-south-1.amazonaws.com/cne.svg",
      "scrollEmit": "scrollToCneCourses",
      "bg-color": "#D7AC5C;"
    },
    {
      "title": "Watch tutorials on how sphere works",
      "titleHi": "जानिए स्फीयर कैसे काम करता है",
      "img": "https://aastar-app-assets.s3.ap-south-1.amazonaws.com/how_works.svg",
      "scrollEmit": "scrollToHowSphereWorks",
      "bg-color": "#469788;;"
    }
  ]
  topCertifiedCourseDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; sourceName: boolean } } | undefined
  topCNECourseDisplayConfig: { displayType: string; badges: { cneName: boolean; rating: boolean; sourceName: boolean } } | undefined
  myCourseDisplayConfig: any
  showAllItems: boolean = false;
  userEnrolledDisplayConfig: { displayType: string; badges: { certification: boolean; rating: boolean; completionPercentage: boolean } } | undefined
  showAllCourses: boolean = false;
  lang: any = 'en'
  @ViewChild('scrollToCneCourses', { static: false }) scrollToCneCourses!: ElementRef

  constructor(private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private userSvc: WidgetUserService,
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    private CompetencyConfiService: CompetencyConfiService,
    private contentSvc: WidgetContentService,
    private UserAgentResolverService: UserAgentResolverService,
  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }
  scrollToHowSphereWorks() {
    this.scrollService.scrollToDivEvent.emit('scrollToHowSphereWorks')
  }
  ngOnInit() {
    this.lang = this.configSvc!.unMappedUser
      ? (this.configSvc!.unMappedUser.profileDetails!.preferences!.language || 'en')
      : location.href.includes('/hi/') ? 'hi' : 'en'

    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToCneCourses') {
        this.scrollService.scrollToElement(this.scrollToCneCourses.nativeElement)
      }
    })
    if (localStorage.getItem('preferedLanguage')) {
      let data: any
      data = localStorage.getItem('preferedLanguage')
      if (JSON.parse(data).selected === true) {
        this.preferedLanguage = JSON.parse(data)
      }
    } else {
      if (this.router.url.includes('hi')) {
        this.preferedLanguage = { id: 'hi', lang: 'हिंदी' }
      }
    }

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
    if (this.configSvc.userProfile) {

      // this.firstName = this.configSvc.userProfile
      forkJoin([this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
      this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id)]).pipe().subscribe((res: any) => {
        this.setCompetencyConfig(res[0])
        this.firstName = res[0].profileDetails!.profileReq!.personalDetails!.firstname

      })

      this.userId = this.configSvc.userProfile.userId || ''
      forkJoin([this.userSvc.fetchUserBatchList(this.userId), this.orgService.getLiveSearchResults(this.preferedLanguage.id),
      this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {
        this.homeFeature = res[2].userLoggedInSection
        this.topCertifiedCourseIdentifier = res[2].topCertifiedCourseIdentifier
        this.featuredCourseIdentifier = res[2].featuredCourseIdentifier
        this.cneCoursesIdentifier = res[2].cneCoursesIdentifier
        this.formatmyCourseResponse(res[0])
        if (res[1].result.content.length > 0) {
          this.formatTopCertifiedCourseResponse(res[1])
          this.formatFeaturedCourseResponse(res[1])
          this.formatcneCourseResponse(res[1])
        }
      })
    } else {
      forkJoin([this.orgService.getLiveSearchResults(this.preferedLanguage.id),
      this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {
        this.topCertifiedCourseIdentifier = res[1].topCertifiedCourseIdentifier
        this.featuredCourseIdentifier = res[1].featuredCourseIdentifier
        this.cneCoursesIdentifier = res[2].cneCoursesIdentifier

        if (res[0].result.content.length > 0) {
          this.formatTopCertifiedCourseResponse(res[0])
          this.formatFeaturedCourseResponse(res[0])
          this.formatcneCourseResponse(res[0])
        }
      })
    }
  }
  setCompetencyConfig(data: any) {
    if (data) {
      this.CompetencyConfiService.setConfig(data.profileDetails.profileReq, data.profileDetails)
    }
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
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}
    res.forEach((key: any) => {
      if (key.completionPercentage !== 100) {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
          issueCertification: key.content.issueCertification
        }

      } else {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content.sourceName,
          issueCertification: key.content.issueCertification
        }

      }
      myCourse.push(myCourseObject)

    })


    this.userEnrollCourse = myCourse
    if (this.userEnrollCourse.length > 0) {
      this.myCourseDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          rating: true,
          completionPercentage: true,
          certification: true,
          mobilesourceName: true
        },
      }
    }
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
  // To view all course
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
  openIframe(video: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        video: video.videoIndex,
      },
    }
    this.router.navigate(['/app/video-player'], navigationExtras)
  }
  changeLanguage() {
    this.langDialog = this.dialog.open(LanguageDialogComponent, {
      panelClass: 'language-modal',
      data: {
        selected: this.preferedLanguage,
      },
    })
    this.langDialog.afterClosed().subscribe(async (result: any) => {
      let langSelected: any
      langSelected = await result
      langSelected['selected'] = true
      localStorage.setItem(`preferedLanguage`, JSON.stringify(langSelected))
      const lang = result.id === 'hi' ? result.id : 'en'
      let user: any
      const userid = this.configSvc.userProfileV2!.userId
      const userAgent = this.UserAgentResolverService.getUserAgent()
      const userCookie = this.UserAgentResolverService.generateCookie()

      this.userProfileSvc.getUserdetailsFromRegistry(userid).subscribe((data: any) => {
        user = data
        const obj = {
          preferences: {
            language: lang,
          },
          osName: userAgent.OS,
          browserName: userAgent.browserName,
          userCookie,
        }
        const userdata = Object.assign(user['profileDetails'], obj)
        const reqUpdate = {
          request: {
            userId: userid,
            profileDetails: userdata,
          },
        }
        this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
          (res: any) => {

            if (res) {
              if (this.router.url.includes('hi')) {
                const lan = this.router.url.split('hi/').join('')
                if (lang === 'hi') {
                  window.location.assign(`${location.origin}/${lang}${lan}`)
                } else {
                  window.location.assign(`${location.origin}${lan}`)
                }
              } else {
                if (lang === 'hi') {
                  window.location.assign(`${location.origin}/${lang}${this.router.url}`)
                } else {
                  window.location.assign(`${location.origin}${this.router.url}`)
                }
              }
            }
          },
          () => {
          })
      })
      // if (this.router.url.includes('hi')) {
      //   const lan = this.router.url.split('hi/').join('')
      //   if (lang === 'hi') {
      //     window.location.assign(`${location.origin}/${lang}${lan}`)
      //   } else {
      //     window.location.assign(`${location.origin}${lang}${lan}`)
      //   }
      // } else {
      //   if (lang === 'hi') {
      //     window.location.assign(`${location.origin}/${lang}${this.router.url}`)
      //   } else {
      //     window.location.assign(`${location.origin}${lang}${this.router.url}`)
      //   }
      // }
    })
  }
}
