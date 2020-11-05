import { Component, OnInit, Inject } from '@angular/core'
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { WidgetContentShareService } from '../../_services/widget-content-share.service'
import { IBtnMailUser } from '../btn-mail-user.component'
import { EventService } from '@ws-widget/utils'

@Component({
  selector: 'ws-widget-btn-mail-user-dialog',
  templateUrl: './btn-mail-user-dialog.component.html',
  styleUrls: ['./btn-mail-user-dialog.component.scss'],
})
export class BtnMailUserDialogComponent implements OnInit {

  mailSendInProgress = false
  sendStatus: 'SUCCESS' | 'INVALID_ID' | undefined
  constructor(
    public snackBar: MatSnackBar,
    private events: EventService,
    private shareSvc: WidgetContentShareService,
    public dialogRef: MatDialogRef<BtnMailUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: IBtnMailUser,
  ) { }

  ngOnInit() {
  }

  send(txtBody: string, successMsg: string, errorToast: string, invalidIdToast: string) {
    this.mailSendInProgress = true
    this.raiseTelemetry()
    this.shareSvc
      .shareContent(
        this.data.content,
        this.data.emails.map(u => ({ email: u })),
        txtBody,
        'query',
      )
      .subscribe(
        data => {
          this.mailSendInProgress = false
          if (data.response === 'Request Accepted!' && (!data.invalidIds || data.invalidIds.length === 0)) {
            this.sendStatus = 'SUCCESS'
            this.snackBar.open(
              successMsg,
            )
            this.dialogRef.close()
          } else if (data.invalidIds && data.invalidIds.length) {
            this.sendStatus = 'INVALID_ID'
            this.snackBar.open(invalidIdToast)
          }
        },
        () => {
          this.mailSendInProgress = false
          this.snackBar.open(
            errorToast,
          )
        })
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry(
      'email',
      'emailSME',
      {
        contentId: this.data.content.identifier,
        emails: this.data.emails,
      },
    )
  }
}
