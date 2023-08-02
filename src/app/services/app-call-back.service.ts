import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'

const endpoint = {
  webview_login: 'apis/public/v8/mobileApp/webviewLogin',
}

@Injectable({
  providedIn: 'root',
})
export class AppCallBackService {

  constructor(
    private http: HttpClient,
  ) { }

  webviewCookieSet(token: string) {
    const headers = new HttpHeaders()
      .set('x-authenticated-user-token', token)
    return this.http.get<any>(endpoint.webview_login, { headers })
  }
}
