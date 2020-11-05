import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core'
import { ITraining, ITrainingUserPrivileges } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-trainings-registered',
  templateUrl: './trainings-registered.component.html',
  styleUrls: ['./trainings-registered.component.scss'],
})
export class TrainingsRegisteredComponent implements OnInit {
  @Input() registeredTrainings!: ITraining[]
  @Input() trainingPrivileges: ITrainingUserPrivileges
  @Output() deregistered: EventEmitter<number>

  constructor() {
    this.deregistered = new EventEmitter()
    this.trainingPrivileges = {
      canNominate: false,
      canRequestJIT: false,
    }
  }

  ngOnInit() {}

  onDeregister(trainingId: number) {
    this.deregistered.emit(trainingId)
  }
}
