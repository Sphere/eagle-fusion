import { ConfigurationsService } from '@ws-widget/utils'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

const ENDPOINTS = {
  checkIntranet: 'https://intranet.link',
}
@Injectable({
  providedIn: 'root',
})
export class IntranetSelectorService {
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  isLoading(
    url = this.configSvc.instanceConfig && this.configSvc.instanceConfig.intranetUrlToCheck ?
      this.configSvc.instanceConfig.intranetUrlToCheck : ENDPOINTS.checkIntranet,
  ): any {
    return this.http.get<any>(url, { responseType: 'text' as 'json' }).toPromise()
  }
}
