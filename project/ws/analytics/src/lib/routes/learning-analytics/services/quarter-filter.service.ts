import { Injectable } from '@angular/core'
import { DatePipe } from '@angular/common'

@Injectable()
export class QuarterServiceService {
  endDate = new Date().getTime() - 86400000
  startMonth = 1
  startDate = '2020/01/01'
  constructor(private datePipe: DatePipe) { }
  getCurrentQuarter() {
    try {
      // code was changed as the quarter was setting to Q3 due to math.ceil was taking divider as 4 by business logic
      const month = new Date().getMonth() + 1
      // const quarter = Math.ceil(month / 3)
      if (month >= 1 && month <= 3) {
        return [1]
      }
      if (month >= 4 && month <= 6) {
        return [2]
      }
      if (month >= 7 && month <= 9) {
        return [3]
      }
      if (month >= 10 && month <= 12) {
        return [4]
      }
      return
      // return [quarter];
    } catch (e) {
      return [4]
    }
  }

  getDatesFromQuarters(quarters: any, year?: any) {
    const monthStart = this.startMonth > 10 ? `${year}/${this.startMonth}/01` : `${year}/0${this.startMonth}/01`
    const startDateQ1 = year === null ? this.startDate : monthStart
    try {
      const dateEndQ1 = new Date(`${startDateQ1}`)
      const datePlusMonthEndQ1 = new Date(`${startDateQ1}`)
      datePlusMonthEndQ1.setMonth(dateEndQ1.getMonth() + 3)
      const dateMinusDayQ1 = new Date(`${datePlusMonthEndQ1}`).getTime() - 86400000
      const endDateQ1 = this.datePipe.transform(dateMinusDayQ1, 'yyyy/MM/dd')

      const dateStartQ2 = new Date(`${startDateQ1}`)
      const datePlusMonthStartQ2 = new Date(`${startDateQ1}`)
      datePlusMonthStartQ2.setMonth(dateStartQ2.getMonth() + 3)
      const startDateQ2 = this.datePipe.transform(datePlusMonthStartQ2, 'yyyy/MM/dd')

      const dateEndQ2 = new Date(`${startDateQ2}`)
      const datePlusMonthEndQ2 = new Date(`${startDateQ2}`)
      datePlusMonthEndQ2.setMonth(dateEndQ2.getMonth() + 3)
      const dateMinusDayQ2 = new Date(`${datePlusMonthEndQ2}`).getTime() - 86400000
      const endDateQ2 = this.datePipe.transform(dateMinusDayQ2, 'yyyy/MM/dd')

      const dateStartQ3 = new Date(`${startDateQ2}`)
      const datePlusMonthStartQ3 = new Date(`${startDateQ2}`)
      datePlusMonthStartQ3.setMonth(dateStartQ3.getMonth() + 3)
      const startDateQ3 = this.datePipe.transform(datePlusMonthStartQ3, 'yyyy/MM/dd')

      const dateEndQ3 = new Date(`${startDateQ3}`)
      const datePlusMonthEndQ3 = new Date(`${startDateQ3}`)
      datePlusMonthEndQ3.setMonth(dateEndQ3.getMonth() + 3)
      const dateMinusDayQ3 = new Date(`${datePlusMonthEndQ3}`).getTime() - 86400000
      const endDateQ3 = this.datePipe.transform(dateMinusDayQ3, 'yyyy/MM/dd')

      const dateStartQ4 = new Date(`${startDateQ3}`)
      const datePlusMonthStartQ4 = new Date(`${startDateQ3}`)
      datePlusMonthStartQ4.setMonth(dateStartQ4.getMonth() + 3)
      const startDateQ4 = this.datePipe.transform(datePlusMonthStartQ4, 'yyyy/MM/dd')

      const dateEndQ4 = new Date(`${startDateQ4}`)
      const datePlusMonthEndQ4 = new Date(`${startDateQ4}`)
      datePlusMonthEndQ4.setMonth(dateEndQ4.getMonth() + 3)
      const dateMinusDayQ4 = new Date(`${datePlusMonthEndQ4}`).getTime() - 86400000
      const endDateQ4 = this.datePipe.transform(dateMinusDayQ4, 'yyyy/MM/dd')

      const quarterDates: string[] = []
      if (quarters && year) {
        quarters.map((current: any) => {
          switch (current) {
            case 1:
              quarterDates.push(`${startDateQ1}-${endDateQ1}`)
              break
            case 2:
              quarterDates.push(`${startDateQ2}-${endDateQ2}`)
              break
            case 3:
              quarterDates.push(`${startDateQ3}-${endDateQ3}`)
              break
            case 4:
              quarterDates.push(`${startDateQ4}-${endDateQ4}`)
              break
            default:
              break
          }
        })
        return {
          startDate: quarterDates[0].split('-')[0],
          endDate: quarterDates[quarterDates.length - 1].split('-')[1],
        }
      }
      return {
        startDate: this.startDate,
        endDate:
          `${new Date(this.endDate).getFullYear()}/${`0${new Date(this.endDate).getMonth() + 1}`.slice(-2,
          )}/${`0${new Date(this.endDate).getDate()}`.slice(-2)}`,
      }
      return null
    } catch (e) {
      throw e
    }
  }
}
