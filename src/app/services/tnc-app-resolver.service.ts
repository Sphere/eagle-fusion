import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse, ConfigurationsService } from '@ws-widget/utils'
import { NsTnc } from '../models/tnc.model'

@Injectable()
export class TncAppResolverService implements Resolve<Observable<IResolveResponse<NsTnc.ITnc>> | IResolveResponse<NsTnc.ITnc>>  {

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    let locale = ''
    if (this.configSvc.userPreference) {
      locale = this.configSvc.userPreference.selectedLocale
    }
    return this.getTnc(locale).pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }

  getTnc(locale?: string) {
    let url = '/apis/protected/v8/user/tnc'
    if (locale) {
      url += `?locale=${locale}`
    }
    return this.http.get<NsTnc.ITnc>(url)
  }
}
