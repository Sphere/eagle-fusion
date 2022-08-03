import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-confirm-modal-component',
  templateUrl: './confirm-modal-component.html',
  styleUrls: ['./confirm-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ConfirmmodalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }
  done() {
    this.dialogRef.close({ event: 'CONFIRMED' })
  }
}
