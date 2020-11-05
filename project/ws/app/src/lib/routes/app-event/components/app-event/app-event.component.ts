import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '../../services/event.service'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-app-event',
  templateUrl: './app-event.component.html',
  styleUrls: ['./app-event.component.scss'],
})
export class AppEventComponent implements OnInit {
  data: any
  error = false
  isRegisteredUser = false
  isEnabled = true
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private activatedRoute: ActivatedRoute,
    private appEventSvc: EventService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.appEventSvc.bannerisEnabled.subscribe(data => {
      this.isEnabled = data
    })
    this.activatedRoute.data.subscribe((data: any) => {
      if (data.eventdata && data.eventdata.data) {
        this.data = data.eventdata.data
        this.isRegisteredUser = this.data.RegistrationStatus.RegisteredUser === 'true'
      } else if (!data.eventdata || data.eventdata.error) {
        this.error = true
      }
    })

  }

}
