import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Location } from '@angular/common'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-mobile-profile-nav',
  templateUrl: './mobile-profile-nav.component.html',
  styleUrls: ['./mobile-profile-nav.component.scss'],
})
export class MobileProfileNavComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private _location: Location) { }

  ngOnInit() {
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }

  backScreen() {
    this._location.back()
  }
}
