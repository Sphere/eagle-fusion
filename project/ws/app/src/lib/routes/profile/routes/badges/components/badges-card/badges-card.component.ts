import { Component, OnInit, Input } from '@angular/core'
import { IBadgeRecent } from '../../../badges/badges.model'
import 'jspdf-autotable'
import { IUserProfileDetailsFromRegistry } from '../../../../../user-profile/models/user-profile.model'

@Component({
  selector: 'ws-app-badges-card',
  templateUrl: './badges-card.component.html',
  styleUrls: ['./badges-card.component.scss'],
})
export class BadgesCardComponent implements OnInit {
  @Input()
  badge!: IBadgeRecent

  @Input() badgeRecent = []
  @Input() userName!: string

  @Input() userProfileData!: IUserProfileDetailsFromRegistry

  constructor() { }
  ngOnInit() {
  }
}
