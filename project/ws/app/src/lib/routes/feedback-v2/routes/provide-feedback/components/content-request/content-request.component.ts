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
  selector: 'ws-app-content-request',
  templateUrl: './content-request.component.html',
  styleUrls: ['./content-request.component.scss'],
})
export class ContentRequestComponent implements OnDestroy {
  sendStatus: TSendStatus
  contentRequestForm: FormGroup
  private _submitSub?: Subscription

  constructor(private feedbackSvc: FeedbackService, private snackbar: MatSnackBar) {
    this.sendStatus = 'none'

    this.contentRequestForm = new FormGroup({
      contentRequest: new FormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })
  }

  ngOnDestroy() {
    if (this._submitSub) {
      this._submitSub.unsubscribe()
    }
  }

  submitContentRequest() {
    if (this.contentRequestForm.invalid) {
      return
    }

    this.sendStatus = 'sending'
    this._submitSub = this.feedbackSvc
      .submitContentRequest({
        text: this.contentRequestForm.value['contentRequest'],
        type: EFeedbackType.ContentRequest,
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.sendStatus = 'done'
          this.contentRequestForm.patchValue({ contentRequest: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_request_submit', code: 'success' },
          })
        },
        () => {
          this.sendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_request_submit', code: 'failure' },
          })
        },
      )
  }
}
