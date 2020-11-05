import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { NgForm } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { IWsEmailTextRequest } from '../../models/co-create.model'
import { IWsCoCreatorConfig, IWsContribution } from '../../models/ocm.model'
import { OcmService } from '../../services/ocm.service'

@Component({
  selector: 'ws-app-co-create',
  templateUrl: './co-create.component.html',
  styleUrls: ['./co-create.component.scss'],
})
export class CoCreateComponent implements OnInit {
  @Input() config: IWsCoCreatorConfig = {
    title: '',
    desc: '',
    emailTo: '',
    contributionList: [],
  }

  showAnwserInput = false

  mailRequest: {
    type: string
    answer: string
  } = {
      type: '',
      answer: '',
    }
  userEmail: string | undefined
  userName: string | undefined

  fixedEmailText = ''
  submitInProgress = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>

  constructor(
    private matSnackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private ocmService: OcmService,
  ) {
    this.userEmail = ''
    this.userName = ''
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userEmail = this.configSvc.userProfile.email
      this.userName = this.configSvc.userProfile.userName
    }
  }

  sendMail(form: NgForm) {
    this.submitInProgress = true
    const req: IWsEmailTextRequest = {
      emailTo: [
        {
          email: this.config.emailTo,
        },
      ],
      sharedBy: [
        {
          name: this.userName,
          email: this.userEmail,
        },
      ],
      ccTo: [
        {
          name: this.userName,
          email: this.userEmail,
        },
      ],
      body: {
        text: `${this.fixedEmailText}.\n\n${this.mailRequest.answer}`,
      },
      timestamp: new Date().getTime(),
      appURL: location.host,
      subject: `Be a Co-Creator - '${this.mailRequest.type}`,
    }
    // //console.log.log('rrq', req)
    this.ocmService.shareTextMail(req).subscribe(
      () => {
        form.resetForm()
        this.matSnackBar.open(this.toastSuccess.nativeElement.value)
        this.submitInProgress = false
      },
      () => {
        this.matSnackBar.open(this.toastError.nativeElement.value)
        this.submitInProgress = false
      },
    )
  }
  contributionTypeClicked(data: IWsContribution) {
    this.mailRequest.type = data.name
    this.showAnwserInput = true
    this.fixedEmailText = data.emailText
  }
}
