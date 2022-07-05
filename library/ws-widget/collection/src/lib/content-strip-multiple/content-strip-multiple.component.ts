import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { NsContentStripMultiple } from './content-strip-multiple.model'
import { ContentStripMultipleService } from './content-strip-multiple.service'
import { WidgetContentService } from '../_services/widget-content.service'
import { NsContent } from '../_services/widget-content.model'
import {
  TFetchStatus,
  LoggerService,
  EventService,
  ConfigurationsService,
  UtilityService,
} from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { filter } from 'rxjs/operators'
// import { SearchServService } from '@ws/app/src/lib/routes/search/services/search-serv.service'
import * as _ from 'lodash'
import { WidgetUserService } from '../_services/widget-user.service'
// import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'

interface IStripUnitContentData {
  key: string
  canHideStrip: boolean
  mode?: string
  showStrip: boolean
  widgets?: NsWidgetResolver.IRenderConfigWithAnyData[]
  stripTitle: string
  stripName?: string
  stripInfo?: NsContentStripMultiple.IStripInfo
  noDataWidget?: NsWidgetResolver.IRenderConfigWithAnyData
  errorWidget?: NsWidgetResolver.IRenderConfigWithAnyData
  showOnNoData: boolean
  showOnLoader: boolean
  showOnError: boolean
  stripBackground?: string
  viewMoreUrl: {
    path: string
    queryParams: any
  } | null
}
@Component({
  selector: 'ws-widget-content-strip-multiple',
  templateUrl: './content-strip-multiple.component.html',
  styleUrls: ['./content-strip-multiple.component.scss'],
})
export class ContentStripMultipleComponent extends WidgetBaseComponent
  implements
  OnInit,
  OnDestroy,
  NsWidgetResolver.IWidgetData<NsContentStripMultiple.IContentStripMultiple> {
  @Input() widgetData!: NsContentStripMultiple.IContentStripMultiple

  stripsResultDataMap: { [key: string]: IStripUnitContentData } = {}
  stripsKeyOrder: string[] = []
  showAccordionData = true
  showParentLoader = false
  showParentError = false
  showParentNoData = false
  errorDataCount = 0
  noDataCount = 0
  successDataCount = 0
  searchArray = ['preview', 'channel', 'author']
  contentAvailable = true
  isFromAuthoring = false
  changeEventSubscription: Subscription | null = null
  callPublicApi = false
  explorePage = false

  constructor(
    private contentStripSvc: ContentStripMultipleService,
    private contentSvc: WidgetContentService,
    private loggerSvc: LoggerService,
    private eventSvc: EventService,
    private configSvc: ConfigurationsService,
    protected utilitySvc: UtilityService,
    // private searchServSvc: SearchServService,
    private userSvc: WidgetUserService,
    // private tocSvc: AppTocService
  ) {
    super()
  }

  ngOnInit() {
    const url = window.location.href
    this.isFromAuthoring = this.searchArray.some((word: string) => {
      return url.indexOf(word) > -1
    })
    if (url.indexOf('explore') > 0) {
      this.explorePage = true
    }
    if (url.indexOf('login') > 0 || url.indexOf('explore') > 0) {
      this.callPublicApi = true
      // Fetch the data
      for (const strip of this.widgetData.strips) {
        if (this.checkForEmptyWidget(strip)) {
          this.fetchStripFromRequestData(strip)
        } else {
          this.processStrip(strip, [], 'done', true, null)
        }
      }
      // Subscription for changes
      const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
        .map(strip => ({
          key: strip.key,
          type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
          from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
        }))
        .filter(({ key, type, from }) => key && type && from)
      const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
      this.changeEventSubscription = this.eventSvc.events$
        .pipe(filter(event => eventTypeSet.has(event.eventType)))
        .subscribe(event => {
          keyAndEvent
            .filter(e => e.type === event.eventType && e.from === event.from)
            .map(e => e.key)
            .forEach(k => this.fetchStripFromKeyForLogin(k, false))
        })
      this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    } else if (url.indexOf('public/home') > 0) {
      this.initPublicHomeData()
    } else {
      this.initData()
    }
  }

  ngOnDestroy() {
    if (this.changeEventSubscription) {
      this.changeEventSubscription.unsubscribe()
    }
  }
  private initPublicHomeData() {
    this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    if (this.widgetData.loader && this.widgetData.strips.length) {
      this.showParentLoader = true
    }
    // Fetch the data
    for (const strip of this.widgetData.strips) {
      if (this.checkForEmptyWidget(strip)) {
        this.fetchHomeStripFromRequestData(strip)
      } else {
        this.processStrip(strip, [], 'done', true, null)
      }
    }
    // Subscription for changes
    const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
      .map(strip => ({
        key: strip.key,
        type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
        from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
      }))
      .filter(({ key, type, from }) => key && type && from)
    const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
    this.changeEventSubscription = this.eventSvc.events$
      .pipe(filter(event => eventTypeSet.has(event.eventType)))
      .subscribe(event => {
        keyAndEvent
          .filter(e => e.type === event.eventType && e.from === event.from)
          .map(e => e.key)
          .forEach(k => this.fetchStripFromHomeKey(k, false))
      })
  }
  private initData() {
    this.stripsKeyOrder = this.widgetData.strips.map(strip => strip.key) || []
    if (this.widgetData.loader && this.widgetData.strips.length) {
      this.showParentLoader = true
    }
    // Fetch the data
    for (const strip of this.widgetData.strips) {
      if (this.checkForEmptyWidget(strip)) {
        this.fetchStripFromRequestData(strip)
      } else {
        this.processStrip(strip, [], 'done', true, null)
      }
    }
    // Subscription for changes
    const keyAndEvent: { key: string; type: string; from: string }[] = this.widgetData.strips
      .map(strip => ({
        key: strip.key,
        type: (strip.refreshEvent && strip.refreshEvent.eventType) || '',
        from: (strip.refreshEvent && strip.refreshEvent.from.toString()) || '',
      }))
      .filter(({ key, type, from }) => key && type && from)
    const eventTypeSet = new Set(keyAndEvent.map(e => e.type))
    this.changeEventSubscription = this.eventSvc.events$
      .pipe(filter(event => eventTypeSet.has(event.eventType)))
      .subscribe(event => {
        keyAndEvent
          .filter(e => e.type === event.eventType && e.from === event.from)
          .map(e => e.key)
          .forEach(k => this.fetchStripFromKey(k, false))
      })
  }

  private fetchStripFromKeyForLogin(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchStripFromRequestDataforLogin(stripData, calculateParentStatus)
      // this.fetchFromSearch(strip, calculateParentStatus)
    }
  }

  private fetchStripFromRequestDataforLogin(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    this.fetchFromApi(strip, calculateParentStatus)
    this.fetchFromSearch(strip, calculateParentStatus)
    this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromSearchV6(strip, calculateParentStatus)
    this.fetchFromIds(strip, calculateParentStatus)
    this.fetchFromEnrollmentList(strip, calculateParentStatus)

  }
  fetchFromEnrollmentList(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.enrollmentList && Object.keys(strip.request.enrollmentList).length) {
      let userId = ''
      let content: NsContent.IContent[]
      let contentNew: NsContent.IContent[]
      const queryParams = _.get(strip.request.enrollmentList, 'queryParams')
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId
      }
      // tslint:disable-next-line: deprecation
      this.userSvc.fetchUserBatchList(userId, queryParams).subscribe(
        courses => {
          const showViewMore = Boolean(
            courses.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.query,
                f:
                  strip.request && strip.request.searchV6 && strip.request.searchV6.filters
                    ? JSON.stringify(
                      // this.searchServSvc.transformSearchV6Filters(
                      strip.request.searchV6.filters
                      // ),
                    )
                    : {},
              },
            }
            : null
          if (courses && courses.length) {
            content = courses
              .map(c => {
                const contentTemp: NsContent.IContent = c.content
                contentTemp.completionPercentage = c.completionPercentage || c.progress || 0
                contentTemp.completionStatus = c.completionStatus || c.status || 0
                return contentTemp
              })
          }
          // To filter content with completionPercentage > 0,
          // so that only those content will show in home page
          // continue learing strip
          if (content && content.length) {
            contentNew = content.filter((c: any) => {
              /** commented as both are 0 after enrolll */
              if (c.completionPercentage && c.completionPercentage > 0) {
                return c
              }
            })
          }
          if (localStorage.getItem('loginbtn') || localStorage.getItem('url_before_login')) {
            // this.tocSvc.setcontentForWidget(contentNew)
            this.processStrip(
              strip,
              this.transformContentsToWidgets(contentNew, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          } else {
            // this.tocSvc.setcontentForWidget(content)
            this.processStrip(
              strip,
              this.transformContentsToWidgets(content, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          }
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        }
      )
    }
  }

  private fetchStripFromKey(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchStripFromRequestData(stripData, calculateParentStatus)
    }
  }

  private fetchStripFromHomeKey(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchHomeStripFromRequestData(stripData, calculateParentStatus)
    }
  }

  private fetchHomeStripFromRequestData(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {

    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    // this.fetchFromApi(strip, calculateParentStatus)
    // this.fetchFromSearch(strip, calculateParentStatus)
    // this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromPublicSearch(strip, calculateParentStatus)
    // his.fetchFromIds(strip, calculateParentStatus)
    // this.fetchFromEnrollmentList(strip, calculateParentStatus)
  }

  private fetchStripFromRequestData(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    // setting initial values
    this.processStrip(strip, [], 'fetching', false, null)
    this.fetchFromApi(strip, calculateParentStatus)
    this.fetchFromSearch(strip, calculateParentStatus)
    this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    this.fetchFromSearchV6(strip, calculateParentStatus)
    this.fetchFromIds(strip, calculateParentStatus)
    this.fetchFromEnrollmentList(strip, calculateParentStatus)
  }
  fetchFromApi(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.api && Object.keys(strip.request.api).length) {
      this.contentStripSvc.getContentStripResponseApi(strip.request.api).subscribe(
        results => {
          results.contents = results.contents.filter(item => {
            return item.contentType === 'Course'
          })
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.contents, strip),
            'done',
            calculateParentStatus,
            null,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }
  fetchFromSearch(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.search && Object.keys(strip.request.search).length) {
      if (this.configSvc.activeLocale) {
        strip.request.search.locale = [this.configSvc.activeLocale.locals[0]]
      } else {
        strip.request.search.locale = ['en']
      }
      if (!this.callPublicApi) {
        if (strip.request.search && strip.request.search.filters) {
          strip.request.search.filters.lastUpdatedOn = ['year']
          strip.request.search.sort = [
            {
              lastUpdatedOn: 'desc',
            },
          ]
        }
        this.contentSvc.search(strip.request.search).subscribe(
          results => {
            const showViewMore = Boolean(
              results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
            )
            const viewMoreUrl = showViewMore
              ? {
                path: '/app/search/learning',
                queryParams: {
                  q: strip.request && strip.request.search && strip.request.search.query,
                  f: JSON.stringify(
                    strip.request && strip.request.search && strip.request.search.filters,
                  ),
                },
              }
              : null
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.result, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          },
          () => {
            this.processStrip(strip, [], 'error', calculateParentStatus, null)
          },
        )
      } else {
        const req = {
          query: '',
          filters: [{ andFilters: [{ contentType: ['Course', 'Program'] }] }],
        }
        this.contentSvc.searchV6(req).subscribe(result => {
          const results = result
          if (results.result.length > 0) {
            const showViewMore = Boolean(
              results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
            )
            const viewMoreUrl = showViewMore
              ? {
                path: '/app/search/learning',
                queryParams: {
                  q: strip.request && strip.request.search && strip.request.search.query,
                  f: JSON.stringify(
                    strip.request && strip.request.search && strip.request.search.filters,
                  ),
                },
              }
              : null
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.result, strip),
              'done',
              calculateParentStatus,
              viewMoreUrl,
            )
          }
        })
      }
    }
  }

  fetchFromSearchRegionRecommendation(
    strip: NsContentStripMultiple.IContentStripUnit,
    calculateParentStatus = true,
  ) {
    if (
      strip.request &&
      strip.request.searchRegionRecommendation &&
      Object.keys(strip.request.searchRegionRecommendation).length
    ) {
      this.contentSvc
        .searchRegionRecommendation(strip.request.searchRegionRecommendation)
        .subscribe(
          results => {
            this.processStrip(
              strip,
              this.transformContentsToWidgets(results.contents, strip),
              'done',
              calculateParentStatus,
              null,
            )
          },
          () => {
            this.processStrip(strip, [], 'error', calculateParentStatus, null)
          },
        )
    }
  }
  private transformSearchV6FiltersV2(v6filters: any) {
    const filters: any = {}
    if (v6filters.constructor === Array) {
      v6filters.forEach(((f: any) => {
        Object.keys(f).forEach(key => {
          filters[key] = f[key]
        })
      }))
      return filters
    }
    return v6filters
  }

  fetchFromSearchV6(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.searchV6 && Object.keys(strip.request.searchV6).length) {
      // if (!(strip.request.searchV6.locale && strip.request.searchV6.locale.length > 0)) {
      //   if (this.configSvc.activeLocale) {
      //     strip.request.searchV6.locale = [this.configSvc.activeLocale.locals[0]]
      //   } else {
      //     strip.request.searchV6.locale = ['en']
      //   }
      // }
      let originalFilters: any = []
      if (strip.request &&
        strip.request.searchV6 &&
        strip.request.searchV6.request &&
        strip.request.searchV6.request.filters) {
        originalFilters = strip.request.searchV6.request.filters
        strip.request.searchV6.request.filters = this.transformSearchV6FiltersV2(
          strip.request.searchV6.request.filters,
        )
      }

      this.contentSvc.searchV6(strip.request.searchV6).subscribe(
        results => {
          const showViewMore = Boolean(
            results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          results.result = this.filterCourse(results.result)
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.request,
                f:
                  strip.request &&
                    strip.request.searchV6 &&
                    strip.request.searchV6.request &&
                    strip.request.searchV6.request.filters
                    ? JSON.stringify(
                      this.transformSearchV6FiltersV2(
                        originalFilters,
                      )
                    )
                    : {},
              },
            }
            : null
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.result['content'], strip),
            'done',
            calculateParentStatus,
            viewMoreUrl,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }

  fetchFromPublicSearch(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.searchV6 && Object.keys(strip.request.searchV6).length) {
      // if (!(strip.request.searchV6.locale && strip.request.searchV6.locale.length > 0)) {
      //   if (this.configSvc.activeLocale) {
      //     strip.request.searchV6.locale = [this.configSvc.activeLocale.locals[0]]
      //   } else {
      //     strip.request.searchV6.locale = ['en']
      //   }
      // }
      let originalFilters: any = []
      if (strip.request &&
        strip.request.searchV6 &&
        strip.request.searchV6.request &&
        strip.request.searchV6.request.filters) {
        originalFilters = strip.request.searchV6.request.filters
        strip.request.searchV6.request.filters = this.transformSearchV6FiltersV2(
          strip.request.searchV6.request.filters,
        )
      }

      this.contentSvc.publicContentSearch(strip.request.searchV6).subscribe(
        results => {
          results.result = this.filterCourse(results.result)
          const showViewMore = Boolean(
            results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.request,
                f:
                  strip.request &&
                    strip.request.searchV6 &&
                    strip.request.searchV6.request &&
                    strip.request.searchV6.request.filters
                    ? JSON.stringify(
                      this.transformSearchV6FiltersV2(
                        originalFilters,
                      )
                    )
                    : {},
              },
            }
            : null
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results.result['content'], strip),
            'done',
            calculateParentStatus,
            viewMoreUrl,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }

  fetchFromIds(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.ids && Object.keys(strip.request.ids).length) {
      this.contentSvc.fetchMultipleContent(strip.request.ids).subscribe(
        results => {
          this.processStrip(
            strip,
            this.transformContentsToWidgets(results, strip),
            'done',
            calculateParentStatus,
            null,
          )
        },
        () => {
          this.processStrip(strip, [], 'error', calculateParentStatus, null)
        },
      )
    }
  }
  filterCourse(contents: any) {
    const list = contents.content
    const newList = list.filter((i: any) => {
      return i.identifier !== 'do_11357408383009587211503'
    })
    contents.content = newList
    return contents

  }

  private transformContentsToWidgets(
    contents: NsContent.IContent[],
    strip: NsContentStripMultiple.IContentStripUnit,
  ) {
    return (contents || []).map((content, idx) => ({
      widgetType: 'card',
      widgetSubType: 'cardContent',
      widgetHostClass: 'mb-2',
      widgetData: {
        content,
        cardSubType: strip.stripConfig && strip.stripConfig.cardSubType,
        context: { pageSection: strip.key, position: idx },
        intranetMode: strip.stripConfig && strip.stripConfig.intranetMode,
        deletedMode: strip.stripConfig && strip.stripConfig.deletedMode,
        contentTags: strip.stripConfig && strip.stripConfig.contentTags,
      },
    }))
  }

  showAccordion(key: string) {
    if (this.utilitySvc.isMobile && this.stripsResultDataMap[key].mode === 'accordion') {
      return this.showAccordionData
    }
    return true
  }

  setHiddenForStrip(key: string) {
    this.stripsResultDataMap[key].showStrip = false
    localStorage.setItem(`cstrip_${key}`, '1')
  }
  private getIfStripHidden(key: string): boolean {
    const storageItem = localStorage.getItem(`cstrip_${key}`)
    return Boolean(storageItem !== '1')
  }

  private async processStrip(
    strip: NsContentStripMultiple.IContentStripUnit,
    results: NsWidgetResolver.IRenderConfigWithAnyData[] = [],
    fetchStatus: TFetchStatus,
    calculateParentStatus = true,
    viewMoreUrl: any,
    // calculateParentStatus is used so that parents' status is not re-calculated if the API is called again coz of filters, etc.
  ) {
    // this.stripsResultDataMap[strip.key]
    if (results.length && strip.fetchLikes) {
      await this.processContentLikes(results)
    }
    const stripData = {
      viewMoreUrl,
      key: strip.key,
      canHideStrip: Boolean(strip.canHideStrip),
      showStrip: this.getIfStripHidden(strip.key),
      noDataWidget: strip.noDataWidget,
      errorWidget: strip.errorWidget,
      stripInfo: strip.info,
      stripTitle: strip.title,
      stripName: strip.name,
      mode: strip.mode,
      stripBackground: strip.stripBackground,
      widgets:
        fetchStatus === 'done'
          ? [
            ...(strip.preWidgets || []).map(w => ({
              ...w,
              widgetHostClass: `mb-2 ${w.widgetHostClass}`,
            })),
            ...results,
            ...(strip.postWidgets || []).map(w => ({
              ...w,
              widgetHostClass: `mb-2 ${w.widgetHostClass}`,
            })),
          ]
          : [],
      showOnNoData: Boolean(
        strip.noDataWidget &&
        !((strip.preWidgets || []).length + results.length + (strip.postWidgets || []).length) &&
        fetchStatus === 'done',
      ),
      showOnLoader: Boolean(strip.loader && fetchStatus === 'fetching'),
      showOnError: Boolean(strip.errorWidget && fetchStatus === 'error'),
    }
    // const stripData = this.stripsResultDataMap[strip.key]
    this.stripsResultDataMap = {
      ...this.stripsResultDataMap,
      [strip.key]: stripData,
    }

    if (
      calculateParentStatus &&
      (fetchStatus === 'done' || fetchStatus === 'error') &&
      stripData.widgets
    ) {
      this.checkParentStatus(fetchStatus, stripData.widgets.length)
    }
    if (calculateParentStatus && !(results && results.length > 0)) {
      this.contentAvailable = false
    } else if (results && results.length > 0) {
      this.contentAvailable = true
    }
  }
  private checkParentStatus(fetchStatus: TFetchStatus, stripWidgetsCount: number): void {
    if (fetchStatus === 'done' && !stripWidgetsCount) {
      this.noDataCount += 1
    } else if (fetchStatus === 'done' && stripWidgetsCount) {
      this.successDataCount += 1
    } else if (fetchStatus === 'error') {
      this.errorDataCount += 1
    }
    const settledCount = this.noDataCount + this.successDataCount + this.errorDataCount
    const totalCount = this.widgetData.strips.length
    if (this.successDataCount > 0 && settledCount < totalCount) {
      return
    }
    this.showParentLoader = settledCount !== totalCount
    this.showParentNoData =
      this.noDataCount > 0 && this.noDataCount + this.errorDataCount === totalCount
    this.showParentError = this.errorDataCount === totalCount
  }

  toggleInfo(data: IStripUnitContentData) {
    const stripInfo = this.stripsResultDataMap[data.key].stripInfo
    if (stripInfo) {
      if (stripInfo.mode !== 'below') {
        this.loggerSvc.warn(`strip info mode: ${stripInfo.mode} not implemented yet`)
        stripInfo.mode = 'below'
      }
      if (stripInfo.mode === 'below') {
        this.stripsResultDataMap[data.key].stripInfo = {
          ...stripInfo,
          visibilityMode: 'visible',
        }
      }
    }
  }

  checkForEmptyWidget(strip: NsContentStripMultiple.IContentStripUnit): boolean {
    if (
      strip.request &&
      ((strip.request.api && Object.keys(strip.request.api).length) ||
        (strip.request.search && Object.keys(strip.request.search).length) ||
        (strip.request.searchRegionRecommendation &&
          Object.keys(strip.request.searchRegionRecommendation).length) ||
        (strip.request.searchV6 && Object.keys(strip.request.searchV6).length) ||
        (strip.request.enrollmentList && Object.keys(strip.request.enrollmentList).length) ||
        (strip.request.ids && Object.keys(strip.request.ids).length))
    ) {
      return true
    }
    if (strip.request &&
      ((strip.request.search && Object.keys(strip.request.search).length))) {
      return true
    }
    return false
  }

  processContentLikes(results: NsWidgetResolver.IRenderConfigWithAnyData[]): Promise<any> {
    const contentIds = {
      content_id:
        results.map(result => result.widgetData && result.widgetData.content.identifier) || [],
    }
    return this.contentSvc
      .fetchContentLikes(contentIds)
      .then(likeHash => {
        const likes = likeHash
        results.forEach(result => {
          result.widgetData.likes = likes[result.widgetData.content.identifier] || 0
        })
      })
      .catch(_err => { })
      .finally(() => Promise.resolve())
  }
}
