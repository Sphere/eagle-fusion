import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'viewer-assesment-overview',
  templateUrl: './assesment-overview.component.html',
  styleUrls: ['./assesment-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AssesmentOverviewComponent implements OnInit {
  isCompetency = false
  constructor(
    public dialogRef: MatDialogRef<AssesmentOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.isCompetency = this.route.snapshot.queryParams.competency
  }
  closePopup() {
    if (this.isCompetency) {
      this.dialogRef.close({
        event: 'close-overview',
        competency: this.route.snapshot.queryParams.competency,
      })
    } else {
      this.dialogRef.close({ event: 'close-overview' })
    }
  }
}
