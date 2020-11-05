import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class BtnFeatureService {

  constructor(
    private http: HttpClient,
  ) { }

  getBadgeCount(endpoint: string) {
    return this.http.get<number>(endpoint).toPromise()
  }
}
