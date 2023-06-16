import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'

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
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  //languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private scrollService: ScrollService,
    private configSvc: ConfigurationsService,


  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }
  scrollToHowSphereWorks() {
    this.scrollService.scrollToDivEvent.emit('scrollToHowSphereWorks')
  }
  ngOnInit() {
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


    if (this.configSvc.userProfile) {
      this.firstName = this.configSvc.userProfile
      this.userId = this.configSvc.userProfile.userId || ''

    }

  }

}
