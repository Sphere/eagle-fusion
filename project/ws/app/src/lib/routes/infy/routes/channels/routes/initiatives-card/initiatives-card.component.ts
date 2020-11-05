import { Component, OnInit, Input } from '@angular/core'
import { IWsChannelInitiativesData } from '../../models/channels.model'

@Component({
  selector: 'ws-app-initiatives-card',
  templateUrl: './initiatives-card.component.html',
  styleUrls: ['./initiatives-card.component.scss'],
})
export class InitiativesCardComponent implements OnInit {
  @Input() initiativesData: IWsChannelInitiativesData[] | null = null

  constructor() {}

  ngOnInit() {}
}
