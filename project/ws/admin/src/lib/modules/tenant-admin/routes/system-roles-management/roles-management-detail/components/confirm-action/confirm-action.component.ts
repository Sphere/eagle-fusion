import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

@Component({
  selector: 'ws-admin-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss'],
})
export class ConfirmActionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConfirmActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { func: string },
  ) { }

  ngOnInit() {
  }
  close(): void {
    this.dialogRef.close()
  }

  add(): void {
    this.dialogRef.close('add')
  }
  remove(): void {
    this.dialogRef.close('remove')
  }

}
