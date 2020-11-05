import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

@Component({
  selector: 'ws-widget-btn-kb-confirm',
  templateUrl: './btn-kb-confirm.component.html',
  styleUrls: ['./btn-kb-confirm.component.scss'],
})
export class BtnKbConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public contentId: string, public dialogRef: MatDialogRef<BtnKbConfirmComponent>) { }

  ngOnInit() {
  }

  saveChanges() {
    this.dialogRef.close(true)
  }

  ignoreChanges() {
    this.dialogRef.close(false)
  }

}
