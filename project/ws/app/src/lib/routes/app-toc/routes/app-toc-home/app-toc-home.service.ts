import { Injectable, Type } from '@angular/core'
import { AppTocHomePageComponent } from '../../components/app-toc-home-page/app-toc-home-page.component'
// import { AppTocHomeComponent } from '../../components/app-toc-home/app-toc-home.component'

@Injectable({
  providedIn: 'root',
})
export class AppTocHomeService {

  constructor(
  ) { }

  getComponent(): Type<any> {
    // return AppTocHomeComponent
    return AppTocHomePageComponent
  }
}
