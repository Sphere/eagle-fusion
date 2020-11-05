import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-app-channel-hubs',
  templateUrl: './channel-hubs.component.html',
  styleUrls: ['./channel-hubs.component.scss'],
})
export class ChannelHubsComponent implements OnInit {

  pageData: any
  private baseUrl = `assets/configurations/${location.host.replace(':', '_')}`
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(`${this.baseUrl}/feature/channel-hubs.json`).subscribe(
      response => {
        this.pageData = response
      },
    )
  }

}
