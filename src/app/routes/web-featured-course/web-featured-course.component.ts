import { HttpClient } from '@angular/common/http'
import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { forkJoin } from 'rxjs'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import reduce from 'lodash/reduce'
import uniqBy from 'lodash/uniqBy'
import forEach from 'lodash/forEach'

import { MatDialog } from '@angular/material'

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
  //languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  isFeaturedCourse!: boolean
  constructor(private orgService: OrgServiceService,
    private configSvc: ConfigurationsService,
    private userSvc: WidgetUserService,
    private router: Router,
    private http: HttpClient,
    public dialog: MatDialog,



  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
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
      forkJoin([this.userSvc.fetchUserBatchList(this.userId), this.orgService.getLiveSearchResults(this.preferedLanguage.id),
      this.http.get(`assets/configurations/mobile-home.json`)]).pipe().subscribe((res: any) => {
        this.homeFeature = res[2].userLoggedInSection
        this.topCertifiedCourseIdentifier = res[2].topCertifiedCourseIdentifier
        this.featuredCourseIdentifier = res[2].featuredCourseIdentifier
        console.log("this.featuredCourseIdentifier", this.featuredCourseIdentifier)
        this.formatmyCourseResponse(res[0])
        if (res[1].result.content.length > 0) {
          this.formatTopCertifiedCourseResponse(res[1])
          this.formatFeaturedCourseResponse(res[1])
        }
        if (!this.isEmpty(this.featuredCourse)) {
          this.isFeaturedCourse = true
        }
        console.log("featuredCourse", this.featuredCourse)
      })
    } else {
      this.isFeaturedCourse = false
    }


  }
  isEmpty(obj: any) {
    return Object.keys(obj).length === 0
  }

  formatFeaturedCourseResponse(res: any) {
    console.log("res", res.result.content, this.featuredCourseIdentifier)
    const featuredCourse = filter(res.result.content, ckey => {
      return includes(this.featuredCourseIdentifier, ckey.identifier)
    })

    this.featuredCourse = reduce(uniqBy(featuredCourse, 'identifier'), (result, value) => {
      console.log(value)
      result['identifier'] = value.identifier
      result['appIcon'] = value.appIcon
      result['name'] = value.name
      result['description'] = value.description
      return result

    }, {})
  }

  formatTopCertifiedCourseResponse(res: any) {

    const topCertifiedCourse = filter(res.result.content, ckey => {
      return includes(this.topCertifiedCourseIdentifier, ckey.identifier)
    })

    this.topCertifiedCourse = uniqBy(topCertifiedCourse, 'identifier')
  }
  formatmyCourseResponse(res: any) {
    const myCourse: any = []
    let myCourseObject = {}
    forEach(res, key => {
      if (res.completionPercentage !== 100) {
        myCourseObject = {
          identifier: key.content.identifier,
          appIcon: key.content.appIcon,
          thumbnail: key.content.thumbnail,
          name: key.content.name,
        }
        myCourse.push(myCourseObject)
      }
    })
    this.userEnrollCourse = myCourse
  }


}
