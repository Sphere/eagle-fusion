import { Pipe, PipeTransform } from '@angular/core'

interface IUserName {
  firstName: string
  lastName: string
  email: string
}

@Pipe({
  name: 'pipeNameTransform',
})
export class PipeNameTransformPipe implements PipeTransform {

  transform(value: IUserName): string {
    let result = ''
    if (value.firstName) {
      result += value.firstName
    }
    if (value.lastName && value.lastName !== value.firstName) {
      result += ` ${value.lastName}`
    }
    if (result.trim() !== '') {
      return result
    }
    if (value.email) {
      return value.email
    }
    return 'Anonymous User'
  }

}
