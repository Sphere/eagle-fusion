import { ReplaySubject } from 'rxjs'
import { Injectable } from '@angular/core'

@Injectable()
export class AuthNavBarToggleService {

  private _isVisible = true
  toggleNavBar = new ReplaySubject<boolean>()
  constructor() { }

  set isVisible(visible: boolean) {
    this._isVisible = visible
  }

  get isVisible() {
    return this._isVisible
  }

  toggle(visible: boolean) {
    this.isVisible = visible
    this.toggleNavBar.next(this.isVisible)
  }
}
