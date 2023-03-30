import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AppCallBackService } from '../../services/app-call-back.service'
import * as _ from 'lodash'

@Component({
  selector: 'ws-app-call-back',
  templateUrl: './app-call-back.component.html',
  styleUrls: ['./app-call-back.component.scss']
})
export class AppCallBackComponent implements OnInit {

  token: any

  constructor(
    public activated: ActivatedRoute,
    private appCallBackService: AppCallBackService
  ) { }

  ngOnInit() {
    this.activated.queryParamMap.subscribe(queryParams => {
      if (_.get(queryParams, 'x-authenticated-user-token')) {
        this.token = queryParams.get('x-authenticated-user-token')
      }
    })
    if (this.token) {
      this.webviewCookieSet()
    }
  }

  webviewCookieSet() {
    if (this.token) {
      this.appCallBackService.webviewCookieSet().subscribe((data: any) => {
        if (_.get(data, 'redirectUrl')) {
          window.location = data.redirecturl
        }
      })
    }
  }

}
