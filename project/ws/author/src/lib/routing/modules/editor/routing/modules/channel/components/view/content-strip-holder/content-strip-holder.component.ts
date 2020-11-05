import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { ContentStripMultipleService, NsContent, WidgetContentService } from '@ws-widget/collection'
import { IWidgetAuthor } from './../../../interface/widget'
import { ChannelStoreService } from './../../../services/store.service'

@Component({
  selector: 'ws-auth-content-strip-holder',
  templateUrl: './content-strip-holder.component.html',
  styleUrls: ['./content-strip-holder.component.scss'],
})
export class ContentStripHolderComponent implements OnInit, OnChanges {

  @Input() id = ''
  @Input() isSubmitPressed = false
  @Input() showData = 'data'
  widget!: IWidgetAuthor
  widgetDatas: any
  showInfo = false
  showError = false
  showNoData = false
  viewMore = false
  widgetMap!: any
  stripInfo!: IWidgetAuthor

  constructor(
    private store: ChannelStoreService,
    private contentStripSvc: ContentStripMultipleService,
    private contentSvc: WidgetContentService,
  ) { }

  ngOnInit() {
    this.store.update.subscribe(
      (id: string) => {
        if (id === this.id) {
          this.initiate()
        }
      },
    )
  }

  ngOnChanges() {
    this.initiate()
  }

  initiate() {
    this.showInfo = false
    this.showError = false
    this.showNoData = false
    this.viewMore = false
    this.widgetMap = {
      error: '',
      noData: '',
      info: '',
      preWidgets: [] as string[],
      postWidgets: [] as string[],
    }
    this.widget = this.store.getUpdatedContent(this.id)
    this.widget.children.map(
      v => {
        switch (this.store.getUpdatedContent(v).purpose) {
        case 'info':
          this.widgetMap.info = v
          break
        case 'noDataWidget':
          this.widgetMap.noData = v
          break
        case 'errorWidget':
          this.widgetMap.error = v
          break
        case 'preWidget':
          this.widgetMap.preWidgets.push(v)
          break
        case 'postWidget':
          this.widgetMap.postWidgets.push(v)
          break
        }
      },
    )
    if (this.widgetMap.info) {
      this.stripInfo = this.store.getUpdatedContent(this.widgetMap.info)
      this.showInfo = this.stripInfo.addOnData.visibilityMode === 'visible'
    } else {
      this.stripInfo = undefined as any
    }
    if (this.widget.data.request && this.widget.data.request.api &&
      Object.keys(this.widget.data.request.api).length) {
      this.fetchFromApi()
    } else if (this.widget.data.request && this.widget.data.request.search &&
      Object.keys(this.widget.data.request.search).length) {
      this.fetchFromSearch()
    } else if (this.widget.data.request && this.widget.data.request.search &&
      Object.keys(this.widget.data.request.search).length) {
      this.fetchFromSearch()
    } else if (this.widget.data.request && this.widget.data.request.search &&
      Object.keys(this.widget.data.request.search).length) {
      this.fetchFromSearch()
    } else if (this.widget.data.request && this.widget.data.request.ids && this.widget.data.request.ids.length) {
      this.fetchFromIds()
    } else {
      this.showNoData = true
    }
  }

  fetchFromApi() {
    this.contentStripSvc.getContentStripResponseApi(this.widget.data.request.api).subscribe(
      results => {
        this.transformContentsToWidgets(results.contents)
      },
      () => {
        this.showError = true
      },
    )
  }

  fetchFromSearch() {
    this.contentSvc.search(this.widget.data.request.search).subscribe(
      results => {
        this.viewMore = Boolean(
          results.result.length && this.widget.data.stripConfig && this.widget.data.stripConfig.postCardForSearch,
        )
        this.transformContentsToWidgets(results.result)
      },
      () => {
        this.showError = true
      },
    )
  }

  fetchFromIds() {
    this.contentSvc.fetchMultipleContent(this.widget.data.request.ids).subscribe(
      results => {
        this.transformContentsToWidgets(results)
      },
      () => {
        this.showError = true
      },
    )
  }

  fetchFromSearchRegionRecommendation() {
    if (this.widget.data.request && this.widget.data.request.searchRegionRecommendation
      && Object.keys(this.widget.data.request.searchRegionRecommendation).length) {
      this.contentSvc.searchRegionRecommendation(this.widget.data.request.searchRegionRecommendation).subscribe(
        results => {
          this.transformContentsToWidgets(results.contents)
        },
        () => {
          this.showError = true
        },
      )
    }
  }
  fetchFromSearchV6() {
    if (this.widget.data.request && this.widget.data.request.searchV6 && Object.keys(this.widget.data.request.searchV6).length) {
      this.contentSvc.searchV6(this.widget.data.request.searchV6).subscribe(
        results => {
          this.viewMore = Boolean(
            results.result.length && this.widget.data.stripConfig && this.widget.data.stripConfig.postCardForSearch,
          )
          // this.viewMore = showViewMore
          //   ? {
          //     path: '/app/search/learning',
          //     queryParams: {
          //       q: this.widget.data.request && this.widget.data.request.searchV6 && this.widget.data.request.searchV6.query,
          //       f: JSON.stringify(
          //         this.widget.data.request && this.widget.data.request.searchV6 && this.widget.data.request.searchV6.filters,
          //       ),
          //     },
          //   }
          //   : null
          this.transformContentsToWidgets(results.result)
        },
        () => {
          this.showError = true
        },
      )
    }
  }

  private transformContentsToWidgets(
    contents: NsContent.IContent[],
  ) {
    this.widgetDatas = (contents || []).map((content, idx) => ({
      widgetType: 'card',
      widgetSubType: 'cardContent',
      widgetHostClass: 'mb-2',
      widgetData: {
        content,
        cardSubType: this.widget.data.stripConfig && this.widget.data.stripConfig.cardSubType,
        context: { pageSection: this.widget.data.key, position: idx },
        intranetMode: this.widget.data.stripConfig && this.widget.data.stripConfig.intranetMode,
        deletedMode: this.widget.data.stripConfig && this.widget.data.stripConfig.deletedMode,
      },
    }))
  }

  triggerEdit(id: string) {
    this.store.triggerEdit(id)
  }

}
