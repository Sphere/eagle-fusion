import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { NSSearch } from '@ws-widget/collection'
import { ConfigurationsService, EventService, WsEvents } from '@ws-widget/utils'
import { Observable, of } from 'rxjs'
import { KnowledgeHubApiService } from '../../infy/routes/knowledge-hub/apis/knowledge-hub-api.service'
import { IKhubAutoMation, IKhubFilterObj, IKhubItemTile, IKhubKshop, IKhubProject, IKhubViewResultDocs, IKhubViewResultProject, ISearchObjForSearch } from '../../infy/routes/knowledge-hub/models/knowledgeHub.model'
import { SearchApiService } from '../apis/search-api.service'
// import { IFilterUnitItem, IFilterUnitResponse, ISearchAutoComplete, ISearchQuery, ISearchRequest,
// ISearchRequestV2, ISearchSocialSearchPartialRequest, ISocialSearchRequest } from '../models/search.model'
import {
  IFilterUnitItem, IFilterUnitResponse, ISearchAutoComplete, ISearchQuery, ISearchRequestV2,
  ISearchSocialSearchPartialRequest, ISocialSearchRequest,
} from '../models/search.model'

const API_END_POINTS = {
  translateFiltersBase: '/apis/protected/v8/translate/filterdata',
  translateFilters: (lang: string) => `${API_END_POINTS.translateFiltersBase}/${lang}`,
}

@Injectable({
  providedIn: 'root',
})
export class SearchServService {
  progressHash: { [id: string]: number } = {}
  progressHashSubject: any
  isFetchingProgress = false
  searchConfig: any = null
  constructor(
    private events: EventService,
    // private contentApi: WidgetContentService,
    private khubApiSvc: KnowledgeHubApiService,
    private searchApi: SearchApiService,
    private configSrv: ConfigurationsService,
    private http: HttpClient,
  ) { }

  get defaultFiltersTranslated() {
    return { en: {}, all: {} }
  }

  async getSearchConfig(): Promise<any> {
    if (!this.searchConfig) {
      this.searchConfig = {}
      const baseUrl = this.configSrv.sitePath
      this.searchConfig = await this.http.get<any>(`${baseUrl}/feature/search.json`).toPromise()

    }
    return of(this.searchConfig).toPromise()
  }

  async getApplyPhraseSearch(): Promise<boolean> {
    const config = await this.getSearchConfig()
    if (config.search.tabs[0].phraseSearch ||
      config.search.tabs[0].phraseSearch === undefined) {
      return true
    }
    return false
  }

  searchAutoComplete(params: ISearchQuery): Promise<ISearchAutoComplete[]> {
    params.q = params.q.toLowerCase()
    if (params.l.split(',').length === 1 && params.l.toLowerCase() !== 'all') {
      return this.searchApi.getSearchAutoCompleteResults(params).toPromise()
    }
    return Promise.resolve([])
  }

  getLearning(request: ISearchRequestV2): Observable<NSSearch.ISearchV6ApiResultV2> {
    return this.searchV6Wrapper(request)
  }

  searchV6Wrapper(request: any): Observable<NSSearch.ISearchV6ApiResultV2> {
    this.searchConfig.search['visibleFiltersV2'] = {
      primaryCategory: {
        displayName: 'Primary Category',
      },
      mimeType: {
        displayName: 'Mime Type',
      },
    }

    const v6Request: NSSearch.ISearchV6RequestV2 = {
      request: {
        query: request.request.query,
        filters: request.request.filters,
        sort_by: {
          lastUpdatedOn: request.request.sort_by.lastUpdatedOn,
        },
        facets: Object.keys(this.searchConfig.search.visibleFiltersV2),
        fields: request.request.fields,
      },
    }
    return this.searchApi.getSearchV6Results(v6Request)
  }

  // getLearning(request: ISearchRequest): Observable<NSSearch.ISearchV6ApiResult> {
  //   request.locale = (request.locale && request.locale.length && request.locale[0] !== 'all') ? request.locale : []

