import { Component, Input, OnDestroy } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { BehaviorSubject, Subscription, throwError, of } from 'rxjs'
import { switchMap, takeWhile, tap } from 'rxjs/operators'

import { TSendStatus, TFetchStatus } from '@ws-widget/utils'

import { FileDownloadService } from '../../../../../app-toc/routes/app-toc-certification/services/file-download.service'
import { CertificationApiService } from '../../../../../app-toc/routes/app-toc-certification/apis/certification-api.service'
import { CertificationDashboardService } from '../../services/certification-dashboard.service'
import {
  ICertificationRequestItem,
  TCertificationActionType,
  ICertificationDialogData,
  ICertificationDialogResult,
} from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component'
import { SnackbarComponent } from '../../../../../app-toc/routes/app-toc-certification/components/snackbar/snackbar.component'

@Component({
  selector: 'ws-app-approval-card',
  templateUrl: './approval-card.component.html',
  styleUrls: ['./approval-card.component.scss'],
})
export class ApprovalCardComponent implements OnDestroy {
  @Input() approvalItem!: ICertificationRequestItem
  @Input() itemSubject!: BehaviorSubject<boolean>
  sendStatus: TSendStatus
  downloadStatus: TFetchStatus
  approverAction?: 'Approved' | 'Rejected'

  downloadSub?: Subscription
  dialogSub?: Subscription

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private certificationDashboardSvc: CertificationDashboardService,
    private certificationApi: CertificationApiService,
    private fileDownloadSvc: FileDownloadService,
  ) {
    this.sendStatus = 'none'
    this.downloadStatus = 'none'
  }

  ngOnDestroy() {
    if (this.downloadSub && !this.downloadSub.closed) {
      this.downloadSub.unsubscribe()
    }

    if (this.dialogSub && !this.dialogSub.closed) {
      this.dialogSub.unsubscribe()
    }
  }

  downloadProof() {
    if (this.approvalItem.document && this.approvalItem.document.length) {
      this.downloadStatus = 'fetching'

      this.downloadSub = this.certificationApi
        .getUploadedDocument(this.approvalItem.document[0].document_url)
        .pipe(
          switchMap((documentData: any) =>
            this.fileDownloadSvc.saveFile(documentData.documentString, documentData.documentName),
          ),
        )
        .subscribe(
          () => {
            this.downloadStatus = 'done'
          },
          () => {
            this.downloadStatus = 'error'
          },
        )
    } else {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: { code: 0, action: 'error' },
      })
    }
  }

  confirmAction(actionType: TCertificationActionType) {
    const dialogData = {
      actionType,
      approvalItem: this.approvalItem,
      action: this.approvalItem.record_type,
    }

    this.dialog
      .open<ConfirmDialogComponent, ICertificationDialogData, ICertificationDialogResult>(
        ConfirmDialogComponent,
        { data: dialogData },
      )
      .afterClosed()
      .pipe(
        takeWhile(dialogResult => {
          if (dialogResult && dialogResult.result) {
            return true
          }

          return false
        }),
        tap(dialogResult => {
          this.sendStatus = 'sending'
          if (dialogResult && dialogResult.data) {
            this.approverAction = dialogResult.data.status
          }
        }),
        switchMap(dialogResult => {
          if (dialogResult && dialogResult.data) {
            return this.certificationDashboardSvc.performApproverAction(
              dialogResult.action,
              dialogResult.data,
            )
          }

          return throwError(() => of('no data'))
        }),
        tap(
          res => {
            if (res && res.res_code === 1) {
              this.snackbar.openFromComponent(SnackbarComponent, {
                data: { action: this.approvalItem.record_type, code: this.approverAction },
              })

              return
            }

            this.snackbar.openFromComponent(SnackbarComponent)
          },
          () => {
            this.snackbar.openFromComponent(SnackbarComponent)
          },
        ),
      )
      .subscribe(
        res => {
          if (res && res.res_code === 1) {
            this.itemSubject.next(true)
          }

          this.sendStatus = 'done'
        },
        () => {
          this.sendStatus = 'error'
        },
      )
  }
}
