import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core'
import { ISearchContent, ISearchResult } from '../../../../../../../author/src/lib/interface/search'
import { Subscription } from 'rxjs'
import { MyContentService } from '../../../../../../../author/src/lib/routing/modules/my-content/services/my-content.service'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-content-reviewed',
  templateUrl: './content-reviewed.component.html',
  styleUrls: ['./content-reviewed.component.scss'],
})
export class ContentReviewedComponent implements OnInit, OnDestroy {
  @Input() wid = ''
  @Output() fetching = new EventEmitter<Boolean>()
  @Output() count = new EventEmitter<number>()

  userWid = ''
  contentsReviewed: ISearchContent[] = []
  contentCurrentDisplay: ISearchContent[] = []
  private contentSubscription: Subscription | null = null
  contentfetch: ISearchContent[] = []
  contentFetchStatus: TFetchStatus = 'none'
  defaultThumbnail = ''

  // paginator
  nextContentDisable = false
  previousContentDisable = false
  pageDisplaySize = 5
  lastIndexContentArray = this.pageDisplaySize
  startIndexContentArray = 0
  totalHits = 0
  apiPageSize = 5
  displayPageNo = 1
  totalPages = 0
  apiPageNo = 0
  viewedPageNo: number[] = []

  constructor(
    private myContSvc: MyContentService,
    private configSvc: ConfigurationsService,
    private matSnackBar: MatSnackBar
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userWid = this.configSvc.userProfile.userId
    }
    if (this.wid) {
      this.fetchContentReviewed()
    }
    /* if (this.contentfetch.length > this.pageDisplaySize) {
      this.contentsReviewed = this.contentfetch.slice(this.startIndexContentArray, this.lastIndexContentArray)
      this.previousContentDisable = true
    } else {
      this.contentsReviewed = this.contentfetch
    } */
  }

  fetchContentReviewed() {
    this.contentFetchStatus = 'fetching'
    this.fetching.emit(false)
    const requestData = {
      locale: [],
      query: '',
      filters: [{
        andFilters: [{
          status: ['Reviewed'],
          trackContacts: [this.wid],
        }],
      }],
      pageNo: this.apiPageNo,
      sort: [{ lastUpdatedOn: 'desc' }],
      pageSize: this.apiPageSize,
      uuid: this.userWid,
      rootOrg: this.configSvc.rootOrg,
    }
    this.contentSubscription = this.myContSvc.fetchFromSearchV6(requestData).subscribe(
      (result: ISearchResult) => {
        if (result) {
          this.contentsReviewed = result.result
          result.result.forEach(content => {
            if (this.contentsReviewed.indexOf(content) === -1) {
              this.contentsReviewed.push(content)
            }
          })
          this.totalHits = result.totalHits
          this.totalPages = Math.ceil(this.totalHits / this.pageDisplaySize)

          if (this.contentsReviewed.length > this.pageDisplaySize) {
            this.contentCurrentDisplay = this.contentsReviewed.slice(this.startIndexContentArray, this.lastIndexContentArray)
          } else {
            this.contentCurrentDisplay = this.contentsReviewed
          }
          if (this.startIndexContentArray <= 0) {
            this.previousContentDisable = true
          }
        }
        this.count.emit(this.contentsReviewed.length)
        this.contentFetchStatus = 'done'
        this.fetching.emit(true)
      },
      () => {
        this.contentFetchStatus = 'error'
        this.openSnackBar('Error while fetching content reviewed.')
        this.fetching.emit(true)
      })
  }

  ngOnDestroy() {
    if (this.contentSubscription) {
      this.contentSubscription.unsubscribe()
    }
  }

  fetchNextContent() {
    if (this.previousContentDisable) {
      this.previousContentDisable = false
    }
    this.contentCurrentDisplay = []
    this.startIndexContentArray += this.pageDisplaySize
    this.lastIndexContentArray += this.pageDisplaySize
    if (this.displayPageNo !== this.totalPages) {
      this.apiPageNo += 1
      this.fetchContentReviewed()
    }

    this.displayPageNo += 1
    if (this.viewedPageNo.indexOf(this.displayPageNo) !== -1) {
      this.viewedPageNo.push(this.displayPageNo)
    }
    if (this.displayPageNo === this.totalPages) {
      this.nextContentDisable = true
    }

    this.contentCurrentDisplay = this.contentsReviewed.slice(this.startIndexContentArray, this.lastIndexContentArray)
    /* if (this.lastIndexContentArray >= this.contentfetch.length) {
      this.nextContentDisable = true
    }
      this.contentsReviewed = this.contentfetch.slice(this.startIndexContentArray, this.lastIndexContentArray) */
  }

  fetchPreviousBlog() {
    this.displayPageNo -= 1

    if (this.nextContentDisable) {
      this.nextContentDisable = false
    }

    this.contentCurrentDisplay = []
    this.startIndexContentArray -= this.pageDisplaySize
    this.lastIndexContentArray -= this.pageDisplaySize
    if (this.startIndexContentArray <= 0) {
      this.startIndexContentArray = 0
      this.previousContentDisable = true
    }
    this.contentCurrentDisplay = this.contentsReviewed.slice(this.startIndexContentArray, this.lastIndexContentArray)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

}
