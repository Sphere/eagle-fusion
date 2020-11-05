import { Injectable } from '@angular/core'
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@ws-widget/utils'

interface IResolverResponse {
  data: any
  error: any
}
@Injectable({
  providedIn: 'root',
})
export class TenantAdminResolverService implements Resolve<any> {

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private router: Router,
  ) { }

  async resolve(
    route: ActivatedRouteSnapshot,
  ): Promise<IResolverResponse> {
    const key = route.data.key || ''
    const sitePath = this.configSvc.sitePath
    try {
      const response = await this.http.get(`/${sitePath}/feature/${key}.json`).toPromise()
      return { data: response, error: null }
    } catch (err) {
      this.router.navigateByUrl('/')
      return { data: null, error: err }
    }
  }
}
