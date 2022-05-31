import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'viewer-assesment-modal',
  templateUrl: './assesment-modal.component.html',
  styleUrls: ['./assesment-modal.component.scss']
})
export class AssesmentModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AssesmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
  ) { }

  ngOnInit() {
  }

}
