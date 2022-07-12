import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import * as _ from 'lodash'

@Component({
  selector: 'ws-public-toc',
  templateUrl: './public-toc.component.html',
  styleUrls: ['./public-toc.component.scss']
})
export class PublicTocComponent implements OnInit, OnDestroy {
  tocData: any
  routelinK = 'overview'
  constructor(
    private router: Router,

  ) {

  }
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation()
    if (navigation) {
      const extraData = navigation.extras.state as {
        tocData: any
      }
      if (extraData) {
        this.tocData = extraData.tocData
      }
    }
    if (localStorage.getItem('tocData')) {
      const data: any = localStorage.getItem('tocData')
      this.tocData = JSON.parse(data)
    }
    this.router.navigate(['/public/toc/overview'])
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
  ngOnDestroy() {

  }
}
