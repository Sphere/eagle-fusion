import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-mobile-profile-nav',
  templateUrl: './mobile-profile-nav.component.html',
  styleUrls: ['./mobile-profile-nav.component.scss'],
})
export class MobileProfileNavComponent implements OnInit {
  @Input() showbackButton?: Boolean
  @Input() showLogOutIcon?: Boolean
  @Input() trigerrNavigation?: Boolean = false
  constructor(
    private dialog: MatDialog,
    private _location: Location,
    public router: Router) {
  }

  ngOnInit() {
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }

  backScreen() {

    if (this.trigerrNavigation) {
      this.router.navigate(['/app/profile-view'])
    } else {
      this._location.back()
    }
  }
}
