import { Component, OnInit, Input } from '@angular/core'
import { ETrainingType } from '../../models/training.model'

@Component({
  selector: 'ws-app-training-type',
  templateUrl: './training-type.component.html',
  styleUrls: ['./training-type.component.scss'],
})
export class TrainingTypeComponent implements OnInit {
  @Input() trainingType!: ETrainingType
  trainingTypes: typeof ETrainingType

  constructor() {
    this.trainingTypes = ETrainingType
  }

  ngOnInit() {}
}
