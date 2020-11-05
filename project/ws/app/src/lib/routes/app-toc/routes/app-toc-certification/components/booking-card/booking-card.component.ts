import { Component, OnDestroy, Input, EventEmitter, Output } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { throwError, Subject } from 'rxjs'
import { takeWhile, switchMap, tap, takeUntil } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TSendStatus, TFetchStatus } from '@ws-widget/utils'

import { SnackbarComponent } from '../snackbar/snackbar.component'
import { CertificationApiService } from '../../apis/certification-api.service'
import {
  ICertificationMeta,
  TCertificationRequestType,
  ICertificationSendResponse,
} from '../../models/certification.model'
import { RequestCancelDialogComponent } from '../request-cancel-dialog/request-cancel-dialog.component'

@Component({
  selector: 'ws-app-toc-certification-booking-card',
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss'],
})
export class BookingCardComponent implements OnDestroy {
  @Input() certification!: ICertificationMeta
  @Input() content!: NsContent.IContent
  @Output() slotCancel: EventEmitter<any>

  fetchStatus: TFetchStatus
  bookingCancelStatus: TSendStatus
  currentTime: number
  subscriptionSubject$: Subject<any>

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
  ) {
    this.currentTime = new Date().getTime()
    this.bookingCancelStatus = 'none'
    this.fetchStatus = 'none'
    this.slotCancel = new EventEmitter<any>()
    this.subscriptionSubject$ = new Subject<any>()
  }

  ngOnDestroy() {
    this.subscriptionSubject$.next()
    this.subscriptionSubject$.complete()
  }

  openCancelDialog() {
    this.dialog
      .open<RequestCancelDialogComponent, TCertificationRequestType>(RequestCancelDialogComponent, {
        data: 'proctor_approval',
      })
      .afterClosed()
      .pipe(
        takeUntil(this.subscriptionSubject$),
        takeWhile(dialogResult => dialogResult && dialogResult.confirmCancel),
        tap(() => {
          this.bookingCancelStatus = 'sending'
        }),
        switchMap(() => {
          if (this.content && this.certification && this.certification.booking) {
            return this.certificationApi.cancelSlot(
              this.content.identifier,
              this.certification.booking.slotno,
              this.certification.booking.icfdId,
            )
          }
          return throwError('No data.')
        }),
      )
      .subscribe(
        (res: ICertificationSendResponse) => {
          this.snackbar.openFromComponent(SnackbarComponent, {
            data: {
              action: 'cert_slot_cancel',
              code: res.res_code,
            },
          })

          if (res.res_code === 1) {
            this.slotCancel.emit()
          }

          this.bookingCancelStatus = 'done'
        },
        () => {
          this.snackbar.openFromComponent(SnackbarComponent)
          this.bookingCancelStatus = 'error'
        },
      )
  }

}