  //   this.getSearchConfig().then(config => {
  //     request.visibleFilters = config.search.visibleFilters
  //     request.excludeSourceFields = config.search.excludeSourceFields
  //   }).catch(_err => { })
  //   // return this.searchV6Wrapper(request)
  //   if (request.filters) {
  //     request.filters['contentType'] = ['Course', 'Program']
  //   } else {
  //     request.filters = {
  //       contentType: ['Course', 'Program'],
  //     }
  //   }
  //   const v6Request: NSSearch.ISearchV6Request = {
  //     locale: request.locale,
  //     pageNo: request.pageNo || undefined,
  //     pageSize: request.pageSize || undefined,
  //     query: request.query,
  //     didYouMean: request.didYouMean,
  //     filters: [
  //       {
  //         andFilters: Object.keys(request.filters || {}).map(key => {
  //           return { [key]: request.filters[key] }
  //         }),
  //       },
  //     ],
  //     visibleFilters: request.visibleFilters,
  //     includeSourceFields: ['creatorLogo'],
  //     isStandAlone: request.hasOwnProperty('isStandAlone') ? request.isStandAlone : undefined,
  //     sort: request.hasOwnProperty('sort') ? request.sort && request.sort.length ? request.sort : undefined : undefined,
  //   }
  //   return this.searchApi.getSearchV6Results(v6Request)
  // }

  // searchV6Wrapper(request: ISearchRequest): Observable<NSSearch.ISearchV6ApiResult> {
  //   if (request.filters) {
  //     request.filters['contentType'] = ['Course', 'Program']
  //   } else {
  //     request.filters = {
  //       contentType: ['Course', 'Program'],
  //     }
  //   }

  //   const v6Request: NSSearch.ISearchV6Request = {
  //     locale: request.locale,
  //     pageNo: request.pageNo || undefined,
  //     pageSize: request.pageSize || undefined,
  //     query: request.query,
  //     didYouMean: request.didYouMean,
  //     filters: [
  //       {
  //         andFilters: Object.keys(request.filters || {}).map(key => {
  //           return { [key]: request.filters[key] }
  //         }),
  //       },
  //     ],
  //     visibleFilters: request.visibleFilters,
  //     includeSourceFields: ['creatorLogo'],
  //     isStandAlone: request.hasOwnProperty('isStandAlone') ? request.isStandAlone : undefined,
  //     sort: request.hasOwnProperty('sort') ? request.sort && request.sort.length ? request.sort : undefined : undefined,
  //   }

  //   // if (v6Request.visibleFilters) {
  //   // v6Request.visibleFilters = {
  //   //   "learningMode": {
  //   //     "displayName": "Mode"
  //   //   },
  //   //   "duration": {
  //   //     "displayName": "Duration"
  //   //   },
  //   //   "exclusiveContent": {
  //   //     "displayName": "Costs"
  //   //   },
  //   //   "complexityLevel": {
  //   //     "displayName": "Level"
  //   //   },
  //   //   "catalogPaths": {
  //   //     "displayName": "Catalog",
  //   //     "order": [
  //   //       {
  //   //         "_key": "asc"
  //   //       }
  //   //     ]
  //   //   },
  //   //   "sourceShortName": {
  //   //     "displayName": "Source"
  //   //   },
  //   //   "resourceType": {
  //   //     "displayName": "Format"
  //   //   },
  //   //   "region": {
  //   //     "displayName": "Region"
  //   //   },
  //   //   "concepts": {
  //   //     "displayName": "Concepts"
  //   //   },
  //   //   "lastUpdatedOn": {
  //   //     "displayName": "Published Date"
  //   //   }
  //   // }
  //   // }
  //   // console.log('v6Request', v6Request)
  //   return this.searchApi.getSearchV6Results(v6Request)
  // }

  fetchSocialSearchUsers(request: ISearchSocialSearchPartialRequest) {
    const req: ISocialSearchRequest = {
      org: this.configSrv.activeOrg,
      rootOrg: this.configSrv.rootOrg,
      ...request,
    }
    return this.searchApi.getSearchResults(req)
  }

  fetchSearchDataDocs(request: ISearchObjForSearch): Observable<IKhubViewResultDocs> {
    return this.khubApiSvc.fetchSearchDataDocs(request)
  }
  fetchSearchDataProjects(request: ISearchObjForSearch): Observable<IKhubViewResultProject> {
    return this.khubApiSvc.fetchSearchDataProject(request)
  }

