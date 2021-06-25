import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss'],
})
export class DialogConfirmComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, body: string },
    private dialogRef: MatDialogRef<DialogConfirmComponent>,
  ) { }

  confirmed(): void {
    this.dialogRef.close('edit')
  }

  downloadNow(): void {
    this.dialogRef.close('download')
  }
}
