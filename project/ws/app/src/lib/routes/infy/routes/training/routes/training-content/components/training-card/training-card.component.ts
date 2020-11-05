import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog } from '@angular/material'

import { TSendStatus } from '@ws-widget/utils'

import { ITraining, ITrainingUserPrivileges } from '../../../../models/training-api.model'
import { TrainingContentService } from '../../services/training-content.service'
import { TrainingShareDialogComponent } from '../training-share-dialog/training-share-dialog.component'
import { TrainingNominateDialogComponent } from '../training-nominate-dialog/training-nominate-dialog.component'

@Component({
  selector: 'ws-app-training-card',
  templateUrl: './training-card.component.html',
  styleUrls: ['./training-card.component.scss'],
})
export class TrainingCardComponent implements OnInit {
  @Input() training!: ITraining
  @Input() trainingPrivileges: ITrainingUserPrivileges
  @Output() registered: EventEmitter<number>
  @Output() deregistered: EventEmitter<number>

  registerStatus: TSendStatus
  deregisterStatus: TSendStatus
  trainingShareStatus: TSendStatus

  constructor(private dialog: MatDialog, private trainingContentSvc: TrainingContentService) {
    this.registerStatus = 'none'
    this.deregisterStatus = 'none'
    this.trainingShareStatus = 'none'
    this.registered = new EventEmitter()
    this.deregistered = new EventEmitter()
    this.trainingPrivileges = {
      canNominate: false,
      canRequestJIT: false,
    }
  }

  ngOnInit() {}

  onClickBtnRegister() {
    try {
      this.registerStatus = 'sending'
      this.trainingContentSvc.registerForTraining(this.training).subscribe(
        () => {
          this.registerStatus = 'done'
          this.registered.emit(this.training.offering_id)
        },
        () => {
          this.registerStatus = 'error'
        },
      )
    } catch (e) {
      return
    }
  }

  onClickBtnDeregister() {
    try {
      this.deregisterStatus = 'sending'
      this.trainingContentSvc.deregisterFromTraining(this.training).subscribe(
        () => {
          this.deregisterStatus = 'done'
          this.deregistered.emit(this.training.offering_id)
        },
        () => {
          this.deregisterStatus = 'error'
        },
      )
    } catch (e) {
      return
    }
  }

  onClickBtnShare() {
    this.dialog.open<TrainingShareDialogComponent, ITraining>(TrainingShareDialogComponent, {
      data: this.training,
      minWidth: '320px',
    })
  }

  onClickBtnNominate() {
    this.dialog.open<TrainingNominateDialogComponent, ITraining>(TrainingNominateDialogComponent, {
      data: this.training,
      minWidth: '320px',
    })
  }

  extractIneligibilityReasons() {
    this.training.ineligibilityReasons = this.training.reason_not_eligible.split(',')
  }
}
