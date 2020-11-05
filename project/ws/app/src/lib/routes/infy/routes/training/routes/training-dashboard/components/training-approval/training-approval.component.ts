import { Component, OnInit } from '@angular/core'
import { TrainingApiService } from '../../../../apis/training-api.service'
import { ITrainingRequest } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-training-approval',
  templateUrl: './training-approval.component.html',
  styleUrls: ['./training-approval.component.scss'],
})
export class TrainingApprovalComponent implements OnInit {
  trainingRequests!: ITrainingRequest[]
  fetchStatus: 'fetching' | 'done' = 'fetching'

  constructor(private trainingApi: TrainingApiService) {}

  ngOnInit() {
    this.trainingApi.getPendingTrainingRequests().subscribe(
      requests => {
        this.trainingRequests = requests
        this.fetchStatus = 'done'
      },
      () => {
        this.trainingRequests = []
        this.fetchStatus = 'done'
      },
    )
  }

  onTrainingRejected(offeringId: string) {
    this.trainingRequests = this.trainingRequests.filter(
      request => request.offering_id !== offeringId,
    )
  }
}
