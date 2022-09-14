import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { ISocialSearchRequest, ISocialSearchResult, ISearchAutoComplete } from '../models/search.model'
import { KeycloakService } from 'keycloak-angular'
import { NSSearch } from '@ws-widget/collection'
import { map } from 'rxjs/operators'
const PROTECTED_SLAG_V8 = '/apis/protected/v8'
const API_END_POINTS = {
  SOCIAL_VIEW_SEARCH_RESULT: `${PROTECTED_SLAG_V8}/social/post/search`,
  SEARCH_AUTO_COMPLETE: '/apis/proxies/v8/sunbirdigot/read',
  // `${PROTECTED_SLAG_V8}/content/searchAutoComplete`,
  SEARCH_V6: `${PROTECTED_SLAG_V8}/content/searchV6`,
  // SEARCH_V6PUBLIC: '/apis/public/v8/homePage/searchv6',
  SEARCH_V6PUBLIC: '/apis/public/v8/publicContent/v1/search',

}

// const facetsOb = {
//   facets: [
//     {
//       values: [
//         {
//           name: 'learning resource',
//           count: 59,
//         },
//         {
//           name: 'course',
//           count: 18,
//         },
//         {
//           name: 'asset',
//           count: 20,
//         },
//       ],
//       name: 'primaryCategory',
//     },
//     {
//       values: [
//         {
//           name: 'application/vnd.ekstep.html-archive',
//           count: 4,
//         },
//         {
//           name: 'image/png',
//           count: 2,
//         },
//         {
//           name: 'text/x-url',
//           count: 12,
//         },
//         {
//           name: 'image/jpeg',
//           count: 22,
//         },
//         {
//           name: 'application/pdf',
//           count: 20,
//         },
//         {
//           name: 'application/vnd.ekstep.content-collection',
//           count: 18,
//         },
//         {
//           name: 'application/vnd.ekstep.ecml-archive',
//           count: 3,
//         },
//         {
//           name: 'video/x-youtube',
//           count: 2,
//         },
//         {
//           name: 'video/mp4',
//           count: 13,
//         },
//         {
//           name: 'audio/mpeg',
//           count: 1,
//         },
//       ],
//       name: 'mimeType',
//     },
//   ],
// }

@Injectable({
  providedIn: 'root',
})
export class SearchApiService {
  constructor(private http: HttpClient, private keycloakSvc: KeycloakService) { }

  get userId(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()
    if (!kc) {
      return
    }
    return (kc.tokenParsed && kc.tokenParsed.sub) || (kc.idTokenParsed && kc.idTokenParsed.sub)
  }
  private messageSource = new Subject<any>()
  public currentMessage = this.messageSource.asObservable()
  getSearchResults(request: ISocialSearchRequest): Observable<ISocialSearchResult> {
    return this.http.post<ISocialSearchResult>(API_END_POINTS.SOCIAL_VIEW_SEARCH_RESULT, request)
  }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  getSearchAutoCompleteResults(params: { q: string, l: string }): Observable<ISearchAutoComplete[]> {
    return this.http.get<ISearchAutoComplete[]>(API_END_POINTS.SEARCH_AUTO_COMPLETE, { params })
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

  getSearchV6Results(body: NSSearch.ISearchV6RequestV2, searchconfig: any): Observable<NSSearch.ISearchV6ApiResultV2> {
    return this.http.post<NSSearch.ISearchV6ApiResultV2>(API_END_POINTS.SEARCH_V6PUBLIC, body)
      .pipe(map((res: NSSearch.ISearchV6ApiResultV2) => {
        const tempArray = Array()
        if (res.result.facets.length > 0) {
          searchconfig.forEach((ele: any) => {
            const temp: NSSearch.IFacet = {
              displayName: '',
              type: '',
              content: [],
            }

            temp.displayName = ele.displayname
            temp.type = ele.name
            if (ele.values.length > 0) {
              ele.values.forEach((subEle: any) => {
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

  // getSearch(body: any): Observable<any> {
  //   const data = {
  //     locale: [
  //       'en',
  //     ],
  //     query: '',
  //     request: {
  //       query: '',
  //       filters: {
  //         primaryCategory: body.request.filters.contentType,
  //         status: [
  //           'Draft',
  //           'Live',
  //         ],
  //         visibility: 'default',
  //         contentType: body.request.filters.contentType,
  //       },
  //       sort_by: {
  //         lastUpdatedOn: 'desc',
  //       },
  //       facets: [
  //         'primaryCategory',
  //         'mimeType',
  //       ],
  //     },
  //   }
  //   data.request.query = body.request.query
  //   return this.http.post<any>(API_END_POINTS.SEARCH_AUTO_COMPLETE, data)
  // }

}
