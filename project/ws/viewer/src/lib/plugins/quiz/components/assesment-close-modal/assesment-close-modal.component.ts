import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  standalone: false,
  selector: 'viewer-assesment-close-modal',
  templateUrl: './assesment-close-modal.component.html',
  styleUrls: ['./assesment-close-modal.component.scss'],

})
export class AssesmentCloseModalComponent {

  constructor(
    public dialogRef: MatDialogRef<AssesmentCloseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }


  closeNo() {
    this.dialogRef.close({ event: 'NO' })
  }

  closeYes() {
    this.dialogRef.close({ event: 'CLOSE' })
  }
}
