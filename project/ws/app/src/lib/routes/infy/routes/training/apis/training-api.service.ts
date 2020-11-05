import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { NsAutoComplete } from '@ws-widget/collection'

import {
  ITrainingCounts,
  ITraining,
  ITrainingSession,
  ITrainingApiResponse,
  ITrainingUserPrivileges,
  IJITForm,
  IJITRequest,
  ITrainingRequest,
  ITrainingRejection,
  IFeedbackTraining,
  ITrainingFeedbackQuestion,
  ITrainingFeedbackAnswer,
  ITrainingLocation,
  ITrainingFilter,
  IContentWatchlistStatus,
} from '../models/training-api.model'
import { IScheduleObj, IScheduleDataResponse } from '../models/training-schedules.model'

@Injectable({
  providedIn: 'root',
})
export class TrainingApiService {
  private readonly TRAINING_BASE = '/apis/protected/v8/training'
  private readonly PROXIES_SLAG_V8 = `/apis/proxies/v8`

  constructor(private http: HttpClient) { }

  getTrainingCount(contentId: string): Observable<number> {
    return this.http
      .get<ITrainingCounts>(`${this.TRAINING_BASE}/content/${contentId}/trainings/count`)
      .pipe(
        map(countsObj => countsObj[contentId]),
        catchError(() => of(0)),
      )
  }

  getTrainingCountsMultiple(contentIds: string[]): Observable<ITrainingCounts> {
    return this.http
      .post<ITrainingCounts>(`${this.TRAINING_BASE}/count`, {
        identifiers: contentIds,
      })
      .pipe(catchError(() => of({})))
  }

  getTrainings(contentId: string, filterObj: ITrainingFilter): Observable<ITraining[]> {
    const fromDate = filterObj.external.fromDate.toString()
    const toDate = filterObj.external.toDate.toString()
    const location = filterObj.external.location

    let url = `${this.TRAINING_BASE}/content/${contentId}/trainings?fromDate=${fromDate}&toDate=${toDate}`

    if (location) {
      url += `&location=${location}`
    }

    return this.http.get<ITraining[]>(url)
  }

  getTrainingSessions(trainingId: string): Observable<ITrainingSession[]> {
    return this.http.get<ITrainingSession[]>(
      `${this.TRAINING_BASE}/trainings/${trainingId}/sessions`,
    )
  }

  registerForTraining(trainingId: number): Observable<ITrainingApiResponse> {
    return this.http.post<ITrainingApiResponse>(`${this.TRAINING_BASE}/${trainingId}`, {})
  }

  deregisterFromTraining(trainingId: number): Observable<ITrainingApiResponse> {
    return this.http.delete<ITrainingApiResponse>(`${this.TRAINING_BASE}/${trainingId}`)
  }

  addToWatchlist(contentId: string): Observable<ITrainingApiResponse> {
    return this.http.post<ITrainingApiResponse>(
      `${this.TRAINING_BASE}/watchlist/content/${contentId}`,
      {},
    )
  }

  removeFromWatchlist(contentId: string): Observable<ITrainingApiResponse> {
    return this.http.delete<ITrainingApiResponse>(
      `${this.TRAINING_BASE}/watchlist/content/${contentId}`,
    )
  }

  getWatchlist(): Observable<string[]> {
    return this.http.get<string[]>(`${this.TRAINING_BASE}/watchlist`)
  }

  isContentInWatchlist(contentId: string) {
    return this.http.get<IContentWatchlistStatus>(
      `${this.TRAINING_BASE}/watchlist/content/${contentId}/status`,
    )
  }

  getUserTrainingPrivileges(): Observable<ITrainingUserPrivileges> {
    return this.http.get<ITrainingUserPrivileges>(`${this.TRAINING_BASE}/userInfo`).pipe(
      catchError(() => {
        const fallbackResponse: ITrainingUserPrivileges = {
          canNominate: false,
          canRequestJIT: false,
        }

        return of(fallbackResponse)
      }),
    )
  }

