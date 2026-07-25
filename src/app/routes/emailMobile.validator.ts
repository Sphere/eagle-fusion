import { AbstractControl, ValidationErrors } from '@angular/forms'

// tslint:disable-next-line: max-line-length
const EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const MOBILE_PATTERN = /^[0-9]+$/

export class EmailMobileValidators {
  static combinePattern(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value.userInput
    if (!value) {
      return null
    }

    const isEmail = EMAIL_PATTERN.test(value)
    const isMobile = MOBILE_PATTERN.test(value)

    if (!isEmail && !isMobile) {
      return null
    }

    if (isEmail && value.length >= 100) {
      return { email: false }
    }

    if (isMobile && value.length !== 10) {
      return { mobile: false }
    }

    return null
  }
}
