import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core'
import { MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'
import { IWsLeaderMailMeta } from '../../model/leadership.model'
import { NgForm } from '@angular/forms'
import { IWsEmailTextRequest, IWsEmailResponse } from '../../model/leadership-email.model'
import { ConfigurationsService } from '@ws-widget/utils'
import { LeadershipService } from '../../services/leadership.service'

@Component({
  selector: 'ws-send-mail-dialog',
  templateUrl: './send-mail-dialog.component.html',
  styleUrls: ['./send-mail-dialog.component.scss'],
})
export class SendMailDialogComponent implements OnInit {
  mailBodyText = ''
  mailSendInProgress = false
  userEmail: string | undefined
  userName: string | undefined

  @ViewChild('successToast', { static: true }) successToast!: ElementRef<any>
  @ViewChild('errorToast', { static: true }) errorToast!: ElementRef<any>
  @ViewChild('noValidIdsToast', { static: true }) noValidIdsToast!: ElementRef<any>

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IWsLeaderMailMeta,
    private matSnackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private leadershipSvc: LeadershipService,
  ) {
    if (this.configSvc.userProfile) {
      this.userEmail = this.configSvc.userProfile.email
      this.userName = this.configSvc.userProfile.userName
    }
  }

  ngOnInit() {}

  sendMail(form: NgForm) {
    this.mailSendInProgress = true
    const req: IWsEmailTextRequest = {
      emailTo: [
        {
          email: this.data.emailTo,
        },
      ],
      sharedBy: [
        {
          email: this.userEmail ? this.userEmail : '',
          name: this.userName ? this.userName : '',
        },
      ],
      ccTo: [
        {
          email: this.userEmail ? this.userEmail : '',
          name: this.userName ? this.userName : '',
        },
      ],
      body: {
        text: this.mailBodyText,
      },
      timestamp: new Date().getTime(),
      appURL: location.host,
      subject: this.data.subject,
    }
    this.leadershipSvc.shareTextMail(req).subscribe(
      (data: IWsEmailResponse) => {
        if (data.invalidIds && data.invalidIds.length) {
          this.matSnackBar.open(this.noValidIdsToast.nativeElement.value)
          this.mailSendInProgress = false
        } else {
          form.resetForm()
          this.matSnackBar.open(this.successToast.nativeElement.value)
          this.mailSendInProgress = false
        }
      },
      () => {
        this.matSnackBar.open(this.errorToast.nativeElement.value)
        this.mailSendInProgress = false
      },
    )
  }
}