  updateSelectedFiltersSet(filters: { [key: string]: string[] }) {
    const valuesForSet: string[] = []
    let filtersResetAble = false
    Object.keys(filters || {}).forEach(key => {
      const unitFilters = filters[key]
      if (unitFilters.length > 0) {
        filtersResetAble = true
      }
      if (key.toLowerCase() === 'tags') {
        unitFilters.forEach((filterName: string) => {
          const filterNameSubParts = filterName.split('/')
          let filterNameSubPartConcatStr = ''
          for (const filterNameSubPartStr of filterNameSubParts) {
            filterNameSubPartConcatStr =
              filterNameSubPartConcatStr +
              (filterNameSubPartConcatStr.length ? '/' : '') +
              filterNameSubPartStr
            valuesForSet.push(filterNameSubPartConcatStr)
          }
        })
      } else {
        valuesForSet.push(...unitFilters)
      }
    })
    return {
      filterSet: new Set(valuesForSet),
      filterReset: filtersResetAble,
    }
  }

  transformSearchV6Filters(v6filters: NSSearch.ISearchV6Filters[]) {
    const filters: any = {}
    v6filters.forEach((f => {
      if (f.andFilters) {
        f.andFilters.forEach(andFilter => {
          Object.keys(andFilter).forEach(key => {
            filters[key] = andFilter[key]
          })

        })
      }
    }))
    return filters
  }

  handleFilters(
    filters: IFilterUnitResponse[],
    selectedFilterSet: Set<string>,
    selectedFilters: { [key: string]: string[] },
    showContentType?: boolean,
  ) {

    let concepts: IFilterUnitItem[] = []
    const filtersResponse: IFilterUnitResponse[] = filters
      .filter(unitFilter => {
        if (unitFilter.type === 'concepts') {
          concepts = unitFilter.content.slice(0, 10)
          return false
        }
        if (unitFilter.type === 'dtLastModified') {
          return false
        }
        if (showContentType !== undefined && showContentType && unitFilter.type === 'contentType') {
          return false
        }
        return true
      })
      .map(
        (unitFilter: IFilterUnitResponse): IFilterUnitResponse => ({
          ...unitFilter,
          checked:
            selectedFilters &&
            Array.isArray(selectedFilters[unitFilter.type]) &&
            Boolean(selectedFilters[unitFilter.type].length),
          content: unitFilter.content.map(
            (unitFilterContent: IFilterUnitItem): IFilterUnitItem => ({
              ...unitFilterContent,
              checked: selectedFilters &&
                Array.isArray(selectedFilters[unitFilter.type]) &&
                Boolean(selectedFilters[unitFilter.type].length) && selectedFilterSet.has(unitFilterContent.type || ''),
              children: !Array.isArray(unitFilterContent.children)
                ? []
                : unitFilterContent.children.map(
                  (unitFilterSecondLevel: IFilterUnitItem): IFilterUnitItem => ({
                    ...unitFilterSecondLevel,
                    children: [],
                    checked: selectedFilterSet.has(unitFilterSecondLevel.type || ''),
                  }),
                ),
            }),
          ),
        }),
      )
    return {
      concept: concepts,
      filtersRes: filtersResponse,
    }
  }

  // tslint:disable-next-line: prefer-array-literal
  setTilesDocs(response: Array<IKhubKshop | IKhubAutoMation>) {
    try {
      const tiles: IKhubItemTile[] = []
      response.map((cur: IKhubKshop | IKhubAutoMation) => {
        const tile: IKhubItemTile = {
          author: cur.authors || [],
          category: cur.category || '',
          description: cur.description || '',
          itemId: cur.itemId,
          itemType: cur.itemType || '',
          noOfViews: cur.noOfViews || 0,
          restricted: cur.isAccessRestricted || 'N',
          source: cur.source,
          title: cur.title || '',
          topics: cur.topics || [],
          url: cur.url || '',
          dateCreated: cur.dateCreated ? new Date(cur.dateCreated) : new Date(),
          color: cur.source.toLowerCase() === 'kshop' ? '3px solid #f26522' : '3px solid #28a9b2',
          sourceId: cur.sourceId || 0,
        }
        tiles.push(tile)
      })
      return tiles
    } catch (e) {
      throw e
    }
  }

