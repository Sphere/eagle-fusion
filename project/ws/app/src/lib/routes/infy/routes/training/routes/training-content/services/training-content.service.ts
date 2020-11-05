import { Injectable } from '@angular/core'
import { Params } from '@angular/router'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import {
  ITrainingFilter,
  ITraining,
  ITrainingApiResponse,
} from '../../../models/training-api.model'
import { TrainingApiService } from '../../../apis/training-api.service'

@Injectable()
export class TrainingContentService {
  constructor(private trainingApi: TrainingApiService) {}

  initFilterObj(queryParams: Params): ITrainingFilter {
    const fromDate =
      queryParams['fromDate'] && !isNaN(new Date(queryParams['fromDate']).getTime())
        ? new Date(`${queryParams['fromDate']}`)
        : new Date()
    const toDate =
      queryParams['toDate'] && !isNaN(new Date(queryParams['toDate']).getTime())
        ? new Date(`${queryParams['toDate']}`)
        : new Date(fromDate.getFullYear(), fromDate.getMonth() + 6, fromDate.getDate())

    const filterObj: ITrainingFilter = {
      external: {
        fromDate,
        toDate,
        location: queryParams['location'] ? queryParams['location'] : undefined,
      },
      internal: {
        assessmentOnly: queryParams['assessmentOnly'] === 'true',
        seatsAvailableOnly: queryParams['seatsAvailableOnly'] === 'true',
        eligibleOnly: queryParams['eligibleOnly'] === 'true',
      },
    }

    return filterObj
  }

  getFiltersCount(filterObj: ITrainingFilter): number {
    try {
      let filtersCount = 0

      if (filterObj.external.fromDate && filterObj.external.toDate) {
        filtersCount += 2
      }

      if (filterObj.external.location) {
        filtersCount += 1
      }

      if (filterObj.internal.assessmentOnly) {
        filtersCount += 1
      }

      if (filterObj.internal.eligibleOnly) {
        filtersCount += 1
      }

      if (filterObj.internal.seatsAvailableOnly) {
        filtersCount += 1
      }

      return filtersCount
    } catch (e) {
      return 0
    }
  }

  filterRegisteredTrainings(trainings: ITraining[]): ITraining[] {
    try {
      return trainings.filter(training => training.registered)
    } catch (e) {
      return []
    }
  }

  filterUpcomingTrainings(trainings: ITraining[], filterObj: ITrainingFilter): ITraining[] {
    try {
      let upcomingTrainings = trainings.filter(() => true)

      if (filterObj.internal.assessmentOnly) {
        upcomingTrainings = upcomingTrainings.filter(training => training.hasAssessment)
      }

      if (filterObj.internal.eligibleOnly) {
        upcomingTrainings = upcomingTrainings.filter(training => training.eligible)
      }

      if (filterObj.internal.seatsAvailableOnly) {
        upcomingTrainings = upcomingTrainings.filter(training => training.slots_available > 0)
      }

      return upcomingTrainings
    } catch (e) {
      return trainings
    }
  }

  registerForTraining(training: ITraining): Observable<ITrainingApiResponse> {
    return this.trainingApi.registerForTraining(training.offering_id).pipe(
      tap(res => {
        if (res.res_code === 1) {
          training.slots_available -= 1
          training.registered = true
        }
      }),
    )
  }

  deregisterFromTraining(training: ITraining): Observable<ITrainingApiResponse> {
    return this.trainingApi.deregisterFromTraining(training.offering_id).pipe(
      tap(res => {
        if (res.res_code === 1) {
          training.slots_available += 1
          training.registered = false
        }
      }),
    )
  }

  addRegisteredTraining(
    registeredTrainings: ITraining[],
    upcomingTrainings: ITraining[],
    trainingId: number,
  ) {
    try {
      const training = upcomingTrainings.find(item => item.offering_id === trainingId)
      if (training) {
        registeredTrainings.push(training)
      }
    } catch (e) {}
  }

  removeDeregisteredTraining(registeredTrainings: ITraining[], trainingId: number): ITraining[] {
    try {
      const newTrainings = registeredTrainings.filter(
        training => training.offering_id !== trainingId,
      )

      return newTrainings
    } catch (e) {
      return registeredTrainings
    }
  }
}
