import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ActivatedRoute } from '@angular/router'
import { EventService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  standalone: false,
  selector: 'viewer-assesment-overview',
  templateUrl: './assesment-overview.component.html',
  styleUrls: ['./assesment-overview.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,

})
export class AssesmentOverviewComponent implements OnInit {
  isCompetency = false
  isAshaHome: any = false
  constructor(
    public dialogRef: MatDialogRef<AssesmentOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public assesmentdata: any,
    public route: ActivatedRoute,
    private events: EventService
  ) { }

  ngOnInit() {
    this.isCompetency = this.route.snapshot.queryParams.competency
    this.isAshaHome = this.route.snapshot.queryParams.isAsha
  }
  closePopup() {
    if (this.isCompetency) {
      if (this.isAshaHome) {
        this.dialogRef.close({
          event: 'close-overview',
          asha: this.route.snapshot.queryParams.isAsha,
        })
      } else {
        this.dialogRef.close({
          event: 'close-overview',
          competency: this.route.snapshot.queryParams.competency,
        })
      }
    } else {
      this.dialogRef.close({ event: 'close-overview' })
    }
    this.generateInteractTelemetry('close-assessment-popup')
  }

  generateInteractTelemetry(status) {
    const value = new Map()
    value['type'] = "application/json"
    value['version'] = ""
    this.events.raiseInteractTelemetry(
      'TOUCH',
      status,
      'assessment-overview',
      value
    )
  }
}
