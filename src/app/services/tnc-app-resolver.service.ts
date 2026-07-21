import { Injectable } from '@angular/core'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse, ConfigurationsService } from '@ws-widget/utils'
import { NsTnc } from '../models/tnc.model'
import { API_END_POINTS } from '../constants/apiConstants'

@Injectable()
export class TncAppResolverService {

  constructor(
    private readonly http: HttpClient,
    private readonly configSvc: ConfigurationsService
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
    let url = API_END_POINTS.USER_TNC
    if (locale) {
      url += `?locale=${locale}`
    }
    return this.http.get<NsTnc.ITnc>(url)
  }
}
