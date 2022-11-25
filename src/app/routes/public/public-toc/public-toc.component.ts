import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'
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
      this.courseid = params['courseId']
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
    if (this.tocData === undefined) {
      this.seachAPI(this.courseid)
    }
    this.checkRoute()
  }
  checkRoute() {
    if (_.includes(this.router.url, 'overview')) {
      this.toggleComponent('overview')
    } else if (_.includes(this.router.url, 'contents')) {
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
    this.orgService.getSearchResults().subscribe((res: any) => {
      if (res) {
        _.find(res.result.content
          , findRes => {
            if (findRes.identifier === id) {
              this.tocData = findRes
              localStorage.setItem('tocData', JSON.stringify(this.tocData))
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
