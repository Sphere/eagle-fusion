import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
@Component({
  selector: 'ws-web-dashboard',
  templateUrl: './web-dashboard.component.html',
  styleUrls: ['./web-dashboard.component.scss'],
})
export class WebDashboardComponent implements OnInit {
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any = []
  userEnrollCourse: any
  videoData: any
  homeFeatureData: any
  homeFeature: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  // languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  userData: any
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
  userId: any
  currentSlideIndex = 0;
  currentIndex = 0;
  public intervalId: any
  lang: any = 'en'
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public scrollService: ScrollService,
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  ngOnInit() {
    this.lang = this.configSvc!.unMappedUser
      ? (this.configSvc!.unMappedUser.profileDetails!.preferences!.language || 'en')
      : location.href.includes('/hi/') ? 'hi' : 'en'

    this.startCarousel()
    this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(async (data: any) => {
      this.userData = await data
      this.firstName = _.get(this.userData, 'profileDetails.profileReq.personalDetails.firstname', '')
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
