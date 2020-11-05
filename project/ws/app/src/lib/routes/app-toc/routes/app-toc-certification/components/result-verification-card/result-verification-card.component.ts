import { Component, Input, OnDestroy } from '@angular/core'
import { throwError, Subscription, Subject } from 'rxjs'
import { switchMap, takeWhile, tap } from 'rxjs/operators'

import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'

import { CertificationApiService } from '../../apis/certification-api.service'
import { CertificationService } from '../../services/certification.service'

import { ICertificationMeta, TCertificationRequestType } from '../../models/certification.model'
import { FileDownloadService } from '../../services/file-download.service'
import { MatDialog, MatSnackBar } from '@angular/material'
import { RequestCancelDialogComponent } from '../request-cancel-dialog/request-cancel-dialog.component'
import { SnackbarComponent } from '../snackbar/snackbar.component'

@Component({
  selector: 'ws-app-toc-certification-result-verification-card',
  templateUrl: './result-verification-card.component.html',
  styleUrls: ['./result-verification-card.component.scss'],
})
export class ResultVerificationCardComponent implements OnDestroy {
  @Input() certification?: ICertificationMeta
  @Input() content?: NsContent.IContent
  @Input() certificationFetchSubject!: Subject<any>
  downloadStatus: TFetchStatus
  resultWithdrawStatus: TSendStatus

  withdrawalSub?: Subscription
  downloadSub?: Subscription

  constructor(
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private certificationApi: CertificationApiService,
    private certificationSvc: CertificationService,
    private fileDownloadSvc: FileDownloadService,
  ) {
    this.downloadStatus = 'none'
    this.resultWithdrawStatus = 'none'
  }

  ngOnDestroy() {
    if (this.withdrawalSub && !this.withdrawalSub.closed) {
      this.withdrawalSub.unsubscribe()
    }

    if (this.downloadSub && !this.downloadSub.closed) {
      this.downloadSub.unsubscribe()
    }
  }

  downloadProof() {
    if (this.certification && this.certification.verification_request) {
      this.downloadStatus = 'fetching'

      this.downloadSub = this.certificationApi
        .getUploadedDocument(this.certification.verification_request.document[0].document_url)
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
    }
  }

  withdrawResult() {
    this.withdrawalSub = this.dialog
      .open<RequestCancelDialogComponent, TCertificationRequestType, { confirmCancel: true }>(
        RequestCancelDialogComponent,
        {
          data: 'result_verification',
        },
      )
      .afterClosed()
      .pipe(
        takeWhile(dialogResult => {
          if (dialogResult && dialogResult.confirmCancel) {
            return true
          }
          return false
        }),
        tap(() => {
          this.resultWithdrawStatus = 'sending'
        }),
        switchMap(() => {
          if (this.content && this.certification) {
            return this.certificationSvc.withdrawVerificationRequest(
              this.content.identifier,
              this.certification.verification_request.result_type,
              this.certification.verification_request.result,
              this.certification.verification_request.document[0].document_name,
              this.certification.verification_request.verifierEmail,
              this.certification.verification_request.exam_date,
            )
          }

          return throwError('Missing parameters')
        }),
        tap(
          res => {
            this.snackbar.openFromComponent(SnackbarComponent, {
              data: {
                action: 'cert_result_withdraw',
                code: res.res_code,
              },
            })
          },
          () => {
            this.snackbar.openFromComponent(SnackbarComponent)
          },
        ),
        switchMap(() => {
          if (this.content) {
            return this.certificationApi.getCertificationInfo(this.content.identifier)
          }

          return throwError('No content.')
        }),
      )
      .subscribe(
        certification => {
          this.certification = certification
          this.resultWithdrawStatus = 'done'
          this.certificationFetchSubject.next()
        },
        () => {
          this.resultWithdrawStatus = 'error'
        },
      )
  }
}
