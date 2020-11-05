import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { IDialogData } from '../dialog-box-admin/dialog-box-admin.component'

@Component({
  selector: 'ws-app-dialog-box-admin-accept',
  templateUrl: './dialog-box-admin-accept.component.html',
  styleUrls: ['./dialog-box-admin-accept.component.scss'],
})
export class DialogBoxAdminAcceptComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogBoxAdminAcceptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData) { }

  onNoClick(): void {
    this.dialogRef.close()
  }

  ngOnInit() {
  }

}
