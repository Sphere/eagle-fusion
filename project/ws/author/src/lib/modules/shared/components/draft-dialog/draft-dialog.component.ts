import { NotificationService } from '@ws/author/src/lib/services/notification.service'
import { ErrorParserComponent } from './../error-parser/error-parser.component'
import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { UNPUBLISH, STATUS_CHANGE } from '@ws/author/src/lib/constants/apiEndpoints'
import { MatDialog, MatSnackBar } from '@angular/material'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { HttpHeaders } from '@angular/common/http'
import { mergeMap, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

@Component({
  selector: 'ws-auth-draft-dialog',
  templateUrl: './draft-dialog.component.html',
  styleUrls: ['./draft-dialog.component.scss'],
})
export class DraftDialogComponent implements OnInit {
  commentsForm!: FormGroup
  contentMeta!: ISearchContent
  isSubmitPressed = false
  onAction = false
  children = 0
  isNew = 'No'
  isMobile = false
  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<DraftDialogComponent>,
    private accessService: AccessControlService,
    @Inject(MAT_DIALOG_DATA) public data: ISearchContent,
    private apiService: ApiService,
    private valueSvc: ValueService,
    private notificationSvc: NotificationService,
  ) {
    dialogRef.disableClose = true
  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.contentMeta = this.data
    this.children = this.contentMeta.children ? this.contentMeta.children.length : 0
    this.isNew = !(
      this.contentMeta.identifier.includes('.img') || this.contentMeta.status === 'Live'
    )
      ? 'Yes'
      : 'No'
    this.commentsForm = this.formBuilder.group({
      comments: ['', [Validators.required]],
      action: ['', [Validators.required]],
    })
  }

  submitData() {
    if (this.commentsForm.valid && this.commentsForm.value.action) {
      this.unpublish()
    } else {
      this.isSubmitPressed = true
    }
  }

  unpublish() {
    this.onAction = true
    const observable =
      this.contentMeta.status !== 'Unpublished'
        ? this.apiService.post<null>(STATUS_CHANGE + this.contentMeta.identifier, {
          actor: this.accessService.userId,
          org: this.accessService.org,
          rootOrg: this.accessService.rootOrg || '',
          appName: this.accessService.appName,
          appUrl: window.location.origin,
          isAdmin: this.accessService.hasRole(['editor', 'admin']),
          actorName: this.accessService.userName,
          action: 'pulledBack',
          comment: this.commentsForm.value.comments,
          operation: 0,
        })
        : this.apiService.post<any>(
          `${UNPUBLISH}${this.accessService.orgRootOrgAsQuery}`,
          {
            unpublish: false,
            identifier: this.contentMeta.identifier,
            author: this.accessService.userId,
            isAdmin: this.accessService.hasRole(['editor', 'admin']),
            actorName: this.accessService.userName,
            action: 'retrieved',
            comment: this.commentsForm.value.comments,
          },
          true,
          {
            headers: new HttpHeaders({
              Accept: 'text/plain',
            }),
            responseType: 'text',
          },
        )
    observable.pipe(
      mergeMap(() =>
        this.notificationSvc
          .moveToDraft(
            this.contentMeta as any,
            this.commentsForm.value.comments,
          )
          .pipe(
            catchError(() => {
              return of({} as any)
            }),
          ),
      ),
    ).subscribe(
      () => {
        this.dialogRef.close(true)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
      error => {
        this.onAction = false
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: this.isMobile ? '90vw' : '600px',
            height: 'auto',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }
}
