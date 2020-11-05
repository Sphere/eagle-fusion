import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatDialog } from '@angular/material'
import { noop } from 'rxjs'

import {
  ITrainingFilter,
  ITraining,
  ITrainingUserPrivileges,
  ITrainingConfig,
  ITrainingFilterDialogData,
} from '../../../../models/training-api.model'
import { TrainingFilterDialogComponent } from '../training-filter-dialog/training-filter-dialog.component'
import { TrainingContentService } from '../../services/training-content.service'

@Component({
  selector: 'ws-app-trainings-upcoming',
  templateUrl: './trainings-upcoming.component.html',
  styleUrls: ['./trainings-upcoming.component.scss'],
})
export class TrainingsUpcomingComponent implements OnInit {
  @Input() filterObj!: ITrainingFilter
  @Input() upcomingTrainings!: ITraining[]
  @Input() trainingPrivileges: ITrainingUserPrivileges
  @Input() trainingConfig!: ITrainingConfig
  @Output() filtersApplied: EventEmitter<ITrainingFilter>
  @Output() registered: EventEmitter<number>
  @Output() deregistered: EventEmitter<number>
  appliedFiltersCount!: number

  constructor(private dialog: MatDialog, private trainingContentSvc: TrainingContentService) {
    this.filtersApplied = new EventEmitter()
    this.registered = new EventEmitter()
    this.deregistered = new EventEmitter()
    this.trainingPrivileges = {
      canNominate: false,
      canRequestJIT: false,
    }
  }

  ngOnInit() {
    this.appliedFiltersCount = this.trainingContentSvc.getFiltersCount(this.filterObj)
  }

  onClickBtnFilter() {
    const filterDialogData: ITrainingFilterDialogData = {
      filterObj: this.filterObj,
      trainingLocations: this.trainingConfig.trainingLocations || [],
    }

    this.dialog
      .open<TrainingFilterDialogComponent, ITrainingFilterDialogData, ITrainingFilter>(
        TrainingFilterDialogComponent,
        { data: filterDialogData },
      )
      .afterClosed()
      .subscribe(newFilterObj => {
        if (newFilterObj) {
          this.filtersApplied.emit(newFilterObj)
        }
      },         noop)
  }

  onRegister(trainingId: number) {
    this.registered.emit(trainingId)
  }

  onDeregister(trainingId: number) {
    this.deregistered.emit(trainingId)
  }
}
