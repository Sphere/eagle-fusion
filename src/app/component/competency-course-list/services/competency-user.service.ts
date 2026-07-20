import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class CompetencyUserService {
  readonly updateValue$ = new BehaviorSubject<any>(null)

  emitProfileUpdate(value: any): void {
    this.updateValue$.next(value)
  }
}
