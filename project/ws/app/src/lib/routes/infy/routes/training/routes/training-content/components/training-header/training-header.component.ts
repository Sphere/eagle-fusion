import { Component, OnInit, Input } from '@angular/core'

import { NsContent } from '@ws-widget/collection'
import { TSendStatus } from '@ws-widget/utils'

import {
  ITrainingUserPrivileges,
  IContentWatchlistStatus,
} from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'

@Component({
  selector: 'ws-app-training-header',
  templateUrl: './training-header.component.html',
  styleUrls: ['./training-header.component.scss'],
})
export class TrainingHeaderComponent implements OnInit {
  @Input() content!: NsContent.IContent
  @Input() trainingCount!: number
  @Input() trainingPrivileges!: ITrainingUserPrivileges
  watchlistStatus!: IContentWatchlistStatus
  watchlistAddStatus: TSendStatus
  watchlistRemoveStatus: TSendStatus
  contentTypes: typeof NsContent.EContentTypes

  constructor(private trainingApi: TrainingApiService) {
    this.watchlistAddStatus = 'none'
    this.watchlistRemoveStatus = 'none'
    this.contentTypes = NsContent.EContentTypes
  }

  ngOnInit() {
    this.getWatchlistStatus()
  }

  addToWatchlist() {
    try {
      this.watchlistAddStatus = 'sending'
      this.trainingApi.addToWatchlist(this.content.identifier).subscribe(
        res => {
          this.watchlistAddStatus = 'done'
          if (res.res_code === 1) {
            this.watchlistStatus = { inWatchlist: true }
          }
        },
        () => {
          this.watchlistAddStatus = 'error'
        },
      )
    } catch (e) {
      this.watchlistAddStatus = 'error'
    }
  }

  removeFromWatchlist() {
    try {
      this.watchlistRemoveStatus = 'sending'
      this.trainingApi.removeFromWatchlist(this.content.identifier).subscribe(
        () => {
          this.watchlistRemoveStatus = 'done'
          this.watchlistStatus = { inWatchlist: false }
        },
        () => {
          this.watchlistRemoveStatus = 'error'
        },
      )
    } catch (e) {
      this.watchlistRemoveStatus = 'error'
    }
  }

  private getWatchlistStatus() {
    try {
      this.trainingApi.isContentInWatchlist(this.content.identifier).subscribe(
        watchlistStatus => {
          this.watchlistStatus = watchlistStatus
        },
        () => {
          this.watchlistStatus = { inWatchlist: false }
        },
      )
    } catch (e) {
      this.watchlistStatus = { inWatchlist: false }
    }
  }
}
