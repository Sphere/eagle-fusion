import { Component, OnInit, HostListener, ElementRef } from '@angular/core'
import { Router } from '@angular/router'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'ws-web-home',
  templateUrl: './web-home.component.html',
  styleUrls: ['./web-home.component.scss'],
})
export class WebHomeComponent implements OnInit {
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
      "img": "/fusion-assets/images/banner_1_cne.png",
      "scrollEmit": "scrollToCneCourses",
      "bg-color": "#D7AC5C;"
    },
    {
      "title": "Watch tutorials on how sphere works",
      "titleHi": "जानिए स्फीयर कैसे काम करता है",
      "img": "/fusion-assets/images/banner_2.png",
      "scrollEmit": "scrollToHowSphereWorks",
      "bg-color": "#469788;;"
    }
  ]
  constructor(private router: Router, private valueSvc: ValueService, public configSvc: ConfigurationsService,

    private scrollService: ScrollService, private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.lang = this.configSvc!.unMappedUser
      ? (this.configSvc!.unMappedUser.profileDetails!.preferences!.language || 'en')
      : location.href.includes('/hi/') ? 'hi' : 'en'

    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      console.log("yes here scroll", targetDivId)
      if (['scrollToHowSphereWorks', 'scrollToCneCourses'].includes(targetDivId)) {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
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

}
