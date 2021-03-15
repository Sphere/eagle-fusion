import { AbstractControl, ValidationErrors } from '@angular/forms'

export class EmailMobileValidators {
  static combinePattern(control: AbstractControl): ValidationErrors | null {
    if (control.value.userInput) {
      const value: string = control.value.userInput
      // tslint:disable-next-line: max-line-length
      const patter1 = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      const pattern2 = /^[0-9]+$/
      if (patter1.test(value) || pattern2.test(value)) {
        if (patter1.test(value)) {
          if (control.value.userInput.length >= 100) {
            return { email: false }
          }
        }
        if (pattern2.test(value)) {
          if (control.value.userInput.length !== 10) {
            return { mobile: false }
          }
        }
        return null

      }
    }
    return null
  }
}
