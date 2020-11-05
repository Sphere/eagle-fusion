import { Injectable, Type } from '@angular/core'
import { AppTocOverviewComponent } from '../../components/app-toc-overview/app-toc-overview.component'

@Injectable({
  providedIn: 'root',
})
export class AppTocOverviewService {

  constructor(
  ) { }

  getComponent(): Type<any> {
    return AppTocOverviewComponent
  }
}
