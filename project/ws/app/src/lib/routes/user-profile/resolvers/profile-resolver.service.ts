import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { NsUser, ConfigurationsService, IResolveResponse } from '@ws-widget/utils'

@Injectable()
export class ProfileResolverService  {

  constructor(private configSvc: ConfigurationsService) { }

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {

    const result: IResolveResponse<NsUser.IUserProfile> = {
      data: this.configSvc.userProfile,
      error: null,
    }
    return of(result)
  }
}
