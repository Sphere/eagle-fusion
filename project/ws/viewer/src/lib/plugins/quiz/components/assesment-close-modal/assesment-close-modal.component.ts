import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-assesment-close-modal',
  templateUrl: './assesment-close-modal.component.html',
  styleUrls: ['./assesment-close-modal.component.scss'],
})
export class AssesmentCloseModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AssesmentCloseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }

  ngOnInit() {
  }

  closeNo() {
    this.dialogRef.close({ event: 'NO' })
  }

  closeYes() {
    this.dialogRef.close({ event: 'CLOSE' })
  }
}
