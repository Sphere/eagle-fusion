import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError, Subscription } from 'rxjs'
import { map, switchMap, tap, catchError } from 'rxjs/operators'

import { TFetchStatus, IResolveResponse } from '@ws-widget/utils'

import {
  ITrainingFilter,
  ITraining,
  ITrainingUserPrivileges,
  ITrainingConfig,
} from '../../../../models/training-api.model'
import { TrainingApiService } from '../../../../apis/training-api.service'
import { TrainingContentService } from '../../services/training-content.service'

@Component({
  selector: 'ws-app-trainings-list',
  templateUrl: './trainings-list.component.html',
  styleUrls: ['./trainings-list.component.scss'],
})
export class TrainingsListComponent implements OnInit, OnDestroy {
  trainings!: ITraining[]
  registeredTrainings!: ITraining[]
  upcomingTrainings!: ITraining[]
  filterObj!: ITrainingFilter
  trainingFetchStatus: TFetchStatus
  trainingPrivileges: ITrainingUserPrivileges
  trainingConfig?: ITrainingConfig

  trainingSub!: Subscription
  trainingConfigSub?: Subscription

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingApi: TrainingApiService,
    private trainingContentSvc: TrainingContentService,
  ) {
    this.trainingFetchStatus = 'none'
    this.trainingPrivileges = {
      canNominate: false,
      canRequestJIT: false,
    }
  }

  ngOnInit() {
    if (this.route.parent) {
      const trainingPrivilegesResolve = this.route.parent.snapshot.data
        .trainingPrivilegesResolve as IResolveResponse<ITrainingUserPrivileges>

      if (trainingPrivilegesResolve.data) {
        this.trainingPrivileges = trainingPrivilegesResolve.data
      }
    }

    this.setTrainingConfig()

    this.trainingFetchStatus = 'fetching'
    this.trainingSub = this.route.queryParams
      .pipe(
        map(params => this.trainingContentSvc.initFilterObj(params)),
        tap(filterObj => {
          this.filterObj = filterObj
        }),
        switchMap(() => of(this.route.parent)),
        switchMap(parent => {
          if (parent) {
            this.trainingFetchStatus = 'fetching'
            return parent.params
          }
          return throwError({})
        }),
        switchMap(parentParams =>
          this.trainingApi.getTrainings(parentParams['contentId'], this.filterObj),
        ),
      )
      .subscribe(
        trainings => {
          this.trainings = trainings
          this.registeredTrainings = this.trainingContentSvc.filterRegisteredTrainings(
            this.trainings,
          )
          this.upcomingTrainings = this.trainingContentSvc.filterUpcomingTrainings(
            this.trainings,
            this.filterObj,
          )
          this.trainingFetchStatus = 'done'
        },
        () => {
          this.trainingFetchStatus = 'error'
        },
      )
  }

  ngOnDestroy() {
    if (this.trainingSub && !this.trainingSub.closed) {
      this.trainingSub.unsubscribe()
    }

    if (this.trainingConfigSub && !this.trainingConfigSub.closed) {
      this.trainingConfigSub.unsubscribe()
    }
  }

  filterTrainings(newFilterObj: ITrainingFilter) {
    try {
      this.filterObj = newFilterObj

      this.router.navigate(['../trainings'], {
        queryParams: {
          ...this.filterObj.internal,
          ...this.filterObj.external,
        },
        relativeTo: this.route,
      })
    } catch (e) {
      return
    }
  }

  onRegister(trainingId: number) {
    this.trainingContentSvc.addRegisteredTraining(
      this.registeredTrainings,
      this.upcomingTrainings,
      trainingId,
    )
  }

  onDeregister(trainingId: number) {
    this.registeredTrainings = this.trainingContentSvc.removeDeregisteredTraining(
      this.registeredTrainings,
      trainingId,
    )
  }

  private setTrainingConfig() {
    this.trainingConfigSub = this.route.data
      .pipe(
        map(data => {
          return (
            (data.trainingConfigResolve as IResolveResponse<ITrainingConfig>).data || {
              trainingLocations: [],
            }
          )
        },  catchError(() => of([]))),
      )
      .subscribe(config => {
        this.trainingConfig = config
      })
  }
}
