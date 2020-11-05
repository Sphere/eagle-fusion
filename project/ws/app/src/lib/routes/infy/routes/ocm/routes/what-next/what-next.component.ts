import { Component, OnInit, Input } from '@angular/core'
import { MatCalendarCellCssClasses } from '@angular/material'
import { IWsEventsConfig, IWsEvent } from '../../models/ocm.model'

@Component({
  selector: 'ws-app-what-next',
  templateUrl: './what-next.component.html',
  styleUrls: ['./what-next.component.scss'],
})
export class WhatNextComponent implements OnInit {
  @Input() config: IWsEventsConfig = {
    title: '',
    eventsList: [],
  }
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thrusday', 'Friday', 'Saturday', 'Sunday']
  selectedDate = -1
  displaySelectedDate = ''
  fetchingEvents = true
  showReleaseItems: { [title: string]: boolean } = {}
  eventsList: IWsEvent[] = []
  filteredEvents: IWsEvent[] = []
  tabs: string[] = []
  selectedIndex = -1

  constructor() {}

  ngOnInit() {
    this.selectedDate = new Date().setHours(0, 0, 0, 0)
    this.getSelectedDateEvents()
  }

  onSelect(date: Date) {
    this.selectedIndex = 0
    this.selectedDate = date.setHours(0, 0, 0, 0)
    this.getSelectedDateEvents()
  }

  getSelectedDateEvents() {
    this.displaySelectedDate = `${this.months[new Date(this.selectedDate).getMonth()]}
       ${new Date(this.selectedDate).getDate()}, ${new Date(this.selectedDate).getFullYear()}
        - ${this.days[new Date(this.selectedDate).getDay()]}`

    if (this.config && this.config.eventsList) {
      this.eventsList = this.config.eventsList.filter(
        event => event.timestamp === this.selectedDate,
      )
      this.tabs = Array.from(new Set(this.eventsList.map(event => event.category))).filter(
        tab => tab !== '',
      )
      this.tabs && this.tabs.length ? this.getFilteredEventsData(0) : (this.filteredEvents = [])
    } else {
      this.filteredEvents = []
    }
    this.fetchingEvents = false
  }

  getFilteredEventsData(index: number) {
    this.filteredEvents = this.eventsList.filter(e => e.category === this.tabs[index])
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      const highlightDate = this.config.eventsList
        .filter(event => event && event.timestamp)
        .some(d => d.timestamp === date.getTime())

      return highlightDate ? 'special-date' : ''
    }
  }
}
