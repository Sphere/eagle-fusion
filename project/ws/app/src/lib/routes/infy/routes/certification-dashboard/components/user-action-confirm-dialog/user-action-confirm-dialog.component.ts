import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

import { IUserActionDialogData } from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'

@Component({
  selector: 'ws-app-user-action-confirm-dialog',
  templateUrl: './user-action-confirm-dialog.component.html',
  styleUrls: ['./user-action-confirm-dialog.component.scss'],
})
export class UserActionConfirmDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IUserActionDialogData,
    public dialogRef: MatDialogRef<UserActionConfirmDialogComponent>,
  ) {}

  ngOnInit() {}

  onAction() {
    this.dialogRef.close({
      confirmAction: true,
      requestType: this.data.approvalItem.record_type,
      action: this.data.actionType,
      certificationId: this.data.approvalItem.certification,
      slotNo: this.data.approvalItem.slotno,
      icfdId: this.data.approvalItem.icfdid,
    })
  }
}
