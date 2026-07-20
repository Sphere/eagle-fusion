import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { NSSearch } from '@ws-widget/collection'
import { ConfigurationsService, EventService, LoggerService, WsEvents } from '@ws-widget/utils'
import { Observable, of, BehaviorSubject } from 'rxjs'
import { SearchApiService } from '../apis/search-api.service'
import {
  IFilterUnitItem, IFilterUnitResponse, ISearchAutoComplete, ISearchQuery, ISearchRequestV2, ISearchRequestV3,
  ISearchSocialSearchPartialRequest, ISocialSearchRequest,
} from '../models/search.model'
import { API_END_POINTS } from '../../../../../../../../src/app/constants/apiConstants'
import { IProgressHash, ISearchConfig, IFilterSet, IFilterHandleResult } from './search-service.model'


@Injectable({
  providedIn: 'root',
})
export class SearchServService {
  progressHash: IProgressHash = {}
  progressHashSubject: BehaviorSubject<IProgressHash> | null = null
  isFetchingProgress = false
  searchConfig: ISearchConfig | null = null
  constructor(
    readonly events: EventService,
    readonly searchApi: SearchApiService,
    readonly configSrv: ConfigurationsService,
    readonly http: HttpClient,
    readonly logger: LoggerService
  ) { }

  get defaultFiltersTranslated() {
    return { en: {}, all: {} }
  }

  async getSearchConfig(): Promise<ISearchConfig> {
    if (!this.searchConfig) {
      this.searchConfig = {} as ISearchConfig
      try {
        this.searchConfig = await this.http.get<ISearchConfig>(`fusion-assets/files/search.json`).toPromise() as ISearchConfig
      } catch (err) {
        this.logger.error('Error loading search config', err)
      }

    }
    return of(this.searchConfig).toPromise() as Promise<ISearchConfig>
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
    this.logger.log(params)
    params.q = params.q.toLowerCase()
    if (params.l.split(',').length === 1 && params.l.toLowerCase() !== 'all') {
      return this.searchApi.getSearchAutoCompleteResults(params).toPromise()
    }
    return Promise.resolve([])
  }

  getLearning(request: ISearchRequestV2): Observable<NSSearch.ISearchV6ApiResultV2> {
    return this.searchV6Wrapper(request)
  }
  getsearchLearning(request: ISearchRequestV3): Observable<NSSearch.ISearchV6ApiResultV3> {
    return this.searchV7Wrapper(request)
  }
  searchV7Wrapper(request: ISearchRequestV3): Observable<NSSearch.ISearchV6ApiResultV3> {
    // publicSearch/getCourses (Sunbird content/v1/search) requires a request.filters object —
    // unlike the old recommendation endpoint, a bare { query } is rejected ("Error while public search").
    const v7Request: any = {
      request: {
        query: request.query || '',
        filters: {
          primaryCategory: ['Course'],
          contentType: ['Course'],
          status: ['Live'],
        },
      },
      query: request.query || '',
      sort: [{ lastUpdatedOn: 'desc' }],
    }
    if (request.language) {
      v7Request.request.filters.lang = request.language
    }
    return this.searchApi.getSearchV7Results(v7Request)
  }
  searchV6Wrapper(request: ISearchRequestV2): Observable<NSSearch.ISearchV6ApiResultV2> {
    this.logger.log(request.request)
    request.request.filters['status'] = ['Live']
    const v6Request: any = {
      request: {
        query: request.request.query,
        filters: request.request.query ? { ['contentType']: ['Course'], ['status']: ['Live'], lang: request.request.filters.lang ? request.request.filters.lang : undefined } : request.request.filters,
        sort_by: {
          lastUpdatedOn: request.request.sort_by.lastUpdatedOn,
        },
        facets: Object.keys(this.searchConfig?.search?.visibleFilters || {}),
        fields: request.request.fields,
      },
    }
    return this.searchApi.getSearchV6Results(v6Request, this.searchConfig?.defaultsearch)
  }

  fetchSocialSearchUsers(request: ISearchSocialSearchPartialRequest) {
    const req: ISocialSearchRequest = {
      org: this.configSrv.activeOrg,
      rootOrg: this.configSrv.rootOrg,
      ...request,
    }
    return this.searchApi.getSearchResults(req)
  }

  updateSelectedFiltersSet(filters: { [key: string]: string[] }): IFilterSet {
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
  ): IFilterHandleResult {

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

  raiseSearchEvent(query: string, filters: Record<string, any>, locale: string | string[]) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        pageid: '',
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

  raiseSearchResponseEvent(query: string, filters: Record<string, any>, totalHits: number, locale: string | string[]) {
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
  raiseNewSearchResponseEvent(query: string, totalHits: number, locale: string | string[]) {
    this.events.dispatchEvent<WsEvents.IWsEventTelemetrySearch>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Warn,
      data: {
        query,
        locale,
        eventSubType: WsEvents.EnumTelemetrySubType.Search,
        size: totalHits,
        type: 'search',
      },
      from: 'search',
      to: 'telemetry',
    })
  }

  async translateSearchFilters(lang: string): Promise<Record<string, any>> {
    const filtersTranslation = JSON.parse(localStorage.getItem('filtersTranslation') || JSON.stringify(this.defaultFiltersTranslated))
    if (lang.split(',').length === 1) {
      if (!filtersTranslation.hasOwnProperty(lang)) {
        filtersTranslation[lang] = {}
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
        filtersTranslation[lang] = await this.http.get<Record<string, any>>(API_END_POINTS.translateFilters(lang)).toPromise()
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
      }
      return of(filtersTranslation[lang]).toPromise() as Promise<Record<string, any>>
    }
    return of(filtersTranslation['en'] || {}).toPromise() as Promise<Record<string, any>>

  }
}
