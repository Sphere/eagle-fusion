import { NativeDateAdapter, MatDateFormats } from '@angular/material/core'

export class AppDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      let day: string = date.getDate().toString()
      day = +day < 10 ? `0${day}` : day
      let month: string = (date.getMonth() + 1).toString()
      month = +month < 10 ? `0${month}` : month
      const year = date.getFullYear()
      // return `${year}-${month}-${day}`
      return `${day}-${month}-${year}`
    }
    return date.toDateString()
  }
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: {
      year: 'numeric', month: 'long', day: 'numeric',
    },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
}

export function changeformat(date: Date): string {
  let day: string = date.getDate().toString()
  day = +day < 10 ? `0${day}` : day
  let month: string = (date.getMonth() + 1).toString()
  month = +month < 10 ? `0${month}` : month
  const year = date.getFullYear()
  // return `${year}-${month}-${day}`
  return `${day}-${month}-${year}`
}

export function startWithYearformat(date: Date): string {
  let day: string = date.getDate().toString()
  day = +day < 10 ? `0${day}` : day
  let month: string = (date.getMonth() + 1).toString()
  month = +month < 10 ? `0${month}` : month
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}
