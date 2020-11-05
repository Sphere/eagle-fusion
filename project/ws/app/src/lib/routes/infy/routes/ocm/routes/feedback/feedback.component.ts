import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NgForm } from '@angular/forms'
import { IWsFeedbackConfig } from '../../models/ocm.model'
import { IWsFeedbackTypeRequest } from '../../models/feedback.model'
import { OcmService } from '../../services/ocm.service'

@Component({
  selector: 'ws-app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  @Input() config: IWsFeedbackConfig = {
    title: '',
  }
  ratingLoop: number[] = []
  numbersPattern = /^[1-9]\d*/
  feedbackRequest: IWsFeedbackTypeRequest = {
    contentId: null,
    feedbackSubType: null,
    rating: '',
    feedback: [
      {
        question: '',
        meta: '',
        answer: '',
      },
    ],
    feedbackType: '',
  }
  submitInProgress = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  constructor(private ocmService: OcmService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.resetForm()
  }
  resetForm() {
    this.ratingLoop = [0, 0, 0, 0, 0]
    this.ratingLoop.fill(1)
    this.feedbackRequest = {
      contentId: null,
      feedbackSubType: null,
      rating: '',
      feedback: [
        {
          question: 'Provide your suggestion',
          meta: 'ocm',
          answer: '',
        },
      ],
      feedbackType: 'ocm',
    }
  }
  submitFeedback(feedbackRequest: IWsFeedbackTypeRequest, feedbackForm: NgForm) {
    this.submitInProgress = true
    this.ocmService.submitFeedback(feedbackRequest).subscribe(
      () => {
        this.resetForm()
        feedbackForm.resetForm()
        this.submitInProgress = false
        this.snackBar.open(this.toastSuccess.nativeElement.value)
      },
      () => {
        this.snackBar.open(this.toastError.nativeElement.value)
        this.submitInProgress = false
      },
    )
  }
}
