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
  constructor(
    private router: Router,

  ) {
    const navigation = this.router.getCurrentNavigation()
    if (navigation) {
      const extraData = navigation.extras.state as {
        tocData: any
      }
      this.tocData = extraData.tocData
    }
  }
  ngOnInit() {
    console.log(this.tocData)
  }
  ngOnDestroy() {

  }
}
