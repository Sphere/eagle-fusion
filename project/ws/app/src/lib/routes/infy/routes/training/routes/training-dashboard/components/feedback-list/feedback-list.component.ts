import { Component, OnInit } from '@angular/core'
import { IFeedbackTraining } from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'
import { TFetchStatus } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-feedback-list',
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.scss'],
})
export class FeedbackListComponent implements OnInit {
  trainings!: IFeedbackTraining[]
  fetchStatus: TFetchStatus

  constructor(private trainingApi: TrainingApiService) {
    this.fetchStatus = 'none'
  }

  ngOnInit() {
    this.fetchStatus = 'fetching'
    this.trainingApi.getTrainingsForFeedback().subscribe(
      feedbackTrainings => {
        this.trainings = feedbackTrainings
        this.fetchStatus = 'done'
      },
      () => {
        this.fetchStatus = 'error'
      },
    )
  }
}
