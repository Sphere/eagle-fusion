import { Injectable, Type } from '@angular/core'
import { LoginComponent } from '../login/login.component'

@Injectable({
  providedIn: 'root',
})
export class LoginRootService {
  constructor() { }

  getComponent(): Type<any> {
    return LoginComponent
  }
}
