import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AppCallBackService } from '../../services/app-call-back.service'
import { get } from 'lodash'

@Component({
  standalone: false,
  selector: 'ws-app-call-back',
  templateUrl: './app-call-back.component.html',
  styleUrls: ['./app-call-back.component.scss'],

})
export class AppCallBackComponent {

  token: any
  isLoading = false

  constructor(
    public activated: ActivatedRoute,
    private readonly appCallBackService: AppCallBackService
  ) {
    this.activated.queryParamMap.subscribe(queryParams => {
      if (get(queryParams, 'params.x-authenticated-user-token')) {
        this.isLoading = true
        this.token = queryParams.get('x-authenticated-user-token')
        this.webviewCookieSet()
      }
    })
  }

  webviewCookieSet() {
    if (this.token) {
      this.appCallBackService.webviewCookieSet(this.token).subscribe((data: any) => {
        if (get(data, 'redirectUrl')) {
          window.location = data.redirectUrl
        }
      })
    }
  }

}