  setTileProject(response: IKhubProject[]) {
    try {
      const tilesProject: IKhubItemTile[] = []
      response.map((cur: IKhubProject) => {
        const tile: IKhubItemTile = {
          pm: cur.pm || [],
          dm: cur.dm || [],
          objectives: cur.mstInfyObjectives || '',
          risks: cur.risks || [],
          contribution: cur.contributions || [],
          category: 'Project',
          // description: '',
          projectScope: cur.mstProjectScope,
          businessContext: cur.mstBusinessContext,
          itemId: cur.itemId,
          restricted: cur.isAccessRestricted || 'N',
          source: 'PROMT',
          title: cur.mstProjectName || '',
          topics: cur.topics || [],
          url: '',
          dateCreated: new Date(cur.dateStartDate),
          color: '3px solid #e94a48',
          sourceId: 0,
        }
        tilesProject.push(tile)
      })
      return tilesProject
    } catch (e) {
      throw e
    }
  }

  formatKhubFilters(filters: { [key: string]: IKhubFilterObj[] }) {
    try {
      const returnArr: IFilterUnitResponse[] = []
      for (const key in filters) {
        if (key) {
          const filterObj: IFilterUnitResponse = {
            type: key,
            displayName: this.getDisplayName(key),
            content: this.fetchContentOfFilter(filters[key]),
          }
          returnArr.push(filterObj)
        }
      }
      return returnArr
    } catch (e) {
      throw e
    }
  }

  fetchContentOfFilter(filter: IKhubFilterObj[]) {
    const filterItemArr: IFilterUnitItem[] = []
    filter.map((cur: IKhubFilterObj) => {
      const obj = {
        count: cur.doc_count,
        displayName: cur.key,
        type: cur.key,
      }
      filterItemArr.push(obj)
    })
    return filterItemArr
  }
  formatFilterForSearch(filters: { [type: string]: string[] }) {
    try {
      let filterStr = ''
      const strArr: string[] = []
      for (const key in filters) {
        if (key) {
          let str = ''
          const count = filters[key].length
          filters[key].map((cur: string, i: number) => {
            if (i !== count - 1) {
              str += `"${cur}",`
            } else {
              str += `"${cur}"]`
            }
          })
          if (count > 0) {
            strArr.push(`"${key}":[${str}`)
          }
        }
      }
      filterStr = strArr.join('$')
      return filterStr
    } catch (e) {
      throw e
    }
  }

  getDisplayName(type: string) {
    let name = ''
    switch (type.toLowerCase()) {
      case 'automationcentral':
        name = 'Tools'
        break
      case 'autogeneratedtopic':
        name = 'Topics'
        break
      case 'topics':
        name = 'Topics'
        break
      case 'kshopdocument':
        name = 'Kshop Document'
        break
      case 'project':
        name = 'Project References'
        break
      case 'kshop':
        name = 'Documents'
        break
      case 'itemtype':
        name = 'Item Type'
        break
      case 'authors.mailid':
        name = 'Authors'
        break
      case 'mstlocation':
        name = 'Location'
        break
      case 'status':
        name = 'Project Status'
        break
      case 'marketing':
        name = 'Marketing'
        break
      default:
        name = type
        break
    }
    return name
  }

  getLanguageSearchIndex(lang: string): string {
    let name = ''
    switch (lang) {
      case 'zh-CN':
        name = 'zh'
        break
      default:
        name = lang
    }
    return name
  }

  raiseSearchEvent(query: string, filters: any, locale: any) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        object: {
          query,
          filters,
          locale,
        },
        type: 'search',
      },
      from: 'search',
      to: 'telemetry',
    })
  }

  raiseSearchResponseEvent(query: string, filters: any, totalHits: number, locale: any) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetrySearch>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        query,
        filters,
        locale,
        eventSubType: WsEvents.EnumTelemetrySubType.Search,
        size: totalHits,
        type: 'search',
      },
      from: 'search',
      to: 'telemetry',
    })
  }

  async translateSearchFilters(lang: string): Promise<any> {
    const filtersTranslation = JSON.parse(localStorage.getItem('filtersTranslation') || JSON.stringify(this.defaultFiltersTranslated))
    if (lang.split(',').length === 1) {
      if (!filtersTranslation.hasOwnProperty(lang)) {
        filtersTranslation[lang] = {}
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
        filtersTranslation[lang] = await this.http.get(API_END_POINTS.translateFilters(lang)).toPromise()
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
      }
      return of(filtersTranslation[lang]).toPromise()
    }
    return of(filtersTranslation['en'] || {}).toPromise()

  }
}
