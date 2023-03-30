import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

const endpoint = {
  webview_login: 'apis/public/v8/mobileApp/webviewLogin'
}

@Injectable({
  providedIn: 'root'
})
export class AppCallBackService {

  constructor(
    private http: HttpClient,
  ) { }

  webviewCookieSet() {
    return this.http.get<any>(endpoint.webview_login)
  }
}
