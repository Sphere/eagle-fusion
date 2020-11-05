import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

import { IResolveResponse } from '@ws-widget/utils'
import { IFeedbackConfig, FeedbackService } from '@ws-widget/collection'

@Injectable()
export class FeedbackConfigResolver implements Resolve<IResolveResponse<IFeedbackConfig>> {
  constructor(private feedbackApi: FeedbackService) {}

  resolve(): Observable<IResolveResponse<IFeedbackConfig>> {
    try {
      return this.feedbackApi.getFeedbackConfig().pipe(
        map(config => {
          return {
            data: config,
            error: null,
          }
        }),
        catchError(() => {
          const result: IResolveResponse<IFeedbackConfig> = {
            data: null,
            error: 'FEEDBACK_CONFIG_API_ERROR',
          }

          return of(result)
        }),
      )
    } catch (err) {
      const result: IResolveResponse<IFeedbackConfig> = {
        data: null,
        error: 'FEEDBACK_CONFIG_RESOLVER_ERROR',
      }
      return of(result)
    }
  }
}
