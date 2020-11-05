import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { BehaviorSubject, noop, Subscription } from 'rxjs'
import { takeWhile, tap, switchMap } from 'rxjs/operators'

import { TFetchStatus } from '@ws-widget/utils'

import {
  ICertificationRequestItem,
  TCertificationRequestType,
  IRequestFilterDialogResult,
} from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'
import { RequestFilterDialogComponent } from '../request-filter-dialog/request-filter-dialog.component'
import { CertificationDashboardService } from '../../services/certification-dashboard.service'
import { MatDialog } from '@angular/material'

@Component({
  selector: 'ws-app-certification-requests',
  templateUrl: './certification-requests.component.html',
  styleUrls: ['./certification-requests.component.scss'],
})
export class CertificationRequestsComponent implements OnInit, OnDestroy {
  @Input() readonly pageType!: 'approver' | 'user'
  approvalItems: ICertificationRequestItem[]
  itemFetchStatus: TFetchStatus
  requestType: TCertificationRequestType
  startDate: Date
  endDate: Date
  itemSubject: BehaviorSubject<boolean>

  private itemSub?: Subscription
  private dialogSub?: Subscription

  constructor(
    private dialog: MatDialog,
    private certificationDashboardSvc: CertificationDashboardService,
  ) {
    this.approvalItems = []
    this.requestType = 'all'
    this.itemFetchStatus = 'none'
    this.itemSubject = new BehaviorSubject<boolean>(true)
    this.startDate = new Date(new Date().getFullYear(), 0, 1)
    this.endDate = new Date(new Date().getFullYear() + 1, 0, 1)
  }

  ngOnInit() {
    this.subscribeToSubject()
  }

  ngOnDestroy() {
    if (this.itemSub && !this.itemSub.closed) {
      this.itemSub.unsubscribe()
    }

    if (this.dialogSub && !this.dialogSub.closed) {
      this.dialogSub.unsubscribe()
    }
  }

  openFilterDialog() {
    this.dialogSub = this.dialog
      .open<RequestFilterDialogComponent, 'approver' | 'user', IRequestFilterDialogResult>(
        RequestFilterDialogComponent,
        { data: this.pageType },
      )
      .afterClosed()
      .pipe(
        takeWhile(dialogResult => {
          if (dialogResult) {
            return true
          }

          return false
        }),
        tap(dialogResult => {
          if (dialogResult) {
            if (dialogResult.type) {
              this.requestType = dialogResult.type
            }

            if (dialogResult.startDate) {
              this.startDate = dialogResult.startDate
            }

            if (dialogResult.endDate) {
              this.endDate = dialogResult.endDate
            }
          }
        }),
      )
      .subscribe(() => {
        this.itemSubject.next(true)
      },         noop)
  }

  private subscribeToSubject() {
    this.itemSub = this.itemSubject
      .pipe(
        takeWhile(value => value),
        tap(() => {
          this.itemFetchStatus = 'fetching'
        }),
        switchMap(() =>
          this.pageType === 'approver'
            ? this.certificationDashboardSvc.getApprovalItems(this.requestType || 'all')
            : this.certificationDashboardSvc.getCertificationRequests(
                this.startDate,
                this.endDate,
                this.requestType,
              ),
        ),
      )
      .subscribe(
        items => {
          this.approvalItems = items
          this.itemFetchStatus = 'done'
        },
        () => {
          this.itemFetchStatus = 'error'
        },
      )
  }
}
