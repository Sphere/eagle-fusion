import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IRemoveSubsetResponse, ISearchConfig } from './picker-content.model'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'
// import { ConfigurationsService } from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class PickerContentService {

  // private baseUrl = this.configSvc.sitePath

  constructor(
    private http: HttpClient,
    // private configSvc: ConfigurationsService,
  ) { }

  removeSubset(contentIds: string[]) {
    return this.http.post<IRemoveSubsetResponse>(API_END_POINTS.REMOVE_SUBSET, { contentIds })
  }

  getSearchConfigs(): Promise<ISearchConfig> {
    return this.http.get<ISearchConfig>(`fusion-assets/files/search.json`).toPromise()
  }
}
