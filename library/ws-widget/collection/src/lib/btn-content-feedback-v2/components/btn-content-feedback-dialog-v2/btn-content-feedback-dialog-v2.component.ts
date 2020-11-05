import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { TSendStatus, TFetchStatus } from '@ws-widget/utils'
import { NsContent } from '../../../_services/widget-content.model'
import { FeedbackService } from '../../services/feedback.service'
import { EFeedbackType, EFeedbackRole, IFeedbackConfig } from '../../models/feedback.model'
import { FeedbackSnackbarComponent } from '../feedback-snackbar/feedback-snackbar.component'

@Component({
  selector: 'ws-widget-btn-content-feedback-dialog-v2',
  templateUrl: './btn-content-feedback-dialog-v2.component.html',
  styleUrls: ['./btn-content-feedback-dialog-v2.component.scss'],
})
export class BtnContentFeedbackDialogV2Component implements OnInit {
  positiveFeedbackSendStatus: TSendStatus
  negativeFeedbackSendStatus: TSendStatus
  singleFeedbackSendStatus: TSendStatus
  configFetchStatus: TFetchStatus
  feedbackForm: FormGroup
  singleFeedbackForm: FormGroup
  feedbackConfig!: IFeedbackConfig

  constructor(
    @Inject(MAT_DIALOG_DATA) public content: NsContent.IContent,
    private dialogRef: MatDialogRef<BtnContentFeedbackDialogV2Component>,
    private feedbackApi: FeedbackService,
    private snackbar: MatSnackBar,
  ) {
    this.positiveFeedbackSendStatus = 'none'
    this.negativeFeedbackSendStatus = 'none'
    this.singleFeedbackSendStatus = 'none'
    this.configFetchStatus = 'none'

    this.feedbackForm = new FormGroup({
      positive: new FormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
      negative: new FormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })

    this.singleFeedbackForm = new FormGroup({
      feedback: new FormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })
  }

  ngOnInit() {
    this.configFetchStatus = 'fetching'
    this.feedbackApi.getFeedbackConfig().subscribe(
      config => {
        this.feedbackConfig = config
        this.configFetchStatus = 'done'
      },
      () => {
        this.configFetchStatus = 'error'
      },
    )
  }

  submitPositiveFeedback(text: string) {
    this.positiveFeedbackSendStatus = 'sending'
    this.feedbackApi
      .submitContentFeedback({
        text,
        contentId: this.content.identifier,
        sentiment: 'positive',
        type: EFeedbackType.Content,
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.positiveFeedbackSendStatus = 'done'
          this.feedbackForm.patchValue({ positive: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'success' },
          })
          this.dialogRef.close()
        },
        () => {
          this.positiveFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'failure' },
          })
        },
      )
  }

  submitNegativeFeedback(text: string) {
    this.negativeFeedbackSendStatus = 'sending'
    this.feedbackApi
      .submitContentFeedback({
        text,
        contentId: this.content.identifier,
        sentiment: 'negative',
        type: EFeedbackType.Content,
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.negativeFeedbackSendStatus = 'done'
          this.feedbackForm.patchValue({ negative: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'success' },
          })
          this.dialogRef.close()
        },
        () => {
          this.negativeFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'failure' },
          })
        },
      )
  }

  submitSingleFeedback() {
    this.singleFeedbackSendStatus = 'sending'
    this.feedbackApi
      .submitContentFeedback({
        text: this.singleFeedbackForm.value['feedback'],
        contentId: this.content.identifier,
        role: EFeedbackRole.User,
        type: EFeedbackType.Content,
      })
      .subscribe(
        () => {
          this.singleFeedbackSendStatus = 'done'
          this.singleFeedbackForm.patchValue({ feedback: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'success' },
          })
          this.dialogRef.close()
        },
        () => {
          this.singleFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'failure' },
          })
        },
      )
  }

  submitFeedback() {
    if (this.feedbackForm.controls['positive'].valid && this.feedbackForm.value['positive']) {
      this.submitPositiveFeedback(this.feedbackForm.value['positive'])
    }

    if (this.feedbackForm.controls['negative'].valid && this.feedbackForm.value['negative']) {
      this.submitNegativeFeedback(this.feedbackForm.value['negative'])
    }
  }
}
