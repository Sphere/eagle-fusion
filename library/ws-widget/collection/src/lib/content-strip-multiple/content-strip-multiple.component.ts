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
import { SearchServService } from '@ws/app/src/lib/routes/search/services/search-serv.service'

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
    private searchServSvc: SearchServService,
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
    } else {
      this.initData()
    }
  }

  ngOnDestroy() {
    if (this.changeEventSubscription) {
      this.changeEventSubscription.unsubscribe()
    }
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
    // this.fetchFromApi(strip, calculateParentStatus)
    this.fetchFromSearch(strip, calculateParentStatus)
    // this.fetchFromSearchRegionRecommendation(strip, calculateParentStatus)
    // this.fetchFromSearchV6(strip, calculateParentStatus)
    this.fetchFromIds(strip, calculateParentStatus)
  }

  private fetchStripFromKey(key: string, calculateParentStatus = true) {
    const stripData = this.widgetData.strips.find(strip => strip.key === key)
    if (stripData) {
      this.fetchStripFromRequestData(stripData, calculateParentStatus)
    }
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
  fetchFromSearchV6(strip: NsContentStripMultiple.IContentStripUnit, calculateParentStatus = true) {
    if (strip.request && strip.request.searchV6 && Object.keys(strip.request.searchV6).length) {
      if (!(strip.request.searchV6.locale && strip.request.searchV6.locale.length > 0)) {
        if (this.configSvc.activeLocale) {
          strip.request.searchV6.locale = [this.configSvc.activeLocale.locals[0]]
        } else {
          strip.request.searchV6.locale = ['en']
        }
      }
      this.contentSvc.searchV6(strip.request.searchV6).subscribe(
        results => {
          const showViewMore = Boolean(
            results.result.length > 5 && strip.stripConfig && strip.stripConfig.postCardForSearch,
          )
          const viewMoreUrl = showViewMore
            ? {
              path: '/app/search/learning',
              queryParams: {
                q: strip.request && strip.request.searchV6 && strip.request.searchV6.query,
                f:
                  strip.request && strip.request.searchV6 && strip.request.searchV6.filters
                    ? JSON.stringify(
                      this.searchServSvc.transformSearchV6Filters(
                        strip.request.searchV6.filters,
                      ),
                    )
                    : {},
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

  private transformContentsToWidgets(
    contents: NsContent.IContent[],
    strip: NsContentStripMultiple.IContentStripUnit,
  ) {
    return (contents.content || []).map((content, idx) => ({
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
    sessionStorage.setItem(`cstrip_${key}`, '1')
  }
  private getIfStripHidden(key: string): boolean {
    const storageItem = sessionStorage.getItem(`cstrip_${key}`)
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
