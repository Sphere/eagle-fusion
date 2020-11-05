import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'

import { IRequestFilterDialogResult } from '../../../../../app-toc/routes/app-toc-certification/models/certification.model'

@Component({
  selector: 'ws-app-request-filter-dialog',
  templateUrl: './request-filter-dialog.component.html',
  styleUrls: ['./request-filter-dialog.component.scss'],
})
export class RequestFilterDialogComponent implements OnInit {
  filterForm: FormGroup
  readonly defaultStartDate: Date
  readonly defaultEndDate: Date

  constructor(
    @Inject(MAT_DIALOG_DATA) public pageType: 'approver' | 'user',
    private dialogRef: MatDialogRef<RequestFilterDialogComponent, IRequestFilterDialogResult>,
  ) {
    this.defaultStartDate = new Date(new Date().getFullYear(), 0, 1)
    this.defaultEndDate = new Date()

    this.filterForm = new FormGroup({
      type: new FormControl('all'),
      startDate: new FormControl(this.defaultStartDate),
      endDate: new FormControl(this.defaultEndDate),
    })

    this.setConditionalValidators()
  }

  ngOnInit() {}

  applyFilters() {
    if (this.filterForm.invalid) {
      return
    }

    const dialogResult: IRequestFilterDialogResult = {
      type: this.filterForm.value.type,
      startDate: this.filterForm.value.startDate,
      endDate: this.filterForm.value.endDate,
    }

    this.dialogRef.close(dialogResult)
  }

  private setConditionalValidators() {
    if (this.pageType === 'user') {
      const startDateCtrl = this.filterForm.get('startDate')
      const endDateCtrl = this.filterForm.get('endDate')

      if (startDateCtrl && endDateCtrl) {
        startDateCtrl.setValidators([Validators.required, this.datePickerValidator.bind(this)])
        endDateCtrl.setValidators([Validators.required, this.datePickerValidator.bind(this)])
      }
    }
  }

  private datePickerValidator(): ValidationErrors | null {
    try {
      const startDate: Date = new Date(this.filterForm.controls.startDate.value)
      const endDate: Date = new Date(this.filterForm.controls.endDate.value)

      if (!(startDate && endDate)) {
        return null
      }

      if (startDate.getTime() > endDate.getTime()) {
        return {
          invalidDate: true,
        }
      }

      return null
    } catch (error) {
      return {
        invalidDate: true,
      }
    }
  }
}
