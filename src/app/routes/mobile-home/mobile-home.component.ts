import { Component, OnInit, HostListener } from '@angular/core'
import { Router } from '@angular/router'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'ws-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
})
export class MobileHomeComponent implements OnInit {
  showCreateBtn = false
  bannerStatus: any
  currentSlideIndex = 0;
  currentIndex = 0;
  private intervalId: any
  lang: any = 'en'
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
  constructor(private router: Router, private valueSvc: ValueService, public configSvc: ConfigurationsService,

    private scrollService: ScrollService,
  ) { }

  ngOnInit() {
    this.lang = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    this.startCarousel()
    this.bannerStatus = this.configSvc.bannerStats
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
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
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.dataCarousel.length
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.dataCarousel.length) % this.dataCarousel.length
  }

  goToSlide(index: number): void {
    this.currentIndex = index
    this.clearInterval() // Stop automatic sliding when manually navigating
    setTimeout(() => {
      this.currentSlideIndex = index // Set the current slide index manually after a short delay
    }, 0)
    console.log('Navigating to slide:', index)
  }
  scrollToHowSphereWorks(value: string) {
    this.scrollService.scrollToDivEvent.emit(value)
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
  }
  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }

}
