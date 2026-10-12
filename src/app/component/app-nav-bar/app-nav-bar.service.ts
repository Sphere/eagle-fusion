import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class appNavBarService {

  initial = ''
  private readonly navOption = new BehaviorSubject(this.initial)
  currentOption = this.navOption.asObservable()

  changeNavBarActive(name: string) {
    this.navOption.next(name)
  }

}
