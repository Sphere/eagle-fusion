import { Component, OnInit, EventEmitter, Output } from '@angular/core'

@Component({
  selector: 'ws-admin-api-request',
  templateUrl: './api-request.component.html',
  styleUrls: ['./api-request.component.scss'],
})
export class ApiRequestComponent implements OnInit {
  @Output() apiRequest = new EventEmitter<any>()
  api: any = {
    path: '',
    queryParams: {
      pageNo: 0,
      pageSize: 30,
    },
  }
  constructor() { }

  ngOnInit() { }

  save() {
    const request = {
      api: this.api,
    }
    this.apiRequest.emit(request)
    this.api.path = ''
  }
}
