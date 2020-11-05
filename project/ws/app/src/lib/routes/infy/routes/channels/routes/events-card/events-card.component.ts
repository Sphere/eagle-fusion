import { Component, OnInit, Input } from '@angular/core'
import { IWsChannelEventsData } from '../../models/channels.model'

@Component({
  selector: 'ws-app-events-card',
  templateUrl: './events-card.component.html',
  styleUrls: ['./events-card.component.scss'],
})
export class EventsCardComponent implements OnInit {
  @Input() eventsData: IWsChannelEventsData[] | null = null

  constructor() {}

  ngOnInit() {}

  isCurrentTimeSmall(timestamp: string) {
    return new Date() < new Date(timestamp)
  }
}
