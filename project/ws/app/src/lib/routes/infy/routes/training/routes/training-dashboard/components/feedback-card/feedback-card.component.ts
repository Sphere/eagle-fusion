import { Component, OnInit, Input } from '@angular/core'
import { IFeedbackTraining } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-feedback-card',
  templateUrl: './feedback-card.component.html',
  styleUrls: ['./feedback-card.component.scss'],
})
export class FeedbackCardComponent implements OnInit {
  @Input() training!: IFeedbackTraining

  constructor() {}

  ngOnInit() {}
}
