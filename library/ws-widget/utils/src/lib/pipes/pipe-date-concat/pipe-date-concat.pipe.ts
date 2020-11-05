import { Pipe, PipeTransform } from '@angular/core'

interface ICertificationDate {
  day: number
  month: number
  year: number
  timeZone?: string
}

@Pipe({
  name: 'pipeDateConcat',
})
export class PipeDateConcatPipe implements PipeTransform {
  private readonly months: string[]

  constructor() {
    this.months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
  }

  transform(value: ICertificationDate): string {
    let dateStr = `${value.day} ${this.months[value.month - 1]} ${value.year}`
    if (value.timeZone) {
      dateStr += ` ${value.timeZone}`
    }

    return dateStr
  }
}
