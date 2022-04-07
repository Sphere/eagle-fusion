import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material'

@Component({
  selector: 'ws-profile-select',
  templateUrl: './profile-select.component.html',
  styleUrls: ['./profile-select.component.scss'],
})
export class ProfileSelectComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ProfileSelectComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close()
  }

}
