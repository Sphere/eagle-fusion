import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MyContentService } from '../../../../../../../author/src/lib/routing/modules/my-content/services/my-content.service'
import { ISearchResult, ISearchContent } from '../../../../../../../author/src/lib/interface/search'
import { Subscription } from 'rxjs'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'ws-app-content-authored',
  templateUrl: './content-authored.component.html',
  styleUrls: ['./content-authored.component.scss'],
})
export class ContentAuthoredComponent implements OnInit, OnDestroy {
  @Input() wid = ''
  @Output() fetching = new EventEmitter<Boolean>()
  @Output() count = new EventEmitter<number>()

  userWid = ''
  contentsAuthored: ISearchContent[] = []
  contentCurrentDisplay: ISearchContent[] = []
  private contentSubscription: Subscription | null = null
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
    private configSvc: ConfigurationsService,
    private contentSvc: MyContentService,
    private matSnackBar: MatSnackBar,
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
      this.fetchContentAuthored()
    }

  }
  fetchContentAuthored() {
    this.contentFetchStatus = 'fetching'
    this.fetching.emit(false)
    const requestData = {
      locale: [],
      query: '',
      filters: [{
        andFilters: [{
          status: ['Live'],
          creatorContacts: [this.wid],
        }],
      }],
      pageNo: this.apiPageNo,
      sort: [{ lastUpdatedOn: 'desc' }],
      pageSize: this.apiPageSize,
      uuid: this.userWid,
      rootOrg: this.configSvc.rootOrg,
    }
    this.contentSubscription = this.contentSvc.fetchFromSearchV6(requestData).subscribe(
      (result: ISearchResult) => {
        if (result) {
          result.result.forEach(content => {
            if (this.contentsAuthored.indexOf(content) === -1) {
              this.contentsAuthored.push(content)
            }
          })
          this.totalHits = result.totalHits
          this.totalPages = Math.ceil(this.totalHits / this.pageDisplaySize)

          if (this.contentsAuthored.length > this.pageDisplaySize) {
            this.contentCurrentDisplay = this.contentsAuthored.slice(this.startIndexContentArray, this.lastIndexContentArray)
          } else {
            this.contentCurrentDisplay = this.contentsAuthored
          }
          if (this.startIndexContentArray <= 0) {
            this.previousContentDisable = true
          }
        }
        this.fetching.emit(true)
        this.count.emit(this.contentsAuthored.length)
        this.contentFetchStatus = 'done'
      },
      () => {
        this.contentFetchStatus = 'error'
        this.openSnackBar('Error while fetching content authored.')
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
      if (this.viewedPageNo.length > 0) {
        if (this.viewedPageNo.indexOf(this.displayPageNo) === -1) {
          this.apiPageNo += 1
          this.viewedPageNo.push(this.displayPageNo)
          this.fetchContentAuthored()
        }
      } else {
        this.apiPageNo += 1
        this.viewedPageNo.push(this.displayPageNo)
        this.fetchContentAuthored()
      }
    }

    this.displayPageNo += 1

    if (this.displayPageNo === this.totalPages) {
      this.nextContentDisable = true
    }

    this.contentCurrentDisplay = this.contentsAuthored.slice(this.startIndexContentArray, this.lastIndexContentArray)
  }

  fetchPreviousContent() {
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
    this.contentCurrentDisplay = this.contentsAuthored.slice(this.startIndexContentArray, this.lastIndexContentArray)
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

}
