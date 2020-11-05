import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class ContentPickerV2Service {

  constructor(
    private http: HttpClient,
  ) { }

  getData(url: string) {
    return this.http.get<any>(url)
  }
}
