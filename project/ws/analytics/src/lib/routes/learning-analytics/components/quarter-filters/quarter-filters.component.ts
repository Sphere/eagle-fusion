import { Component, EventEmitter, OnInit, Output, ElementRef, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatDatepickerInputEvent, MatSnackBar } from '@angular/material'
import { NsAnalytics } from '../../models/learning-analytics.model'

import { QuarterServiceService } from '../../services/quarter-filter.service'
@Component({
  selector: 'ws-analytics-quarter-filters',
  templateUrl: './quarter-filters.component.html',
  styleUrls: ['./quarter-filters.component.scss'],
})
export class QuarterFiltersComponent implements OnInit {
  @Output() filterEvent = new EventEmitter<string>()
  yearObj: NsAnalytics.IQuarterObj[] = []
  selectedQuarterArray: number[] = []
  selectedYearValue: number | null = null
  fromDateValue: string | Date | null = null
  toDateValue: string | Date | null = null
  maxDate: Date = new Date()
  // tslint:disable-next-line: max-line-length
  todayValue: string | null = `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  public config = {
    currentYear: new Date().getFullYear(),
    threshold: 1,
    todaysDate: this.todayValue,
    today: false,
    years: this.yearObj,
    fromDate: this.fromDateValue,
    toDate: this.toDateValue,
    type: 'default',

    quarters: [
      { name: 'Q1', id: 1, color: '' },
      { name: 'Q2', id: 2, color: '' },
      { name: 'Q3', id: 3, color: '' },
      { name: 'Q4', id: 4, color: '' },
    ],
    selectedYear: this.selectedYearValue,
    selectedQuarters: this.selectedQuarterArray,
  }
  public quarterOrInput = false
  dateStart = new FormControl(null)
  dateEnd = new FormControl(null)
  startDate = new Date(2019, 3, 1)
  count = 0
  endDate = new Date()
  @ViewChild('errorContent', { static: true })
  errorMessage!: ElementRef<any>
  // dateForm: FormGroup
  constructor(private quarterService: QuarterServiceService, public matSnackBar: MatSnackBar) {
    // this.dateForm = new FormGroup({
    //   dateStart: new FormControl(null),
    //   dateEnd: new FormControl(null),
    // })
  }

  ngOnInit() {
    this.maxDate.setTime(new Date().getTime() - 86400000)
    this.setInitialYearAndQuarter()
    this.applyDateFilter()
  }
  setInitialYearAndQuarter() {
    try {
      for (let i = 0; i < this.config.threshold; i += 1) {
        const year = this.config.currentYear + i
        const name = year.toString()
        const yearName = `CY ${name.slice(2)}`
        const yearOb = {
          key: yearName,
          value: this.config.currentYear + i,
        }
        this.config.years.push(yearOb)
      }
      this.config.years.sort((a, b) => {
        return a.value - b.value ? 1 : -1
      })
      // this.config.selectedYear = this.config.years[
      //   this.config.years.length - 1
      // ].value;

      // const currentQuarter = this.quarterService.getCurrentQuarter()[0] //
      // const allQuarters = []
      // [3]

      // for (let q = 1; q <= currentQuarter; q++) {
      //   allQuarters.push(q);
      // }
      this.config.selectedQuarters = []
    } catch (e) {
      throw e
    }
  }
  changeYear(year: number) {
    try {
      // validate year
      if (year) {
        // set selected year
        const allQuarters = []
        this.config.selectedQuarters = []
        for (let q = 1; q <= 4; q += 1) {
          allQuarters.push(q)
        }
        // if (this.config.selectedYear !== null) {
        //     this.config.selectedQuarters = allQuarters ;
        // }
        this.config.selectedYear = year
        this.config.selectedQuarters = allQuarters
      }
    } catch (e) {
      throw e
    }
  }

  toggleInput() {
    try {
      this.quarterOrInput = !this.quarterOrInput
      const obj = {
        from: this.startDate,
        to: this.todayValue,
        count: this.count,
      }
      this.dateStart.setValue('')
      this.dateEnd.setValue('')
      this.filterEvent.emit(JSON.stringify(obj))
    } catch (e) { }
  }
  selectQuarters(quarter: any) {
    try {
      // validate quarter
      if (quarter) {
        // getting all initial values.
        const temp = this.config.selectedQuarters
        const len = temp.length // length of the seletced quarters will give us the no.
        const last = temp[len - 1] // get the last quarter
        // const first = temp[0] // get the first quarter
        /**
         * user can click on quarter to add it and also to remove it.
         * but quarter should be removed only if it is in squence .
         * a quarter if not in sequence is added. all the other quarters that
         * can fill the sequence will be selected too,.
         */

        // if it is in array means we are removing it else adding.\
        // getting type based on if id is present in then remove else add
        const type = temp.indexOf(quarter.id) === -1 ? 'add' : 'remove'
        if (quarter && this.config.selectedYear === null) {
          // const currentMonth = new Date().getMonth() + 1
          // if (currentMonth > 3) {
          //   const year = this.config.years.length - 1
          //   this.config.selectedYear = this.config.years[year].value
          // } else {
            const year = this.config.years.length - 1
            this.config.selectedYear = this.config.years[year].value
          // }
        }
        if (type === 'add') {
          // if nothinig is in array simply add it.
          if (len === 0) {
            this.config.selectedQuarters = [quarter.id]
          } else {
            /**
             * if the quarter id is > last value in the array we will simply
             * start the loop from last+1 to the quarterid and push the values to array.
             * we have to make sure there are no duplicates
             */
            if (quarter.id > last) {
              // copy to temp;
              const newList = temp
              for (let i = last + 1; i <= quarter.id; i += 1) {
                if (newList.indexOf(i) === -1) {
                  newList.push(i)
                }
              }
              /**
               * if the selected quarted id is less than the last value in index
               * we will start the loop from quarter id to last number
               * push the values at particular index of array and sort them.
               * remove duplicates
               */
            } else {
              const anotherList = temp
              for (let j = quarter.id; j < last; j += 1) {
                if (anotherList.indexOf(j) === -1) {
                  // this is how we add the elemet to a particular index.
                  anotherList.splice(1, 0, j)
                }
              }
              // sort the values to get in the sequence
              anotherList.sort()
            }
          }
        } else {
          // remove
          // if length ==1 remove/pop
          if (len === 1) {
            temp.pop()
          } else {
            // hard code if is first or last. then remove simply at the index.
            if (quarter.id === 1 || quarter.id === 4) {
              const index = temp.indexOf(quarter.id)
              temp.splice(index, 1)
            } else {
              // calculate new last and new first. compare and remove.
              const newLast = temp[temp.length - 1]
              const newFirst = temp[0]
              if (quarter.id === newLast) {
                // pop because it removes last
                temp.pop()
              } else if (quarter.id === newFirst) {
                // shift because it removes first and orders accordingly
                temp.shift()
              } else if (quarter.id !== newFirst && quarter.id > newFirst && quarter.id < newLast) {
                for (let c = quarter.id; c < 4; c += 1) {
                  temp.pop()
                }
              }
            }
          }
        }
        /**
         * the best thing about this function is that objects are pass by reference.
         * the original array inside the this.config.selectedQuarters
         * automatically is updated without even setting it after the work is done here.;
         *
         */
      }
    } catch (e) {
      throw e
    }
  }
  selectToday() {
    try {
      this.count += 1
      // this.config.fromDate = this.config.todaysDate;
      this.config.toDate = this.config.todaysDate
      const today = this.config.toDate ? new Date(this.config.toDate) : new Date()
      const priorDate = new Date(new Date().setDate(today.getDate() - 30))
      // tslint:disable-next-line: max-line-length
      this.config.fromDate = `${priorDate.getFullYear()}-${`0${priorDate.getMonth() + 1}`.slice(-2)}-${`0${priorDate.getDate()}`.slice(-2)}`
      this.dateEnd = new FormControl(new Date(today))
      this.dateStart = new FormControl(new Date(priorDate))
    } catch (e) { }
  }
  inputChange(type: string, event: MatDatepickerInputEvent<Date>) {
    this.config.type = 'input'
    this.count += 1
    if (type === 'start' && event.value) {
      // tslint:disable-next-line:max-line-length
      this.config.fromDate = `${new Date(event.value).getFullYear()}-${`0${new Date(event.value).getMonth() + 1}`.slice(-2)}-${`0${new Date(event.value).getDate()}`.slice(-2)}`
    } else {
      if (event.value) {
        // tslint:disable-next-line:max-line-length
        this.config.toDate = `${new Date(event.value).getFullYear()}-${`0${new Date(event.value).getMonth() + 1}`.slice(-2)}-${`0${new Date(event.value).getDate()}`.slice(-2)}`
      }
    }
  }
  applyDateFilter() {
    if (this.dateEnd.value >= this.dateStart.value) {
      this.count += 1
      if (this.config.type === 'last30') {
        this.config.selectedYear = null
        this.config.selectedQuarters = []

        const obj = {
          from: this.config.fromDate,
          to: this.config.toDate,
          count: this.count,
        }
        this.filterEvent.emit(JSON.stringify(obj))
      } else if (this.config.type === 'input') {
        this.config.selectedYear = null
        this.config.selectedQuarters = []
        if (this.config.fromDate !== null && this.config.toDate !== null) {
          const obj = {
            // tslint:disable-next-line: max-line-length
            from: `${new Date(this.config.fromDate).getFullYear()}-${`0${new Date(this.config.fromDate).getMonth() + 1}`.slice(-2)}-${`0${new Date(this.config.fromDate).getDate()}`.slice(-2)}`,
            // tslint:disable-next-line: max-line-length
            to: `${new Date(this.config.toDate).getFullYear()}-${`0${new Date(this.config.toDate).getMonth() + 1}`.slice(-2)}-${`0${new Date(this.config.toDate).getDate()}`.slice(-2)}`,
            count: this.count,
          }
          this.filterEvent.emit(JSON.stringify(obj))
        }
      } else if (this.config.type === 'default') {
        const defaultDates = this.quarterService.getDatesFromQuarters(
          this.config.selectedQuarters,
          this.config.selectedYear,
        )
        const reagex = new RegExp('/', 'g')
        if (defaultDates) {
          defaultDates.startDate = defaultDates.startDate.replace(reagex, '-')
          defaultDates.endDate = defaultDates.endDate.replace(reagex, '-')
          const obj = {
            from: defaultDates.startDate,
            to: defaultDates.endDate,
            count: this.count,
          }
          this.filterEvent.emit(JSON.stringify(obj))
        }
      }
    } else {
      this.matSnackBar.open(this.errorMessage.nativeElement.value)
    }
  }
}
