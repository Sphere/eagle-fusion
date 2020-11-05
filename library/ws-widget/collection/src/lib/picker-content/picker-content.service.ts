import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IRemoveSubsetResponse, ISearchConfig } from './picker-content.model'
import { ConfigurationsService } from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class PickerContentService {

  private baseUrl = this.configSvc.sitePath

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
  ) { }

  removeSubset(contentIds: string[]) {
    return this.http.post<IRemoveSubsetResponse>('/apis/protected/v8/content/removeSubset', { contentIds })
  }

  getSearchConfigs(): Promise<ISearchConfig> {
    return this.http.get<ISearchConfig>(`${this.baseUrl}/feature/search.json`).toPromise()
  }
}
