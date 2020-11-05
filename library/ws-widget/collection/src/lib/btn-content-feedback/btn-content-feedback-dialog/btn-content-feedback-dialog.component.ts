import { Component, OnInit, Inject } from '@angular/core'
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'
import { NsFeedback } from '../btn-content-feedback.model'
import { BtnContentFeedbackService } from '../btn-content-feedback.service'

@Component({
  selector: 'ws-widget-btn-content-feedback-dialog',
  templateUrl: './btn-content-feedback-dialog.component.html',
  styleUrls: ['./btn-content-feedback-dialog.component.scss'],
})
export class BtnContentFeedbackDialogComponent implements OnInit {

  feedbackRequest: NsFeedback.IWsFeedbackTypeRequest = this.resetFeedbackRequest()
  submitInProgress = false
  ratingLoop: number[] = []
  numbersPattern = /^[1-9]\d*/
  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; name: string },
    private dialogRef: MatDialogRef<BtnContentFeedbackDialogComponent>,
    private btnFeedbackSvc: BtnContentFeedbackService,
  ) { }

  ngOnInit() {
    this.resetFeedbackForm()
  }

  submitFeedback(request: NsFeedback.IWsFeedbackTypeRequest, successMsg: string, errorMsg: string) {
    this.submitInProgress = true
    this.btnFeedbackSvc.submitFeedback(request).subscribe(
      (_data: any) => {
        this.resetFeedbackForm()
        this.dialogRef.close()
        this.openSnackBar(successMsg)
        this.submitInProgress = false
      },
      (_err: any) => {
        this.openSnackBar(errorMsg)
        this.submitInProgress = false
      },
    )
  }
  private openSnackBar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  private resetFeedbackForm() {
    this.ratingLoop = Array(5)
    this.ratingLoop.fill(1)
    this.feedbackRequest = this.resetFeedbackRequest()
  }
  private resetFeedbackRequest() {
    return {
      contentId: this.data.id,
      feedback: [
        {
          question: 'comment of content',
          meta: 'content',
          answer: '',
        },
      ],
      feedbackSubType: 'Resource',
      feedbackType: 'content',
      rating: '5',
    }
  }

}
