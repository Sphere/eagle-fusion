import { Component, OnInit, Inject, OnDestroy } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'
import {
  IFeedbackFilterObj,
  EFeedbackType,
  NsContent,
  IFeedbackFilterDialogData,
  EFeedbackRole,
} from '@ws-widget/collection'
import { FormGroup, FormControl } from '@angular/forms'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-feedback-filter-dialog',
  templateUrl: './feedback-filter-dialog.component.html',
  styleUrls: ['./feedback-filter-dialog.component.scss'],
})
export class FeedbackFilterDialogComponent implements OnInit, OnDestroy {
  filterForm: FormGroup
  feedbackTypeSub?: Subscription
  feedbackTypes: typeof EFeedbackType
  feedbackRoles: typeof EFeedbackRole
  contentTypes: typeof NsContent.EContentTypes
  typeToRoleMap: Map<EFeedbackType, EFeedbackRole>

  constructor(
    @Inject(MAT_DIALOG_DATA) public filterDialogData: IFeedbackFilterDialogData,
    private dialogRef: MatDialogRef<FeedbackFilterDialogComponent>,
  ) {
    this.feedbackTypes = EFeedbackType
    this.feedbackRoles = EFeedbackRole
    this.contentTypes = NsContent.EContentTypes

    const filterObj = this.filterDialogData.filterObj

    this.filterForm = new FormGroup({
      feedbackType: new FormControl(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ? filterObj.feedbackType : null,
      ),
      contentType: new FormControl(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ||
        this.filterDialogData.viewedBy === this.feedbackRoles.Author
          ? filterObj.contentType
          : null,
      ),
      showLimited: new FormControl(filterObj.showLimited),
    })

    this.typeToRoleMap = new Map([
      [EFeedbackType.Platform, EFeedbackRole.Platform],
      [EFeedbackType.ContentRequest, EFeedbackRole.Content],
      [EFeedbackType.ServiceRequest, EFeedbackRole.Service],
    ])
  }

  ngOnInit() {
    this.feedbackTypeSub = this.filterForm.controls['feedbackType'].valueChanges.subscribe(
      (value: EFeedbackType[]) => {
        if (!value.includes(EFeedbackType.Content)) {
          this.filterForm.controls['contentType'].patchValue(null)
        }
      },
    )
  }

  ngOnDestroy() {
    if (this.feedbackTypeSub && !this.feedbackTypeSub.closed) {
      this.feedbackTypeSub.unsubscribe()
    }
  }

  applyFilters() {
    const newFilterObj: IFeedbackFilterObj = { showLimited: this.filterForm.value['showLimited'] }

    const contentTypes = this.filterForm.value['contentType']
    const feedbackTypes = this.filterForm.value['feedbackType']

    if (contentTypes && contentTypes.length) {
      newFilterObj.contentType = contentTypes
    }

    if (feedbackTypes && feedbackTypes.length) {
      newFilterObj.feedbackType = feedbackTypes
    }

    this.dialogRef.close(newFilterObj)
  }

  showContentTypeControl(): boolean {
    if (
      !(
        this.filterDialogData.viewedBy === this.feedbackRoles.User ||
        this.filterDialogData.viewedBy === this.feedbackRoles.Author
      )
    ) {
      return false
    }

    if (this.filterDialogData.viewedBy === this.feedbackRoles.Author) {
      return true
    }

    const value: EFeedbackType[] = this.filterForm.controls['feedbackType'].value

    if (value && value.length && value.includes(EFeedbackType.Content)) {
      return true
    }

    return false
  }

  showFeedbackTypeFilter(feedbackType: EFeedbackType): boolean {
    const feedbackRole = this.typeToRoleMap.get(feedbackType)

    if (feedbackRole) {
      const roleDetail = this.filterDialogData.feedbackSummary.roles.find(
        role => role.role === feedbackRole,
      )

      if (roleDetail && roleDetail.enabled) {
        return true
      }
    }

    return false
  }
}
