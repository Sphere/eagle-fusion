import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { MatCalendarCellCssClasses } from '@angular/material'

@Component({
  selector: 'ws-app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  selectedDate: any
  maxDate: Date = new Date()
  @Output() notify = new EventEmitter<string>()
  @Input() specialDates: number[] = []
  onSelect(event: string) {
    this.selectedDate = event
    this.notify.emit(event)
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      if (this.specialDates.includes(new Date(date).getTime() + 330 * 60000)) {
        return 'special-date'
      }

      return ''
    }
  }

  constructor() {}

  ngOnInit() {
    this.maxDate.setTime(new Date().getTime() - 86400000)
  }
}
