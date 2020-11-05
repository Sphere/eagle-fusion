import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
@Component({
  selector: 'ws-auth-ipr-dialog',
  templateUrl: './ipr-dialog.component.html',
  styleUrls: ['./ipr-dialog.component.scss'],
})
export class IprDialogComponent implements OnInit {
  // constructor(public dialogRef: MatDialogRef<IprDialogComponent>,
  //   @Inject(MAT_DIALOG_DATA)

  constructor(
    public dialogRef: MatDialogRef<IprDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean,
  ) {}

  onClose(): void {
    this.dialogRef.close()
  }

  ngOnInit() {}
}
