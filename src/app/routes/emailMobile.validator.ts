import { AbstractControl, ValidationErrors } from '@angular/forms'

// All repetition is bounded ({m,n}, never unbounded + or *) so the regex engine's
// worst-case work is a fixed constant regardless of input length — no catastrophic backtracking.
// tslint:disable-next-line: max-line-length
const EMAIL_PATTERN = /^(([^<>()\[\]\\.,;:\s@"]{1,200}(\.[^<>()\[\]\\.,;:\s@"]{1,200}){0,8})|("[^"]{1,200}"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]{1,63}\.){1,8}[a-zA-Z]{2,24}))$/
const MOBILE_PATTERN = /^[0-9]+$/

export class EmailMobileValidators {
  static combinePattern(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value.userInput
    if (!value) {
      return null
    }

    // Bound the input length before running EMAIL_PATTERN — caps worst-case
    // regex backtracking cost so long unmatched input can't hang the UI thread.
    if (value.length > 254) {
      return { email: false }
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
