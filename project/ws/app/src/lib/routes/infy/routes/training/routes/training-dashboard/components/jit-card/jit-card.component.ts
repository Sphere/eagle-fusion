import { Component, OnInit, Input } from '@angular/core'
import { IJITRequest } from '../../../../models/training-api.model'

@Component({
  selector: 'ws-app-jit-card',
  templateUrl: './jit-card.component.html',
  styleUrls: ['./jit-card.component.scss'],
})
export class JitCardComponent implements OnInit {
  @Input() jitRequest!: IJITRequest
  trackLeads!: string[]
  trackAnchors!: string[]

  constructor() {}

  ngOnInit() {
    this.trackLeads = this.jitRequest.track_lead.split(', ')
    this.trackAnchors = this.jitRequest.track_anchor.split(', ')
  }
}
