import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'

@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss']
})
export class MobileProfileDashboardComponent implements OnInit {
  showMobileView: boolean = false


  showAcademicElse = false

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openAboutDialog() {
    let dialogRef = this.dialog.open(MobileAboutPopupComponent, {
      width: "500px",
      //height: "300px"
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result)
    })
  }

  openProfileDialog(): void {
    let dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px',
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result)
    })
  }
}
