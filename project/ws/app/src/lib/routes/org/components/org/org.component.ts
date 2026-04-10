import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  HostListener,
  effect,
  signal,
  computed,
} from '@angular/core'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { OrgServiceService } from './../../org-service.service'
import { ActivatedRoute, Router } from '@angular/router'
import { MdePopoverTrigger } from '@jaguards/material-extended-mde'
import { HttpClient } from '@angular/common/http'
import { forkJoin } from 'rxjs'
import { WidgetUserService } from '@ws-widget/collection'
import { uniqBy } from 'lodash'
import { S3_END_POINTS } from '../../../../../../../../../src/app/constants/apiConstants'

@Component({
  standalone: false,
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],

})
export class OrgComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  orgName!: string
  routeSubscription: any
  orgData: any
  currentOrgData = signal<any | null>(null)
  showEndPopup = false
  btnText = ''
  cardLimit = 5
  competencyData = signal<{ identifier: string, name: any; levels: string }[]>([])
  rating = 4
  starCount = 5
  stars: number[] = [1, 2, 3, 4, 5]
  color = 'accent'
  ratingArr: any = []
  index = 0
  link = ''
  competency_offered: any = 0
  formattedAbout!: string
  averageRating: any = ''
  totalRatings: any = ''
  userEnrollCourse = signal<any[]>([])
  completedCourse = signal<any[]>([])
  orgUserCourseEnrolled = signal(0)
  myCourseDisplayConfig: any
  isMobile = false
  showAllUserEnrollCourses = signal(false)
  showAllCompletedCourses = signal(false)
  selectedLanguage = signal<'all' | 'en' | 'hi'>('all') // Default to 'all'
  courseData = signal<any[]>([])
  courseCount = computed(() => this.courseData().length)
  filteredCourseData = computed(() => {
    const data = this.courseData()
    if (this.selectedLanguage() === 'all') {
      return data
    }
    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  })
  filteredUserEnrollCourse = computed(() => {
    const data = this.userEnrollCourse()
    if (this.selectedLanguage() === 'all') {
      return data
    }
    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  })
  filteredCompletedCourse = computed(() => {
    const data = this.completedCourse()
    if (this.selectedLanguage() === 'all') {
      return data
    }
    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  })

  constructor(private activateRoute: ActivatedRoute,
    private orgService: OrgServiceService,
    private router: Router,
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private readonly userSvc: WidgetUserService,
    private valueSvc: ValueService,
    private logger: LoggerService
  ) {
    effect(() => {
      this.isMobile = this.valueSvc.isMobile() ? true : false
    })
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.logger.log(event)
    const url = sessionStorage.getItem('currentURL')
    if (url) {
      location.href = url
    }
  }

  ngOnInit() {
    for (this.index = 0; this.index < this.starCount; this.index++) {
      this.ratingArr.push(this.index)
    }

    this.orgName = this.activateRoute.snapshot.queryParams.orgId

    this.http.get(S3_END_POINTS.ORG_META_CONFIG, { responseType: 'text' })
      .subscribe(
        (results: any) => {
          try {
            const currentOrg = this.orgName.trim()
            const parsedResults = JSON.parse(results)
            this.orgData = parsedResults.sources
            const orgMatch = this.orgData.find(
              (org: any) => org.sourceName === currentOrg
            )
            this.currentOrgData.set(orgMatch || null)
            if (this.currentOrgData()) {
              this.formattedAbout = this.formatAbout(this.currentOrgData()?.about)
              if (this.currentOrgData()?.closedCoursesList) {
                this.logger.log("this.currentOrgData.closedCoursesList present", this.currentOrgData()?.closedCoursesList)
                if (this.orgName === 'Tamil Nadu Nurses and Midwives Council (TNNMC)' && this.currentOrgData()) {
                  forkJoin([this.userSvc.fetchUserBatchList(userId)]).pipe().subscribe((res: any) => {
                    this.logger.log("res: ", res)
                    this.formatmyCourseResponse(res[0])
                  })
                }
                forkJoin([
                  this.orgService.getSearchResultsV7ById(this.currentOrgData()?.closedCoursesList),
                  this.orgService.getSearchV7Results(this.orgName),
                ]).subscribe(([closedCoursesRes, taggedCoursesRes]: any[]) => {
                  const closedCourses = closedCoursesRes.result.content || []
                  const taggedCourses = (taggedCoursesRes.result.content || []).filter(
                    (org: any) => org.sourceName === this.currentOrgData()?.sourceName
                  )

                  const allCourses = [...closedCourses, ...taggedCourses]
                  this.courseData.set(uniqBy(allCourses, 'identifier'))

                  this.logger.log("this.courseData", this.courseData())

                  if (this.courseData().length > 0) {
                    this.competencyData.set(this.groupCompetenciesById(this.courseData()))
                  }
                })
              } else {
                this.orgService.getSearchV7Results(this.orgName).subscribe((result: any) => {
                  const matchedCourses = result.result.content.filter(
                    (org: any) => org.sourceName === this.orgName
                  )
                  this.courseData.set(matchedCourses)

                  this.logger.log("this.courseData", this.courseData())
                  if (this.courseData().length > 0) {
                    this.competencyData.set(this.groupCompetenciesById(this.courseData()))
                  } else {
                    this.logger.log("this.courseData", this.courseData())

                    this.orgService.getSearchResults(this.currentOrgData()?.taggedSourceName).subscribe((result: any) => {
                      const fallbackCourses = result.result.content.filter(
                        (org: any) => org.sourceName === this.currentOrgData()?.taggedSourceName
                      )
                      this.courseData.set(fallbackCourses)
                      this.logger.log("this.courseData", this.courseData())
                      if (this.courseData().length > 0) {
                        this.logger.log('l')
                        this.competencyData.set(this.groupCompetenciesById(this.courseData()))
                      }
                    })
                  }
                })
              }
            }
          } catch (e) {
            this.logger.error('Error parsing JSON', e)
          }
        },
        error => {
          this.logger.error('HTTP error', error)
        }
      )

    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId
    } else {
      userId = this.configSvc.unMappedUser?.id
    }

    // this.orgService.getEnroledUserForCourses(this.orgName).subscribe(userEnrolled => {
    //   if (userEnrolled && userEnrolled.length > 0) {
    //     this.orgUserCourseEnrolled = userEnrolled[0].enrolled_users || []
    //     this.competency_offered = userEnrolled[0].competency_offered || undefined
    //   }
    // })

    this.configSvc.unMappedUser! == undefined ? this.btnText = 'Login' : this.btnText = 'View Course'
  }

  filterByLanguage(language: 'all' | 'en' | 'hi'): void {
    this.selectedLanguage.set(language)
    this.cardLimit = 5 // Reset card limit when filtering
  }

  getFilteredCourseData(): any[] {
    const data = this.courseData()
    if (this.selectedLanguage() === 'all') {
      return data
    }

    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  }

  getFilteredUserEnrollCourse(): any[] {
    const data = this.userEnrollCourse()
    if (this.selectedLanguage() === 'all') {
      return data
    }

    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  }

  getFilteredCompletedCourse(): any[] {
    const data = this.completedCourse()
    if (this.selectedLanguage() === 'all') {
      return data
    }

    return data.filter((course: any) => {
      const courseLanguage = course.lang || 'en'
      return courseLanguage === this.selectedLanguage()
    })
  }

  getDisplayedItems(items: any[], showAll: boolean): any[] {
    if (showAll) {
      return items
    } else {
      if (items.length > 5) {
        return items.slice(0, 5)
      } else {
        return items
      }
    }
  }

  viewAllItems(section: string): void {
    switch (section) {
      case 'userEnrollCourses':
        this.showAllUserEnrollCourses.update(value => !value)
        break
      case 'completedCourses':
        this.showAllCompletedCourses.update(value => !value)
        break
    }
  }

  formatmyCourseResponse(res: any) {
    if (this.currentOrgData()?.closedCoursesList && this.currentOrgData()?.closedCoursesList.length > 0) {
      res = res.filter((item: any) => this.currentOrgData()?.closedCoursesList.includes(item.content.identifier))
    }
    this.logger.log("orgFltered", res)

    res.forEach((key: any) => {
      if (key?.content?.identifier) {

        const courseData = {
          identifier: key.content?.identifier,
          appIcon: key.content?.appIcon,
          thumbnail: key.content?.thumbnail,
          name: key.content?.name,
          dateTime: key.dateTime,
          completionPercentage: key.completionPercentage,
          sourceName: key.content?.sourceName,
          issueCertification: key.content?.issueCertification,
          averageRating: key.averageRating,
          lang: key.content?.lang || 'en', // Add language property
        }

        if (key.completionPercentage < 100) {
          this.userEnrollCourse.update(arr => [...arr, courseData])
        } else {
          this.completedCourse.update(arr => [...arr, courseData])
        }
      }
    })
    this.logger.log("this.myCourse", this.completedCourse(), this.userEnrollCourse())
    if (this.userEnrollCourse().length > 0 || this.completedCourse().length > 0) {
      this.myCourseDisplayConfig = {
        displayType: 'card-mini',
        badges: {
          rating: true,
          completionPercentage: true,
          certification: true,
          mobilesourceName: this.isMobile ? true : false,
        },
      }
    }
  }

  getStarImage(index: number, averageRating: number): string {
    const fullStarUrl = '/fusion-assets/icons/toc_star.png'
    const halfStarUrl = '/fusion-assets/icons/Half_star1.svg'
    const emptyStarUrl = '/fusion-assets/icons/empty_star.png'

    const decimalPart = averageRating - Math.floor(averageRating)
    if (index + 1 <= Math.floor(averageRating)) {
      return fullStarUrl
    } else if (decimalPart >= 0.1 && decimalPart <= 0.9 && index === Math.floor(averageRating)) {
      return halfStarUrl
    } else {
      return emptyStarUrl
    }
  }

  formatAbout(text: string): string {
    if (!text) return text
    return text
      .replace(/\n/g, '<br>')
      .replace(/\u2022/g, '&bull;')
      .replace(/\\u2019/g, '&#8217;')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  }

  add(a: number, b: number): number {
    return a + b
  }

  redirect() {
    const url = sessionStorage.getItem('currentURL')
    if (url) {
      const path = url.startsWith('http') ? new URL(url).pathname : url
      this.router.navigateByUrl(path)
    } else {
      // Navigation is now language-agnostic; translations handled via ngx-translate
      this.router.navigateByUrl('/page/home')
    }
  }

  toggleCardLimit() {
    if (this.cardLimit === 5) {
      this.cardLimit = this.filteredCourseData().length
    } else {
      this.cardLimit = 5
    }
  }

  gotoOverview(identifier: any) {
    sessionStorage.setItem('cURL', location.href)
    this.router.navigate([`/app/toc/${identifier}/overview`])
  }

  showMoreCourses() {
    this.router.navigate(['/app/org-details/all-courses'], { queryParams: { orgId: this.orgName } })
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }

  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.showEndPopup = true
      this.target.targetOffsetX = event.clientX + 1
    }
  }

  loginRedirect(contentId: any) {
    this.router.navigateByUrl(`/app/toc/${contentId}/overview`)
  }

  ngOnDestroy() {
    this.orgService.hideHeaderFooter.next(false)
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    this.orgService.hideHeaderFooter.next(false)
  }

  goToLink(a: string) {
    window.open(a, '_blank')
  }

  showIcon(index: number) {
    if (this.rating >= index + 1) {
      return 'star'
    }
    return 'star_border'
  }

  groupCompetenciesById(courseData: any[]): any[] {
    const grouped: { [key: string]: any } = {}

    courseData.forEach((course: any) => {
      if (course?.competencies_v1) {
        let competencies
        try {
          competencies = JSON.parse(course.competencies_v1)
        } catch (err) {
          competencies = []
        }

        competencies.forEach((comp: any) => {
          if (comp?.competencyId && comp?.level) {
            const key = `${course.identifier}_${comp.competencyId}`

            if (!grouped[key]) {
              grouped[key] = {
                identifier: course.identifier,
                competencyId: comp.competencyId,
                name: comp.competencyName,
                levels: [],
              }
            }

            grouped[key].levels.push(`Level ${comp.level}`)
          }
        })
      }
    })
    const value = Object.values(grouped)
    this.logger.log("grouped", value)
    return value
  }
}