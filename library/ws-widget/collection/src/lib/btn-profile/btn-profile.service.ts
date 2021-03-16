import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BtnProfileService {

  givenName = 'Guest'

  constructor() { }

  private nameSource = new BehaviorSubject(this.givenName)
  currentName = this.nameSource.asObservable()

  changeName(name: string) {
    this.nameSource.next(name)
  }

}
