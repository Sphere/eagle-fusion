import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-assesment-overview',
  templateUrl: './assesment-overview.component.html',
  styleUrls: ['./assesment-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AssesmentOverviewComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AssesmentOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }

  ngOnInit() {
  }
  closePopup() {
    this.dialogRef.close({ event: 'close-overview' })
  }
}
