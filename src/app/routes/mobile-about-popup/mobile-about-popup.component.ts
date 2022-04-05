import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material'

@Component({
  selector: 'ws-mobile-about-popup',
  templateUrl: './mobile-about-popup.component.html',
  styleUrls: ['./mobile-about-popup.component.scss']
})
export class MobileAboutPopupComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MobileAboutPopupComponent>) { }

  ngOnInit() {
  }
  onNoClick() {
    this.dialogRef.close()


  }
}
