import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, Signal, ChangeDetectorRef, effect } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { map } from 'rxjs/operators'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LanguageService } from 'src/app/services/language.service'
import * as _ from 'lodash'
import { PlaylistService } from '../../services/playlist.service'
import { LoggerService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { ThemeService } from '../../services/theme.service'
import { getPortalHost } from '../../constants/portal'
import { buildCompetencySearchArray } from '../../utils/competency-search.util'
@Component({
  standalone: false,
  selector: 'ws-dashboard',
  templateUrl: './web-dashboard.component.html',
  styleUrls: ['./web-dashboard.component.scss'],

})
export class WebDashboardComponent implements OnInit, OnChanges, OnDestroy {
  firstName!: Signal<string>
  preferedLanguage: any = { id: 'en', lang: 'English' }
  @Input() isEkshamata: any
  dataCarousel: any = []
  bannerFirstImage: any
  bannerSecondImage: any
  currentSlideIndex = 0
  public intervalId: any
  imgsLoaded: boolean[] = []
  lang: any = 'en'
  domain!: any
  @Input() configData: any
  @Input() userEnrolledCourse: any = []
  @Input() programConfig!: any
  uiConfig: any
  playListIds: any[] = []
  noOfBadges = 0
  isDark: boolean = false
  isXsmall: boolean = false
  constructor(
    public readonly router: Router,
    public readonly dialog: MatDialog,
    public readonly scrollService: ScrollService,
    public readonly configSvc: ConfigurationsService,
    public readonly userProfileSvc: UserProfileService,
    private readonly languageSvc: LanguageService,
    private readonly plylsSvc: PlaylistService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeSvc: ThemeService,
    private readonly valueSvc: ValueService
  ) {
    effect(() => {
      this.isDark = this.themeSvc.isDark()
      this.isXsmall = this.valueSvc.isMobile()
      this.bannerSecondImage = this.isDark && this.isEkshamata ? "/fusion-assets/images/ekshamata-group-dark.svg" : '/fusion-assets/images/ekshamata-group.svg'
    })
    this.firstName = toSignal(
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(
        map((data: any) => _.get(data, 'profileDetails.profileReq.personalDetails.firstname', '') as string)
      ),
      { initialValue: '' }
    )
  }

  get shouldShowBadges(): boolean {
    // Only show if showCompletedCourses is true and we have badges
    return this.uiConfig?.badges?.showCompletedCourses === true && this.noOfBadges > 0
  }

  ngOnInit() {
    void (async () => {
      if (localStorage.getItem('orgValue') === 'nhsrc') {
        this.router.navigateByUrl('/organisations/home')
      }
      this.logger.log(this.configData, 'configData ****** ')
      this.uiConfig = this.configData?.[0]
      this.dataCarousel = this.uiConfig?.data
      this.imgsLoaded = (this.dataCarousel || []).map(() => false)
      if (this.isEkshamata) {
        this.domain = getPortalHost()
        this.logger.log("yes here", this.isEkshamata)
        if (this.configSvc.hostedInfo || this.domain.includes('ekshamata')) {
          this.logger.log("yes here2 ", this.configSvc.hostedInfo)
          this.bannerFirstImage = '/fusion-assets/images/ekshamata-logo.svg'
          this.logger.log("this.configSvc.hostedInfo: ", this.configSvc.hostedInfo)
        }
      }
      if (this.configSvc?.unMappedUser?.profileDetails?.preferences?.language) {
        this.lang = this.configSvc.unMappedUser.profileDetails.preferences.language
      } else {
        this.lang = this.languageSvc.getCurrentLanguage()
      }
      this.startCarousel()

      // Set preferred language from LanguageService
      this.preferedLanguage = {
        id: this.languageSvc.getCurrentLanguage(),
        lang: this.languageSvc.getCurrentLanguage() === 'hi' ? 'हिंदी' : 'English',
      }
      await this.calculateBadges()
    })()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userEnrolledCourse'] && !changes['userEnrolledCourse'].firstChange) {
      void this.calculateBadges()
    }
  }

  ngOnDestroy(): void {
    this.clearInterval()
  }
  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide()
    }, 3000) // Change slide every 3 seconds (adjust as needed)
  }

  clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }


  nextSlide(): void {
    if (!this.dataCarousel?.length) return
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.dataCarousel.length
    this.cdr.detectChanges()
  }

  onBannerImgLoad(index: number): void {
    this.imgsLoaded[index] = true
    this.cdr.detectChanges()
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.dataCarousel?.length) % this.dataCarousel?.length
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index
    this.clearInterval()
    this.startCarousel() // restart auto-play after manual nav
  }
  scrollToHowSphereWorks(value: string) {
    this.scrollService.scrollToDivEvent.emit(value)
  }

  private handleCompetencyFlow(roleCheck: (roles: string[]) => boolean, plyLsData: any[]): boolean {
    const competencyConfigId = this.plylsSvc.getPlaylistConfigId('COMPETENCY_PLAYLIST')
    const competencyPlaylist = plyLsData?.find((element: any) =>
      element.language === this.lang &&
      element.playlistId === competencyConfigId &&
      roleCheck(element.role)
    )
    if (!competencyPlaylist) {
      return false
    }
    this.playListIds = buildCompetencySearchArray(competencyPlaylist?.dataSource?.payload || [])
    if (this.playListIds.length > 0) {
      return true
    }
    return false
  }

  private async calculateBadges(): Promise<void> {
    try {
      if (!this.uiConfig?.badges?.showCompletedCourses) {
        this.noOfBadges = 0
        this.plylsSvc.setEarnedBadges(0)
        this.logger.log('Badge calculation skipped - disabled in config')
        return
      }
      const currentLanguage = this.configSvc?.userProfile?.language || 'en'
      const res = await this.plylsSvc.getPlaylistConfig()
      const designationLower = (this.configSvc?.unMappedUser?.profileDetails?.profileReq?.professionalDetails?.[0]?.designation || '').toLowerCase()
      const roleCheck = (roles: string[]) => roles?.some(r => r.toLowerCase() === designationLower)

      if (!!this.programConfig) {
        const configIds = (this.programConfig.programs || []).map((item: any) => item.playlistConfigId)
        this.playListIds = res
          .filter((item: any) => item.language === currentLanguage && configIds.includes(item.playlistId))
          .reduce((acc: any[], item: any) => {
            if (item.dataSource?.type === 'competency') {
              return acc.concat(buildCompetencySearchArray(item.dataSource?.payload || []))
            }
            return acc.concat(item.dataSource?.payload || [])
          }, [])
      } else if (this.handleCompetencyFlow(roleCheck, res)) {
        // Competency user — playListIds already resolved inside handleCompetencyFlow.
      } else {
        const yourPlansConfigId = this.plylsSvc.getPlaylistConfigId('YOUR_PLANS_PLAYLIST')
        this.playListIds = res.find((item: any) =>
          item.language === currentLanguage &&
          item.playlistId === yourPlansConfigId &&
          roleCheck(item.role)
        )?.dataSource?.payload || []
      }

      const data = this.userEnrolledCourse?.filter(item => this.playListIds?.includes(item.identifier))
      const completedCourses = data?.filter(item => item.completionPercentage === 100)

      this.noOfBadges = completedCourses.length
      this.plylsSvc.setEarnedBadges(this.noOfBadges)

      this.logger.log('Badge count calculated:', this.noOfBadges)
    } catch (error) {
      this.logger.error('Error calculating badges:', error)
      this.noOfBadges = 0
      this.plylsSvc.setEarnedBadges(0)
    }
  }
}
