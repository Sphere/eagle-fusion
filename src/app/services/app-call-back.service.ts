import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { API_END_POINTS } from '../constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class AppCallBackService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  webviewCookieSet(token: string) {
    const headers = new HttpHeaders()
      .set('x-authenticated-user-token', token)
    return this.http.get<any>(API_END_POINTS.webview_login, { headers })
  }
}
