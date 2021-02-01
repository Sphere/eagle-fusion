import { AbstractControl } from '@angular/forms'
export class PasswordValidation {

  // @ts-ignore: Object is possibly 'null'.
  static MatchPassword(AC: AbstractControl) {
    // @ts-ignore: Object is possibly 'null'.
    let password = AC.get('password').value
    // @ts-ignore: Object is possibly 'null'.
    if (AC.get('confirmPassword').touched || AC.get('confirmPassword').dirty) {
      // @ts-ignore: Object is possibly 'null'.
      let verifyPassword = AC.get('confirmPassword').value

      if (password != verifyPassword) {
        // @ts-ignore: Object is possibly 'null'.
        AC.get('confirmPassword').setErrors({ MatchPassword: true })
      } else {
        return null
      }
    }
  }
}