  nominateUsers(
    trainingId: number,
    nominees: NsAutoComplete.IUserAutoComplete[],
  ): Observable<ITrainingApiResponse[]> {
    return this.http.post<ITrainingApiResponse[]>(`${this.TRAINING_BASE}/${trainingId}/nominees`, {
      nominees,
    })
  }

  sendJITRequest(jitForm: IJITForm) {
    return this.http.post(`${this.TRAINING_BASE}/trainings/jit`, jitForm)
  }

  getJITRequests(): Observable<IJITRequest[]> {
    return this.http.get<IJITRequest[]>(`${this.TRAINING_BASE}/trainings/jit`)
  }

  getPendingTrainingRequests(): Observable<ITrainingRequest[]> {
    return this.http.get<ITrainingRequest[]>(`${this.TRAINING_BASE}/trainingsForApproval`)
  }

  rejectTrainingRequest(
    rejection: ITrainingRejection,
    trainingId: string,
  ): Observable<ITrainingApiResponse> {
    return this.http.patch<ITrainingApiResponse>(`${this.TRAINING_BASE}/${trainingId}`, rejection)
  }

  shareTraining(
    trainingId: number,
    users: NsAutoComplete.IUserAutoComplete[],
  ): Observable<ITrainingApiResponse> {
    return this.http.post<ITrainingApiResponse>(`${this.TRAINING_BASE}/${trainingId}/share`, {
      users,
    })
  }

  getTrainingsForFeedback(): Observable<IFeedbackTraining[]> {
    return this.http.get<IFeedbackTraining[]>(`${this.TRAINING_BASE}/trainings/feedback`)
  }

  getTrainingFeedbackForm(formId: string): Observable<ITrainingFeedbackQuestion[]> {
    return this.http.get<ITrainingFeedbackQuestion[]>(`${this.TRAINING_BASE}/feedback/${formId}`)
  }

  submitTrainingFeedback(
    trainingId: string,
    formId: string,
    answers: ITrainingFeedbackAnswer[],
  ): Observable<any> {
    return this.http.post(
      `${this.TRAINING_BASE}/trainings/${trainingId}/feedback?formId=${formId}`,
      answers,
    )
  }

  // GET hardcoded values

  getTrainingLocations(): Observable<ITrainingLocation[]> {
    return this.http.get<ITrainingLocation[]>(`${this.TRAINING_BASE}/training_locations.json`)
  }

  getTrainingTracks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.TRAINING_BASE}/training_tracks.json`).pipe(
      map(tracks => {
        return tracks.filter(track => track.flgJIT)
      }),
      catchError(() => []),
    )
  }

  // LA Training schedule api
  public getSchedule(dateObj: IScheduleObj): Observable<IScheduleDataResponse> {
    try {
      const startDate = dateObj.startDate
      const endDate = dateObj.endDate
      const location = dateObj.location
      const search = dateObj.search
      let url = ''
      if (dateObj.location) {
        if (dateObj.search) {
          // tslint:disable-next-line:max-line-length
          url = `${this.PROXIES_SLAG_V8}/LA/coschedules/api/CourseOfferingSchedules?aggsSize=1000&endDate=${endDate}&startDate=${startDate}&from=0&refinementfilter='location':'${location}'&searchquery=${search}`
        } else {
          // tslint:disable-next-line:max-line-length
          url = `${this.PROXIES_SLAG_V8}/LA/coschedules/api/CourseOfferingSchedules?aggsSize=1000&endDate=${endDate}&startDate=${startDate}&from=0&refinementfilter='location':'${location}'`
        }
      } else {
        if (dateObj.search) {
          // tslint:disable-next-line:max-line-length
          url = `${this.PROXIES_SLAG_V8}/LA/coschedules/api/CourseOfferingSchedules?aggsSize=1000&endDate=${endDate}&startDate=${startDate}&from=0&searchquery=${search}`
        } else {
          // tslint:disable-next-line:max-line-length
          url = `${this.PROXIES_SLAG_V8}/LA/coschedules/api/CourseOfferingSchedules?aggsSize=1000&endDate=${endDate}&startDate=${startDate}&from=0`
        }
      }
      return this.http.get<IScheduleDataResponse>(url)
    } catch (e) {
      return e.message
    }
  }
}
