import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { switchMap } from 'rxjs/operators'
import { throwError, of } from 'rxjs'
import { TFetchStatus, TSendStatus } from '@ws-widget/utils'
import {
  ITrainingFeedbackQuestion,
  ITrainingFeedbackAnswer,
} from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'

@Component({
  selector: 'ws-app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
})
export class FeedbackFormComponent implements OnInit {
  feedbackType!: string
  trainingId!: string
  formId!: string
  formData!: ITrainingFeedbackQuestion[]
  feedback: {
    question: ITrainingFeedbackQuestion;
    answer: ITrainingFeedbackAnswer;
  }[] = []
  submitStatus: TSendStatus
  formFetchStatus: TFetchStatus

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingApi: TrainingApiService,
  ) {
    this.submitStatus = 'none'
    this.formFetchStatus = 'none'
  }

  ngOnInit() {
    this.formFetchStatus = 'fetching'

    this.formId = this.route.snapshot.queryParamMap.get('form') || ''
    if (!this.formId) {
      this.router.navigate(['../../'], {
        relativeTo: this.route,
      })
    }

    this.feedbackType = this.route.snapshot.paramMap.get('feedbackType') || ''
    this.trainingId = this.route.snapshot.paramMap.get('trainingId') || ''

    this.trainingApi
      .getTrainingFeedbackForm(this.formId)
      .pipe(
        switchMap(form => {
          if (!form || !form.length) {
            return throwError(form)
          }

          return of(form)
        }),
      )
      .subscribe(
        questions => {
          questions.forEach(question => {
            this.feedback.push({
              question: { ...question },
              answer: {
                question_id: question.question_id,
                type: question.type,
              },
            })
          })

          this.formFetchStatus = 'done'
        },
        () => {
          this.formFetchStatus = 'error'
        },
      )
  }

  onBtnSubmitClick() {
    let valid = true
    const feedbackAnswers: ITrainingFeedbackAnswer[] = []

    for (const feedbackItem of this.feedback) {
      const answer = feedbackItem.answer

      if (
        ((answer.type === 'rating' || answer.type === 'bool') && !answer.rating) ||
        ((answer.type === 'rating' || answer.type === 'bool') &&
          (answer.rating && answer.rating < 3) &&
          !answer.rating_reason) ||
        (answer.type === 'text' && !answer.rating_reason)
      ) {
        valid = false
        break
      }

      feedbackAnswers.push({
        ...answer,
        rating: answer.rating ? +answer.rating : 0,
        rating_reason: answer.rating_reason ? answer.rating_reason : '',
      })
    }

    if (valid) {
      this.submitStatus = 'sending'
      this.trainingApi
        .submitTrainingFeedback(this.trainingId, this.formId, feedbackAnswers)
        .subscribe(
          () => {
            this.submitStatus = 'done'
            this.router.navigate(['../'], {
              relativeTo: this.route,
            })
          },
          () => {
            this.submitStatus = 'error'
          },
        )
    }
  }
}
