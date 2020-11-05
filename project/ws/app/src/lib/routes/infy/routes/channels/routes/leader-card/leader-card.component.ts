import { Component, OnInit, Input } from '@angular/core'
import { IWsChannelLeaderData } from '../../models/channels.model'

@Component({
  selector: 'ws-app-leader-card',
  templateUrl: './leader-card.component.html',
  styleUrls: ['./leader-card.component.scss'],
})
export class LeaderCardComponent implements OnInit {
  @Input() leaderData: IWsChannelLeaderData[] | null = null

  constructor() {}

  ngOnInit() {}
}
