import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
    standalone: false,
    selector: 'app-leadership-dashboard-info',
    templateUrl: './leadership-dashboard-info.component.html',
    styleUrls: ['./leadership-dashboard-info.component.scss'],
    
})
export class LeadershipDashboardInfoComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LeadershipDashboardInfoComponent>,
  ) { }

  ngOnInit() { }

  close() {
    this.dialogRef.close()
  }
}
