import { NotificationService } from '@ws/author/src/lib/services/notification.service'
import { ErrorParserComponent } from './../error-parser/error-parser.component'
import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ApiService } from '@ws/author/src/lib/modules/shared/services/api.service'
import { EXPIRY_DATE_ACTION } from '../../../../constants/apiEndpoints'
import { MatDialog, MatSnackBar } from '@angular/material'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { mergeMap, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

@Component({
  selector: 'ws-auth-expiry-date-confirm',
  templateUrl: './auth-expiry-date-confirm.component.html',
  styleUrls: ['./auth-expiry-date-confirm.component.scss'],
})
export class AuthExpiryDateConfirmComponent implements OnInit {
  userActionForm!: FormGroup
  isSubmitPressed = false
  minDate = new Date()
  onAction = false
  isMobile = false

  constructor(
    private accessService: AccessControlService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AuthExpiryDateConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISearchContent,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private apiService: ApiService,
    private valueSvc: ValueService,
    private notificationSvc: NotificationService,
  ) { }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.minDate = this.accessService.convertToISODate(this.data.expiryDate)
    this.userActionForm = this.formBuilder.group({
      comments: ['', Validators.required],
      action: [false, Validators.required],
      isExtend: [false],
      expiryDate: [this.minDate],
    })
  }

  get showError() {
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.userActionForm.get('isExtend')!.value === true &&
      // tslint:disable-next-line: no-non-null-assertion
      this.userActionForm.get('expiryDate')!.value === this.minDate
    ) {
      return true
    }
    return false
  }

  submitData() {
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.userActionForm.get('comments')!.value &&
      // tslint:disable-next-line: no-non-null-assertion
      ((!this.userActionForm.get('isExtend')!.value && this.userActionForm.get('action')!.value) ||
        // tslint:disable-next-line: no-non-null-assertion
        (this.userActionForm.get('isExtend')!.value &&
          // tslint:disable-next-line: no-non-null-assertion
          this.userActionForm.get('expiryDate')!.value !== this.minDate))
    ) {
      this.extendOrExpiry()
    } else {
      this.isSubmitPressed = true
      this.userActionForm.controls['expiryDate'].markAsTouched()
    }
  }

  extendOrExpiry() {
    this.onAction = true
    this.apiService
      .post<null>(EXPIRY_DATE_ACTION, {
        expiryDate: this.accessService.convertToESDate(
          // tslint:disable-next-line: no-non-null-assertion
          this.userActionForm.get('expiryDate')!.value,
        ),
        // tslint:disable-next-line: no-non-null-assertion
        isExtend: this.userActionForm.get('isExtend')!.value,
        // tslint:disable-next-line: no-non-null-assertion
        comment: this.userActionForm.get('comments')!.value,
        identifier: this.data.identifier,
        org: this.accessService.org,
        rootOrg: this.accessService.rootOrg || '',
        // tslint:disable-next-line: no-non-null-assertion
        action: this.userActionForm.get('isExtend')!.value ? 'extended' : 'markedForDeletion',
        actorName: this.accessService.userName,
        actor: this.accessService.userId,
      }).pipe(
        mergeMap(() =>
          // tslint:disable-next-line: no-non-null-assertion
          this.userActionForm.get('isExtend')!.value ?
            of({}) :
            this.notificationSvc
              .markForDeletion(
                this.data as any,
                // tslint:disable-next-line: no-non-null-assertion
                this.userActionForm.get('comments')!.value,
              )
              .pipe(
                catchError(() => {
                  return of({} as any)
                }),
              ),
        ),
      )
      .subscribe(
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
