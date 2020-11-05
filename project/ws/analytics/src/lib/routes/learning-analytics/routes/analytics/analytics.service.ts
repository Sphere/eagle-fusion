import { Injectable, Type } from '@angular/core'
import { ClientAnalyticsComponent } from '../../components/client-analytics/client-analytics.component'

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  constructor() { }

  getComponent(): Type<any> {
    return ClientAnalyticsComponent
  }
}
