import { Injectable, Type } from '@angular/core'
import { ConfigurationsService } from '@ws-widget/utils'
import { AppTocCohortsComponent } from '../../components/app-toc-cohorts/app-toc-cohorts.component'

@Injectable({
  providedIn: 'root',
})
export class AppTocCohortsService {

  constructor(
    private configSvc: ConfigurationsService,
  ) { }

  getComponent(): Type<any> {
    switch (this.configSvc.rootOrg) {
      default:
        return AppTocCohortsComponent
    }
  }
}
