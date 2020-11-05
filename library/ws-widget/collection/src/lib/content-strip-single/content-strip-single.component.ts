import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { TFetchStatus } from '@ws-widget/utils'
import { NsContent } from '../_services/widget-content.model'
import { WidgetContentService } from '../_services/widget-content.service'
import { NsContentStripSingle } from './content-strip-single.model'
import { ContentStripSingleService } from './content-strip-single.service'

@Component({
  selector: 'ws-widget-content-strip-single',
  templateUrl: './content-strip-single.component.html',
  styleUrls: ['./content-strip-single.component.scss'],
})
export class ContentStripSingleComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsContentStripSingle.IContentStripSingle> {
  @Input() widgetData!: NsContentStripSingle.IContentStripSingle
  stripsResultDataMap: NsContentStripSingle.IContentStrip[] = []

  loader = false
  error = false
  showNoData = false
  errorDataCount = 0
  noDataCount = 0
  successDataCount = 0
  totalCount = 0
  results = []
  searchArray = ['preview', 'channel', 'author']
  isFromAuthoring = false

  constructor(
    private contentStripSvc: ContentStripSingleService,
    private contentSvc: WidgetContentService,
  ) {
    super()
  }

  ngOnInit() {
    const url = window.location.href
    this.isFromAuthoring = this.searchArray.some((word: string) => {
      return url.indexOf(word) > -1
    })
    this.initData()
  }

  private initData() {
    if (this.widgetData.loader) {
      this.loader = true
    }
    this.fetchFromApi()
    this.fetchFromSearch()
    this.fetchFromSearchRegionRecommendation()
    this.fetchFromSearchV6()
    this.fetchFromIds()
    this.processManualData()
  }

  fetchFromApi() {
    if (
      this.widgetData.request &&
      this.widgetData.request.api &&
      Object.keys(this.widgetData.request.api).length
    ) {
      this.checkParentStatus('fetching', 0)
      this.contentStripSvc.getContentStripResponseApi(this.widgetData.request.api).subscribe(results => {
          this.convertToStrip(results.contents || [])
          this.checkParentStatus('done', results.contents.length)
        },
                                                                                             () => {
          this.checkParentStatus('error', 0)
        },
      )
    }
  }
  fetchFromSearch() {
    if (
      this.widgetData.request &&
      this.widgetData.request.search &&
      Object.keys(this.widgetData.request.search).length
    ) {
      this.checkParentStatus('fetching', 0)
      this.contentSvc.search(this.widgetData.request.search).subscribe(results => {
          this.convertToStrip(results.result || [])
          this.checkParentStatus('done', results.result.length)
        },
                                                                       () => {
          this.checkParentStatus('error', 0)
        },
      )
    }
  }
  fetchFromSearchRegionRecommendation() {
    if (
      this.widgetData.request &&
      this.widgetData.request.searchRegionRecommendation &&
      Object.keys(this.widgetData.request.searchRegionRecommendation).length
    ) {
      this.checkParentStatus('fetching', 0)
      this.contentSvc
        .searchRegionRecommendation(this.widgetData.request.searchRegionRecommendation)
        .subscribe(results => {
            this.convertToStrip(results.contents || [])
            this.checkParentStatus('done', results.contents.length)
          },
                   () => {
            this.checkParentStatus('error', 0)
          },
        )
    }
  }
  fetchFromSearchV6() {
    if (
      this.widgetData.request &&
      this.widgetData.request.searchV6 &&
      Object.keys(this.widgetData.request.searchV6).length
    ) {
      this.checkParentStatus('fetching', 0)
      this.contentSvc.searchV6(this.widgetData.request.searchV6).subscribe(results => {
          this.convertToStrip(results.result || [])
          this.checkParentStatus('done', results.result.length)
        },
                                                                           () => {
          this.checkParentStatus('error', 0)
        },
      )
    }
  }
  fetchFromIds() {
    if (
      this.widgetData.request &&
      this.widgetData.request.ids &&
      Object.keys(this.widgetData.request.ids).length
    ) {
      this.checkParentStatus('fetching', 0)
      this.contentSvc.fetchMultipleContent(this.widgetData.request.ids).subscribe(results => {
          this.convertToStrip(results || [])
          this.checkParentStatus('done', results.length)
        },
                                                                                  () => {
          this.checkParentStatus('error', 0)
        },
      )
    }
  }

  private checkParentStatus(fetchStatus: TFetchStatus, stripWidgetsCount: number): void {
    if (fetchStatus === 'done' && !stripWidgetsCount) {
      this.noDataCount += 1
    } else if (fetchStatus === 'done' && stripWidgetsCount) {
      this.successDataCount += 1
    } else if (fetchStatus === 'error') {
      this.errorDataCount += 1
    } else if (fetchStatus === 'fetching') {
      this.totalCount += 1
    }
    const settledCount = this.noDataCount + this.successDataCount + this.errorDataCount
    if (this.successDataCount > 0 && settledCount < this.totalCount) {
      return
    }
    if (this.loader) {
      this.loader = settledCount !== this.totalCount
    }
    this.showNoData =
      this.noDataCount > 0 && this.noDataCount + this.errorDataCount === this.totalCount
    this.error = this.errorDataCount === this.totalCount
  }

  processManualData() {
    if (
      this.widgetData.request &&
      this.widgetData.request.manualData &&
      this.widgetData.request.manualData.length
    ) {
      this.checkParentStatus('fetching', 0)
      this.widgetData.request.manualData.forEach(v => {
        this.stripsResultDataMap.push({
          title: v.title,
          url: v.url,
          lastUpdatedOn: new Date(v.lastUpdatedOn as string),
          target: v.target || '_blank',
        })
      })
      this.checkParentStatus('done', 0)
    }
  }

  convertToStrip(data: NsContent.IContent[] = []) {
    data.forEach(v => {
      this.stripsResultDataMap.push({
        title: v.name,
        url: `/app/toc/${v.identifier}/overview`,
        lastUpdatedOn: this.convertToISODate(v.lastUpdatedOn),
        target: '_self',
      })
    })
  }

  convertToISODate(date: string): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }
}
