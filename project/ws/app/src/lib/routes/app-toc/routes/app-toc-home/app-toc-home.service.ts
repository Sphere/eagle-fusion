import { Injectable, Type } from '@angular/core'
import { AppTocHomeComponent } from '../../components/app-toc-home/app-toc-home.component'

@Injectable({
  providedIn: 'root',
})
export class AppTocHomeService {

  constructor(
  ) { }

  getComponent(): Type<any> {
    return AppTocHomeComponent
  }
}
