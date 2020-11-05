import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { IEventDetails } from '../../interfaces/event-details.model'
import { EventService } from '../../services/event.service'

@Component({
  selector: 'ws-app-event-overview',
  templateUrl: './event-overview.component.html',
  styleUrls: ['./event-overview.component.scss'],
})
export class EventOverviewComponent implements OnInit {

  data: IEventDetails[] = []
  eventFooter: any
  constructor(
    private activatedRoute: ActivatedRoute,
    private appEventSvc: EventService,
  ) { }

  ngOnInit() {
    this.appEventSvc.bannerisEnabled.next(true)
    if (this.activatedRoute.parent) {
      this.activatedRoute.parent.data.subscribe((data: any) => {
        this.data = []
        this.eventFooter = data.eventdata.data.Home
        Object.keys(data.eventdata.data.Home.SessionTypes).forEach((v: any) => {
          this.data.push({
            plannedImage: data.eventdata.data.Home.SessionTypes[v].SessionTypeImage,
            plannedName: data.eventdata.data.Home.SessionTypes[v].SessionTypeTitle,
            plannedDetails: data.eventdata.data.Home.SessionTypes[v].SessionTypeBody,
          })
        })
      })
    }

  }

}
