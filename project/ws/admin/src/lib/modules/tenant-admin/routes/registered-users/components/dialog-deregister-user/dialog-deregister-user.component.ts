import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'ws-admin-dialog-deregister-user',
  templateUrl: './dialog-deregister-user.component.html',
  styleUrls: ['./dialog-deregister-user.component.scss'],
})
export class DialogDeregisterUserComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogDeregisterUserComponent>,
  ) { }

  close(sure = false): void {
    this.dialogRef.close(sure)
  }

  ngOnInit() {
  }

}
