import { Injectable } from '@angular/core'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse, ConfigurationsService } from '@ws-widget/utils'
import { NsTnc } from '../models/tnc.model'
import { LanguageService } from './language.service'
import { API_END_POINTS } from '../constants/apiConstants'

@Injectable()
export class TncPublicResolverService {

  constructor(
    private readonly http: HttpClient,
    private readonly configSvc: ConfigurationsService,
    private readonly langSvc: LanguageService
  ) { }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    return this.getPublicTnc().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
  getPublicTnc(): Observable<NsTnc.ITnc> {
    // Language detection uses LanguageService and localStorage (set by LanguageService)
    let lang: string = this.langSvc.getCurrentLanguage() || 'en'

    // Check user preferences as fallback
    lang = this.configSvc.unMappedUser?.profileDetails?.preferences?.language || lang

    const configUrl = lang === 'hi' ? '/fusion-assets/files/tnc.config.hi.json' : '/fusion-assets/files/tnc.config.json'
    return this.http.get<NsTnc.ITnc>(configUrl)
  }

  assignAdminToDepartment(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.ASSIGN_ADMIN_TO_CREATED_DEPARTMENT, data)
  }

  signup(data: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.USER_SIGNUP_NEW, data)
  }

  registerWithMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.REGISTERUSERWITHMOBILE, data).pipe(
      map(response => {
        return response
      })
    )
  }

  verifyUserMobile(data: any) {
    return this.http.post<any>(API_END_POINTS.VERIFY_OTP, data).pipe(
      map(response => {
        return response
      })
    )
  }
}
