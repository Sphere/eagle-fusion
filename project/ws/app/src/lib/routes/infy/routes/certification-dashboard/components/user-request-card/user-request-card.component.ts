import { Component, OnInit, Input } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { BehaviorSubject } from 'rxjs'
import { takeWhile, tap, switchMap } from 'rxjs/operators'

import { TSendStatus, TFetchStatus } from '@ws-widget/utils'

import {
  ICertificationRequestItem,
  TCertificationUserActionType,
  IUserActionDialogData,
} from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'
import { CertificationDashboardService } from '../../services/certification-dashboard.service'
import { CertificationApiService } from '../../../../../app-toc/routes/app-toc-certification/apis/certification-api.service'
import { FileDownloadService } from '../../../../../app-toc/routes/app-toc-certification/services/file-download.service'
import { UserActionConfirmDialogComponent } from '../user-action-confirm-dialog/user-action-confirm-dialog.component'
import { SnackbarComponent } from '../../../../../app-toc/routes/app-toc-certification/components/snackbar/snackbar.component'

@Component({
  selector: 'ws-app-user-request-card',
  templateUrl: './user-request-card.component.html',
  styleUrls: ['./user-request-card.component.scss'],
})
export class UserRequestCardComponent implements OnInit {
  @Input() requestItem!: ICertificationRequestItem
  @Input() itemSubject!: BehaviorSubject<boolean>
  sendStatus: TSendStatus
  downloadStatus: TFetchStatus

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

  ngOnInit() {}

  confirmAction(actionType: TCertificationUserActionType) {
    if (
      this.requestItem.record_type === 'budget_approval' ||
      this.requestItem.record_type === 'proctor_approval'
    ) {
      this.dialog
        .open<UserActionConfirmDialogComponent, IUserActionDialogData>(
          UserActionConfirmDialogComponent,
          { data: { actionType, approvalItem: this.requestItem } },
        )
        .afterClosed()
        .pipe(
          takeWhile(dialogResult => dialogResult && dialogResult.confirmAction),
          tap(() => {
            this.sendStatus = 'sending'
          }),
          switchMap(dialogResult =>
            this.certificationDashboardSvc.performUserRequestAction(
              this.requestItem.record_type,
              dialogResult,
            ),
          ),
        )
        .subscribe(
          () => {
            this.itemSubject.next(true)
            this.sendStatus = 'done'
          },
          () => {
            this.sendStatus = 'error'
          },
        )
    }
  }

  downloadProof() {
    if (this.requestItem.document && this.requestItem.document.length) {
      this.downloadStatus = 'fetching'
      this.certificationApi
        .getUploadedDocument(
          this.requestItem.document_url || this.requestItem.document[0].document_url,
        )
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
      this.snackbar.openFromComponent(SnackbarComponent)
    }
  }
}
