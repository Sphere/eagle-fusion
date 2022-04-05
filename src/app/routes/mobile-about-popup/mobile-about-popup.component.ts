import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-mobile-about-popup',
  templateUrl: './mobile-about-popup.component.html',
  styleUrls: ['./mobile-about-popup.component.scss']
})
export class MobileAboutPopupComponent implements OnInit {
  @Inject(MAT_DIALOG_DATA) public data: any

  constructor(public dialogRef: MatDialogRef<MobileAboutPopupComponent>) {

  }

  ngOnInit() {
  }
  onNoClick() {
    this.dialogRef.close()
  }
}
