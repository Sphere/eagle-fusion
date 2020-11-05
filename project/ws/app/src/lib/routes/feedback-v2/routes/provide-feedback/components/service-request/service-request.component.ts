import { Component, OnDestroy } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { Subscription } from 'rxjs'
import { TSendStatus } from '@ws-widget/utils'
import {
  FeedbackService,
  FeedbackSnackbarComponent,
  EFeedbackRole,
  EFeedbackType,
} from '@ws-widget/collection'

@Component({
  selector: 'ws-app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
})
export class ServiceRequestComponent implements OnDestroy {
  sendStatus: TSendStatus
  serviceRequestForm: FormGroup
  private _submitSub?: Subscription

  constructor(private feedbackSvc: FeedbackService, private snackbar: MatSnackBar) {
    this.sendStatus = 'none'

    this.serviceRequestForm = new FormGroup({
      serviceRequest: new FormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })
  }

  ngOnDestroy() {
    if (this._submitSub) {
      this._submitSub.unsubscribe()
    }
  }

  submitServiceRequest() {
    if (this.serviceRequestForm.invalid) {
      return
    }

    this.sendStatus = 'sending'
    this._submitSub = this.feedbackSvc
      .submitServiceRequest({
        text: this.serviceRequestForm.value['serviceRequest'],
        type: EFeedbackType.ServiceRequest,
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.sendStatus = 'done'
          this.serviceRequestForm.patchValue({ serviceRequest: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'service_request_submit', code: 'success' },
          })
        },
        () => {
          this.sendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'service_request_submit', code: 'failure' },
          })
        },
      )
  }
}
