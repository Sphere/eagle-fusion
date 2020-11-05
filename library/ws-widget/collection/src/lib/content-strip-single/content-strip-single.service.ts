import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { getStringifiedQueryParams } from '@ws-widget/utils'
import { NsContentStripSingle } from './content-strip-single.model'

@Injectable({
  providedIn: 'root',
})
export class ContentStripSingleService {
  constructor(private http: HttpClient) {}

  getContentStripResponseApi(
    request: NsContentStripSingle.IStripRequestApi,
    filters?: { [key: string]: string | undefined },
  ): Observable<NsContentStripSingle.IContentStripResponseApi> {
    let stringifiedQueryParams = ''
    stringifiedQueryParams = getStringifiedQueryParams({
      pageNo: request.queryParams ? request.queryParams.pageNo : undefined,
      pageSize: request.queryParams ? request.queryParams.pageSize : undefined,
      pageState: request.queryParams ? request.queryParams.pageState : undefined,
      filters: filters ? encodeURIComponent(JSON.stringify(filters)) : undefined,
    })
    let url = request.path
    url += stringifiedQueryParams ? `?${stringifiedQueryParams}` : ''
    return this.http.get<NsContentStripSingle.IContentStripResponseApi>(url)
  }
}
