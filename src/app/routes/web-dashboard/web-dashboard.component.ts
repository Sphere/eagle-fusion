import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { LanguageService } from 'src/app/services/language.service'
import * as _ from 'lodash'
import { PlaylistService } from '../../services/playlist.service'
import { LoggerService } from '../../../../library/ws-widget/utils/src/public-api'
@Component({
  selector: 'ws-dashboard',
  templateUrl: './web-dashboard.component.html',
  styleUrls: ['./web-dashboard.component.scss'],
})
export class WebDashboardComponent implements OnInit {
  firstName: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  userData: any
  @Input() isEkshamata: any
  dataCarousel: any = []
  bannerFirstImage: any
  bannerSecondImage: any
  currentSlideIndex = 0;
  currentIndex = 0;
  public intervalId: any
  lang: any = 'en'
  domain!: any
  @Input() configData: any
  @Input() userEnrolledCourse: any = []
  uiConfig: any
  playListIds: any[] = [];
  noOfBadges: number = 0;
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public scrollService: ScrollService,
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    private languageSvc: LanguageService,
    private plylsSvc: PlaylistService,
    private logger: LoggerService
  ) {

    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  get shouldShowBadges(): boolean {
    // Only show if showCompletedCourses is true and we have badges
    return this.uiConfig?.badges?.showCompletedCourses === true && this.noOfBadges > 0
  }

  async ngOnInit() {
    this.logger.log(this.configData, 'configData ****** ')
    this.uiConfig = this.configData?.[0]
    this.dataCarousel = this.uiConfig?.data
    if (this.isEkshamata) {
      this.domain = window.location.hostname
      this.logger.log("yes here", this.isEkshamata)
      if (this.configSvc.hostedInfo || this.domain.includes('ekshamata') || this.domain.includes('localhost')) {
        this.logger.log("yes here2 ", this.configSvc.hostedInfo)
        this.bannerFirstImage = '/fusion-assets/images/ekshamata-logo.svg'
        this.bannerSecondImage = '/fusion-assets/images/ekshamata-group.svg'
        this.logger.log("this.configSvc.hostedInfo: ", this.configSvc.hostedInfo)
      }
    }
    if (this.configSvc?.unMappedUser?.profileDetails?.preferences?.language) {
      this.lang = this.configSvc.unMappedUser.profileDetails.preferences.language
    } else {
      this.lang = this.languageSvc.getCurrentLanguage()
    }
    this.startCarousel()
    this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(async (data: any) => {
      this.userData = await data
      this.firstName = _.get(this.userData, 'profileDetails.profileReq.personalDetails.firstname', '')
    })

    // Set preferred language from LanguageService
    this.preferedLanguage = {
      id: this.languageSvc.getCurrentLanguage(),
      lang: this.languageSvc.getCurrentLanguage() === 'hi' ? 'हिंदी' : 'English'
    }
    await this.calculateBadges()
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
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.dataCarousel?.length
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.dataCarousel?.length) % this.dataCarousel?.length
  }

  goToSlide(index: number): void {
    this.currentIndex = index
    this.clearInterval() // Stop automatic sliding when manually navigating
    setTimeout(() => {
      this.currentSlideIndex = index // Set the current slide index manually after a short delay
    }, 0)
    this.logger.log('Navigating to slide:', index)
  }
  scrollToHowSphereWorks(value: string) {
    this.scrollService.scrollToDivEvent.emit(value)
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
      this.playListIds = res.find((item: any) => item.language === currentLanguage)?.dataSource?.payload || []
      let data = this.userEnrolledCourse?.filter(item => this.playListIds?.includes(item.identifier))
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
