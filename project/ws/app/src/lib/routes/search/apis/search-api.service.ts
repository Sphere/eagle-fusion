import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ISocialSearchRequest, ISocialSearchResult, ISearchAutoComplete } from '../models/search.model'
import { KeycloakService } from 'keycloak-angular'
import { NSSearch } from '@ws-widget/collection'
import { map } from 'rxjs/operators'
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  SOCIAL_VIEW_SEARCH_RESULT: `${PROTECTED_SLAG_V8}/social/post/search`,
  SEARCH_AUTO_COMPLETE: `${PROTECTED_SLAG_V8}/content/searchAutoComplete`,
  SEARCH_V6: `${PROTECTED_SLAG_V8}/content/searchV6`,
  // SEARCH_V6PUBLIC: '/apis/public/v8/homePage/searchv6',
  SEARCH_V6PUBLIC: '/apis/proxies/v8/sunbirdigot/search',

}
@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  constructor(private http: HttpClient, private keycloakSvc: KeycloakService) { }
  getSearchResults(request: ISocialSearchRequest): Observable<ISocialSearchResult> {
    return this.http.post<ISocialSearchResult>(API_END_POINTS.SOCIAL_VIEW_SEARCH_RESULT, request)
  }

  getSearchAutoCompleteResults(params: { q: string, l: string }): Observable<ISearchAutoComplete[]> {
    return this.http.get<ISearchAutoComplete[]>(API_END_POINTS.SEARCH_AUTO_COMPLETE, { params })
  }

  get userId(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()
    if (!kc) {
      return
    }
    return (kc.tokenParsed && kc.tokenParsed.sub) || (kc.idTokenParsed && kc.idTokenParsed.sub)
  }

  // getSearchV6Results(body: NSSearch.ISearchV6Request): Observable<NSSearch.ISearchV6ApiResult> {
  //   return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.SEARCH_V6PUBLIC, body)
  //     .pipe(map((res: NSSearch.ISearchV6ApiResult) => {
  //       for (const filter of res.filters) {
  //         if (filter.type === 'catalogPaths') {
  //           if (filter.content.length === 1) {
  //             filter.content = filter.content[0].children || []
  //           }
  //           break
  //         }
  //       }
  //       return res
  //     }))
  // }

  getSearchV6Results(body: NSSearch.ISearchV6RequestV2): Observable<NSSearch.ISearchV6ApiResultV2> {
    return this.http.post<NSSearch.ISearchV6ApiResultV2>(API_END_POINTS.SEARCH_V6PUBLIC, body)
      .pipe(map((res: NSSearch.ISearchV6ApiResultV2) => {
        const tempArray = Array()
        if (res.result.facets.length > 0) {
          res.result.facets.forEach(ele => {
            const temp: NSSearch.IFacet = {
              displayName: '',
              type: '',
              content: [],
            }

            temp.displayName = ele.name
            temp.type = ele.name
            if (ele.values.length > 0) {
              ele.values.forEach(subEle => {
                temp.content.push({
                  displayName: subEle.name,
                  type: subEle.name,
                  count: subEle.count,
                  id: '',
                })
              })
            }
            tempArray.push(temp)
          })
        }
        res.filters = tempArray
        for (const filter of res.filters) {
          if (filter.type === 'catalogPaths') {
            if (filter.content.length === 1) {
              filter.content = filter.content[0].children || []
            }
            break
          }
        }
        return res
      }))
  }

}
