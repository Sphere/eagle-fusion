import { Component, OnInit, Input } from '@angular/core'
// import { IBadgeRecent } from '../../../../../profile/routes/badges/badges.model'

@Component({
  selector: 'ws-app-badges-card',
  templateUrl: './badges-card.component.html',
  styleUrls: ['./badges-card.component.scss'],
})
export class BadgesCardComponent implements OnInit {
  @Input()
  badge!: any
  constructor() { }

  ngOnInit() { }
}
