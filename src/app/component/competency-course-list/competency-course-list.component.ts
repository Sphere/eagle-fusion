import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core'
import { Observable, Subject, of } from 'rxjs'
import { concatMap, debounceTime, filter, pairwise, startWith, takeUntil } from 'rxjs/operators'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { MobileDashboardService } from './services/mobile-dashboard.service'
import { CompetencyUserService } from './services/competency-user.service'

@Component({
  standalone: false,
  selector: 'app-competency-course-list',
  templateUrl: './competency-course-list.component.html',
  styleUrls: ['./competency-course-list.component.scss'],
})
export class CompetencyCourseListComponent implements OnInit, OnDestroy {
  @Input() playlists: any[] = []
  @Input() role = ''
  @Input() designation = ''
  @Input() section: any
  @Input() autoInit = true

  isLoading = false
  ashaData: any[] = []
  inProgressCourses: any[] = []
  completedCourses: any[] = []
  showAllCourses = false

  competencyHomeData: any[] = []
  showanmHome = false
  competencyRoles = false
  roleCompetencyData: string[] = []
  competencyLevelsData: any[] = []
  defaultLang = 'en'

  isTablet = false

  private userId = ''
  private destroy$ = new Subject<void>()

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private dashboardSvc: MobileDashboardService,
    private userSvc: CompetencyUserService
  ) {
    effect(() => {
      this.isTablet = !this.valueSvc.isMobile()
    })
  }

  ngOnInit(): void {
    this.userId = this.configSvc?.userProfile?.userId || ''
    this.initializeLanguage()
    console.log(
      'Role and Designation in Competency Component',
      this.role,
      this.designation
    )
    console.log('playlists data ', this.playlists)
    this.initializeUpdateValueSubscription()
    if (this.autoInit) this.initData()
  }

  private initializeLanguage(): void {
    const lang = this.configSvc?.userProfile?.['language'] || 'en'
    this.defaultLang = lang
  }

  private initializeUpdateValueSubscription(): void {
    this.userSvc.updateValue$
      .pipe(
        startWith(null),
        pairwise(),
        debounceTime(300),
        filter(([prev, curr]) => prev !== curr && curr !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(([, curr]) => {
        this.defaultLang = curr?.language || this.defaultLang
        this.initData()
      })
  }

  initData(): void {
    this.isLoading = true
    this.competencyOrgData()
      .pipe(
        concatMap(() => this.getCompetencyData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ ashaData, completedCourses, inProgressCourses }) => {
          this.ashaData = ashaData
          this.completedCourses = completedCourses
          this.inProgressCourses = inProgressCourses
          this.isLoading = false
        },
        error: () => { this.isLoading = false },
      })
  }

  private competencyOrgData(): Observable<any> {
    if (Array.isArray(this.playlists) && this.playlists.length) {
      this.competencyHomeData = this.playlists
      this.showanmHome = true
      return of(this.competencyHomeData)
    }
    this.showanmHome = false
    return of(null)
  }

  private getCompetencyData(): Observable<{ ashaData: any[], completedCourses: any[], inProgressCourses: any[] }> {
    const rootOrgId = this.configSvc?.userProfile?.rootOrgId || ''

    this.roleCompetencyData = []
    this.competencyLevelsData = []

    const result = this.dashboardSvc.getCompetencyInfo(this.competencyHomeData, rootOrgId, this.designation)
    if (!result) return of({ ashaData: [], completedCourses: [], inProgressCourses: [] })

    this.competencyRoles = result.isUserDesignationInRoles
    this.roleCompetencyData = result.competencyIds
    this.competencyLevelsData = result.competencyLevels

    return this.dashboardSvc.getAshaData(
      this.defaultLang,
      this.competencyLevelsData,
      this.roleCompetencyData,
      this.userId
    )
  }

  getVisibleCourses(): any[] {
    if (this.showAllCourses) return this.inProgressCourses
    if (!this.isTablet) return this.inProgressCourses.slice(0, 4)
    const tabCount = this.section?.tabCardCount
    if (typeof tabCount !== 'number') return this.inProgressCourses.slice(0, 5)
    return this.completedCourses.length
      ? this.inProgressCourses.slice(0, tabCount)
      : this.inProgressCourses.slice(0, tabCount + 1)
  }

  shouldShowViewAll(): boolean {
    return this.inProgressCourses.length > this.getVisibleCourses().length || this.showAllCourses
  }

  viewAllCourse(): void {
    this.showAllCourses = !this.showAllCourses
  }

  trackByCourse(_index: number, course: any): string {
    return course?.contentId || _index
  }

  readonly SKELETON_ITEMS = [1, 2, 3, 4]

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
