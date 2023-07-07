import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'ws-web-featured-course',
  templateUrl: './web-featured-course.component.html',
  styleUrls: ['./web-featured-course.component.scss'],
})
export class WebFeaturedCourseComponent implements OnInit {
  @Input() courseData: any
  myCourse: any
  topCertifiedCourse: any = []
  featuredCourse: any
  userEnrollCourse: any
  videoData: any
  homeFeatureData: any
  homeFeature: any
  userId: any
  firstName: any
  topCertifiedCourseIdentifier: any = []
  featuredCourseIdentifier: any = []
  isLoggedIn: boolean = false
  //languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  isFeaturedCourse!: boolean
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public configSvc: ConfigurationsService,
    private titleService: Title

  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
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
  login(data: any) {
    const name = `${data.name} - Aastrika`
    this.titleService.setTitle(name)
    this.router.navigate(['/public/toc/overview'], {
      state: {
        tocData: data,
      },
      queryParams: {
        courseId: data.identifier,
      },
    })
    localStorage.setItem('tocData', JSON.stringify(data))
    localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
  }

}
