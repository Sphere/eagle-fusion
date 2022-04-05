import { Component, HostListener, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'


@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss']
})
export class MobileProfileDashboardComponent implements OnInit {
  showMobileView: boolean = false


  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openProfImg() {
    const dialogRef = this.dialog.open(MobileAboutPopupComponent, {
      width: "312px", height: "369px"
    })
  }


}
