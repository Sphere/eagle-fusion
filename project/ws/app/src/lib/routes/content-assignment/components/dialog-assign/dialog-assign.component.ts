import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-dialog-assign',
  templateUrl: './dialog-assign.component.html',
  styleUrls: ['./dialog-assign.component.scss'],
})
export class DialogAssignComponent implements OnInit {
  isMandatory = false
  usersCount = 0
  contentsCount = 0
  constructor(
    public dialogRef: MatDialogRef<DialogAssignComponent>,
    public configSvc: ConfigurationsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.isMandatory = this.data.isMandatory
    this.usersCount = this.data.usersCount
    this.contentsCount = this.data.contentsCount
  }

  close(confirm = false): void {
    this.dialogRef.close({
      confirm,
      isMandatory: this.isMandatory
      ,
    })
  }
}
