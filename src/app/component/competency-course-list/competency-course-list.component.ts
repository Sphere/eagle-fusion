import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  signal,
  effect,
} from '@angular/core'
import { Observable, Subject, of } from 'rxjs'
import { concatMap, debounceTime, filter, pairwise, startWith, takeUntil } from 'rxjs/operators'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { MobileDashboardService } from './services/mobile-dashboard.service'
import { CompetencyUserService } from './services/competency-user.service'
import { LanguageService } from '../../services/language.service'
import { PlaylistService } from '../../services/playlist.service'

@Component({
  standalone: false,
  selector: 'app-competency-course-list',
  templateUrl: './competency-course-list.component.html',
  styleUrls: ['./competency-course-list.component.scss'],
})
export class CompetencyCourseListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() playlists: any[] = []
  @Input() role = ''
  @Input() designation = ''
  @Input() section: any
  @Input() autoInit = true

  // View-bound state as signals so assigning data inside async (HTTP) callbacks
  // always triggers the view update in Angular 21 — independent of zone timing.
  isLoading = signal(false)
  ashaData = signal<any[]>([])
  inProgressCourses = signal<any[]>([])
  completedCourses = signal<any[]>([])
  showAllCourses = signal(false)
  isTablet = signal(false)

  competencyHomeData: any[] = []
  showanmHome = false
  competencyRoles = false
  roleCompetencyData: string[] = []
  competencyLevelsData: any[] = []
  defaultLang = 'en'

  private userId = ''
  private destroy$ = new Subject<void>()

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private dashboardSvc: MobileDashboardService,
    private userSvc: CompetencyUserService,
    private langSvc: LanguageService,
    private playlistSvc: PlaylistService
  ) {
    effect(() => {
      this.isTablet.set(!this.valueSvc.isMobile())
    })
  }

  ngOnInit(): void {
    this.userId = this.configSvc?.userProfile?.userId || ''
    this.initializeLanguage()
    this.initializeUpdateValueSubscription()
    if (this.autoInit) this.initData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playlists'] && !changes['playlists'].firstChange && this.playlists?.length) {
      this.initData()
    }
  }

  private initializeLanguage(): void {
    const lang = this.langSvc.getCurrentLanguage() || this.configSvc?.userProfile?.['language'] || 'en'
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
    this.isLoading.set(true)
    this.competencyOrgData()
      .pipe(
        concatMap(() => this.getCompetencyData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ ashaData, completedCourses, inProgressCourses }) => {
          this.ashaData.set(ashaData)
          this.completedCourses.set(completedCourses)
          this.inProgressCourses.set(inProgressCourses)
          this.isLoading.set(false)
        },
        error: () => { this.isLoading.set(false) },
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

    const competencyConfigId = this.playlistSvc.getPlaylistConfigId(this.section?.sectionId)
    const result = this.dashboardSvc.getCompetencyInfo(this.competencyHomeData, rootOrgId, this.designation, competencyConfigId)
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
    const inProgress = this.inProgressCourses()
    if (this.showAllCourses()) return inProgress
    if (!this.isTablet()) return inProgress.slice(0, 4)
    const tabCount = this.section?.tabCardCount
    if (typeof tabCount !== 'number') return inProgress.slice(0, 5)
    return this.completedCourses().length
      ? inProgress.slice(0, tabCount)
      : inProgress.slice(0, tabCount + 1)
  }

  shouldShowViewAll(): boolean {
    return this.inProgressCourses().length > this.getVisibleCourses().length || this.showAllCourses()
  }

  viewAllCourse(): void {
    this.showAllCourses.set(!this.showAllCourses())
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
