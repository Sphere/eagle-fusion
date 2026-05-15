import { Component, OnInit, ElementRef, effect, OnDestroy, Inject, PLATFORM_ID } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { ValueService, ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { ScrollService } from '../../services/scroll.service'
import { LanguageService } from '../../services/language.service'
import { PlaylistService } from '../../services/playlist.service'
import { ThemeService } from '../../services/theme.service'

@Component({
  standalone: false,
  selector: 'ws-web-home',
  templateUrl: './web-home.component.html',
  styleUrls: ['./web-home.component.scss'],

})
export class WebHomeComponent implements OnInit, OnDestroy {
  showCreateBtn = false
  bannerStatus: any
  currentSlideIndex = 0
  imgsLoaded: boolean[] = []
  private intervalId: any
  lang: any = 'en'
  dataCarousel: any
  config: any
  isXsmall = false
  isDark: boolean
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private valueSvc: ValueService,
    public configSvc: ConfigurationsService,
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    private languageSvc: LanguageService,
    private playlsSvc: PlaylistService,
    private logger: LoggerService,
    private themeSvc: ThemeService
  ) {
    effect(() => {
      if (this.valueSvc.isMobile()) {
        this.isXsmall = true
        this.showCreateBtn = this.configSvc.userProfile === null ? true : false
      } else {
        this.isXsmall = false
        this.showCreateBtn = false
      }
      this.isDark = this.themeSvc.isDark()
    })
  }

  async ngOnInit() {
    const res = this.playlsSvc.bodyConfig()
    if (res == '') {
      const res = await this.playlsSvc.loadPlaylistData()
      this.config = res?.LAYOUT_BODY[0]
    } else {
      this.config = res[0]
    }
    if (this.configSvc?.unMappedUser?.profileDetails?.preferences?.language) {
      this.lang = this.configSvc.unMappedUser.profileDetails.preferences.language
    } else {
      this.lang = this.languageSvc?.getCurrentLanguage() || 'en'
    }
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      this.logger.log("yes here scroll", targetDivId)
      if (['scrollToHowSphereWorks', 'scrollToCneCourses'].includes(targetDivId)) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
    this.dataCarousel = this.config?.data
    this.bannerStatus = this.config?.bannerStats
    this.imgsLoaded = new Array(this.dataCarousel?.length || 0).fill(false)
    this.startCarousel()
  }
  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
  ngOnDestroy(): void {
    this.clearInterval()
  }
  startCarousel(): void {
    if (!isPlatformBrowser(this.platformId)) return
    this.intervalId = setInterval(() => {
      this.nextSlide()
    }, 3000)
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
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.dataCarousel.length) % this.dataCarousel?.length
  }

  goToSlide(index: number): void {
    this.clearInterval()
    this.currentSlideIndex = index
    this.startCarousel()
  }
  onBannerImgLoad(index: number): void {
    this.imgsLoaded[index] = true
  }

  scrollToHowSphereWorks(value: string) {
    this.scrollService.scrollToDivEvent.emit(value)
  }

}
