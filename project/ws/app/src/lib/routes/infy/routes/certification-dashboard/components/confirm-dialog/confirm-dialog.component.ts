import { Component, OnInit, Inject } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

import {
  ICertificationDialogData,
  ICertificationDialogResult,
} from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'
import { CertificationDashboardService } from '../../services/certification-dashboard.service'

@Component({
  selector: 'ws-app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
  reasonCtrl: FormControl

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ICertificationDialogData,
    public dialogRef: MatDialogRef<ConfirmDialogComponent, ICertificationDialogResult>,
    private certificationDashboardSvc: CertificationDashboardService,
  ) {
    this.reasonCtrl = new FormControl('', [
      Validators.required,
      Validators.maxLength(
        this.data.approvalItem.record_type === 'result_verification' ? 500 : 1000,
      ),
    ])
  }

  ngOnInit() {}

  sendAction() {
    if (
      (this.data.approvalItem.record_type === 'budget_approval' &&
        this.data.actionType === 'decline' &&
        this.reasonCtrl.invalid) ||
      (this.data.approvalItem.record_type === 'result_verification' && this.reasonCtrl.invalid)
    ) {
      return
    }
    this.dialogRef.close({
      action: this.data.approvalItem.record_type,
      result: true,
      data: this.certificationDashboardSvc.getDialogActionData(this.data, this.reasonCtrl.value),
    })
  }
}
