import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { ISocialSearchRequest, ISocialSearchResult, ISearchAutoComplete } from '../models/search.model'
import { KeycloakService } from 'keycloak-angular'
import { NSSearch } from '@ws-widget/collection'
import { map } from 'rxjs/operators'
import { LoggerService } from '../../../../../../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'
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
  constructor(private http: HttpClient, private keycloakSvc: KeycloakService, private logger: LoggerService) { }

  get userId(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()
    if (!kc) {
      return ''
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
    return this.http.get<ISearchAutoComplete[]>(API_END_POINTS.CONTENT_SEARCH_V6, { params })
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

  getSearchCompetencyCourses(body: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = body
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, req)
  }


  getSearchV6Results(body: NSSearch.ISearchV6RequestV2, searchconfig: any): Observable<NSSearch.ISearchV6ApiResultV2> {
    return this.http.post<NSSearch.ISearchV6ApiResultV2>(API_END_POINTS.SEARCH_V7PUBLIC, body)
      .pipe(map((res: NSSearch.ISearchV6ApiResultV2) => {
        this.logger.log("res getSearchV6Results", res)
        const tempArray = []
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

  getSearchV7Results(body: NSSearch.ISearchV6RequestV2): Observable<any> {
    return this.http.post<any>(API_END_POINTS.SEARCH_V7PUBLIC, body)
      .pipe(map((res: any) => {

        if (res.result.content.length > 0) {
          this.logger.log("v6", res)
          return res
        } else {
          this.logger.log("v7", res)
          return res
        }


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
