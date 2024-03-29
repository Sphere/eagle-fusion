import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import includes from 'lodash/includes'
import find from 'lodash/find'

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
  constructor(
    private router: Router,
    private orgService: OrgServiceService,
    private activeRoute: ActivatedRoute

  ) {

  }
  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      // console.log(params)
      this.courseid = params['courseid'] !== undefined ? params['courseid'] : params['courseId']
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
