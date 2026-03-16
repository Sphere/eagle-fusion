import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ConfigurationsService, getStringifiedQueryParams } from '../../../../../utils/src/public-api'
import { NsAutoComplete } from './user-autocomplete.model'
import { API_END_POINTS } from '../../../../../../../src/app/constants/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class UserAutocompleteService {

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService
  ) { }

  fetchAutoComplete(
    query: string,
  ): Observable<NsAutoComplete.IUserAutoComplete[]> {
    let url = API_END_POINTS.AUTOCOMPLETE(query)

    const stringifiedQueryParams = getStringifiedQueryParams({
      dealerCode: this.configSvc.userProfile && this.configSvc.userProfile.dealerCode ? this.configSvc.userProfile.dealerCode : undefined,
      sourceFields: this.configSvc.instanceConfig && this.configSvc.instanceConfig.sourceFieldsUserAutocomplete
        ? this.configSvc.instanceConfig.sourceFieldsUserAutocomplete
        : undefined,
    })

    url += stringifiedQueryParams ? `?${stringifiedQueryParams}` : ''

    return this.http.get<NsAutoComplete.IUserAutoComplete[]>(
      url,
    )
  }
}
