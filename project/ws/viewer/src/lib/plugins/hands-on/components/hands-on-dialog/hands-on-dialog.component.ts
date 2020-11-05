import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'viewer-hands-on-dialog',
  templateUrl: './hands-on-dialog.component.html',
  styleUrls: ['./hands-on-dialog.component.scss'],
})
export class HandsOnDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<HandsOnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }

  ngOnInit() {
  }

  submit() {
    this.dialogRef.close('submit')
  }

  close() {
    this.dialogRef.close()
  }

}
