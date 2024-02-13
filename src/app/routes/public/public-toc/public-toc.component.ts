import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import includes from 'lodash/includes'
import find from 'lodash/find'
import { UserProfileService } from 'project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { OrgServiceService } from '../../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-public-toc',
  templateUrl: './public-toc.component.html',
  styleUrls: ['./public-toc.component.scss'],
})
export class PublicTocComponent implements OnInit, OnDestroy {
  tocData: any
  routelinK = 'overview'
  courseid: any
  isLoading = false
  constructor(
    private router: Router,
    private orgService: OrgServiceService,
    private activeRoute: ActivatedRoute,
    private userProfileSvc: UserProfileService,
  ) {

  }
  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      // console.log(params)
      this.courseid = params['courseid'] !== undefined ? params['courseid'] : params['courseId']
      if (localStorage.getItem('userUUID')) {
        this.isLoading = true
        let id = localStorage.getItem('userUUID') || ''
        this.userProfileSvc.getUserdetailsFromRegistry(id).subscribe((data: any) => {
          console.log(data)
          if (data) {
            let lang = (data.unMappedUser && data.unMappedUser!.profileDetails && data.unMappedUser!.profileDetails!.preferences && data.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? data.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
            let url1 = lang === 'hi' ? 'hi' : ""
            let url3 = `${document.baseURI}`
            if (url3.includes('hi')) {
              url3 = url3.replace(/hi\//g, '')
            }
            let url = `/app/toc/${this.courseid}/overview`
            location.href = `${url3}${url1}${url}`
            this.isLoading = false
          }
        }, (err: any) => {
          console.log(err)
          if (err.status === '404' || err.status === '419') {
            console.log(err.status, '50')
          }
        })
      }

    })
    // const navigation = this.router.getCurrentNavigation()
    // if (navigation) {
    //   const extraData = navigation.extras.state as {
    //     tocData: any
    //   }
    //   console.log(extraData.tocData)
    //   if (extraData) {
    //     this.tocData = extraData.tocData
    //   }
    // }
    if (localStorage.getItem('tocData')) {
      localStorage.removeItem('tocData')
      // const data: any = localStorage.getItem('tocData')
      // this.tocData = JSON.parse(data)
    }
    // console.log(this.tocData, this.courseid)
    if (this.tocData === undefined) {
      this.seachAPI(this.courseid)
    }
    this.checkRoute()
  }
  checkRoute() {
    if (includes(this.router.url, 'overview')) {
      this.toggleComponent('overview')
    } else if (includes(this.router.url, 'contents')) {
      this.toggleComponent('contents')
    } else {
      this.toggleComponent('license')
    }
  }
  toggleComponent(cname: string) {
    this.routelinK = ''
    if (cname === 'overview') {
      this.routelinK = 'overview'
    } else if (cname === 'contents') {
      this.routelinK = 'contents'
    } else if (cname === 'license') {
      this.routelinK = 'license'
    }
  }
  seachAPI(id: any) {
    this.orgService.getSearchResultsById(id).subscribe((res: any) => {
      if (res) {
        find(res.result.content
          , findRes => {
            if (findRes.identifier === id) {
              this.tocData = findRes
              localStorage.setItem('tocData', JSON.stringify(this.tocData))
              localStorage.setItem(`url_before_login`, `app/toc/` + `${id}` + `/overview`)
            }

          })
        return this.tocData
      }
    })
    return this.tocData
  }
  ngOnDestroy() {

  }
}
