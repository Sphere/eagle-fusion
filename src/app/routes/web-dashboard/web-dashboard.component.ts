import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
import { PlaylistService } from '../../services/playlist.service'
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
  @Input() isEkshamata: any
  dataCarousel: any = []
  bannerFirstImage: any
  bannerSecondImage: any
  userId: any
  currentSlideIndex = 0;
  currentIndex = 0;
  public intervalId: any
  lang: any = 'en'
  domain!: any
  configData: any
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public scrollService: ScrollService,
    public configSvc: ConfigurationsService,
    public userProfileSvc: UserProfileService,
    private playlistSvc: PlaylistService
  ) {

    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  ngOnInit() {
    // this.lang = this.configSvc!.unMappedUser
    //   ? (this.configSvc!.unMappedUser.profileDetails!.preferences!.language || 'en')
    //   : location.href.includes('/hi/') ? 'hi' : 'en'
    this.configData = this.playlistSvc.getHomeConfig()[0]
    this.dataCarousel = this.configData.data
    if (this.isEkshamata) {
      this.domain = window.location.hostname

      console.log("yes here", this.isEkshamata)
      if (this.configSvc.hostedInfo || this.domain.includes('ekshamata')) {
        console.log("yes here2 ", this.configSvc.hostedInfo)
        this.bannerFirstImage = '/fusion-assets/images/ekshamata-logo.svg'
        this.bannerSecondImage = '/fusion-assets/images/ekshamata-group.svg'
        console.log("this.configSvc.hostedInfo: ", this.configSvc.hostedInfo)
      }
    }
    if (this.configSvc &&
      this.configSvc.unMappedUser &&
      this.configSvc.unMappedUser.profileDetails &&
      this.configSvc.unMappedUser.profileDetails.preferences &&
      this.configSvc.unMappedUser.profileDetails.preferences.language) {
      this.lang = this.configSvc.unMappedUser.profileDetails.preferences.language
    } else {
      this.lang = location.href.includes('/hi/') ? 'hi' : 'en'
    }
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
