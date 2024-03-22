import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { ConfigurationsService, ValueService } from '@ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
@Component({
  selector: 'viewer-confirm-modal-component',
  templateUrl: './confirm-modal-component.html',
  styleUrls: ['./confirm-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ConfirmmodalComponent implements OnInit {
  ratingsForm!: FormGroup
  contentMeta!: ISearchContent
  isSubmitPressed = false
  children = 0
  isNew = 'No'
  isMobile = false
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating!: number
  constructor(
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ConfirmmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    public contentSvc: WidgetContentService,
  ) { dialogRef.disableClose = true }


  done() {
    this.dialogRef.close({ event: 'CONFIRMED' })
  }
  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.ratingsForm = this.formBuilder.group({
      review: ['', Validators.required], // Add validation if needed
    })
  }
  setRating(rating: number) {
    this.selectedRating = rating
  }
  submitData() {
    if (
      this.ratingsForm.controls.review.value && this.selectedRating) {
      this.submitRating(this.ratingsForm)
    }
  }
  submitRating(ratingsForm: any) {
    console.log("this.data", this.data)
    let userId = ''
    if (ratingsForm) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      let req
      if (this.data) {
        req = {
          activityId: this.data.request.courseId,
          userId,
          activityType: "Course",
          rating: this.selectedRating,
          review: ratingsForm.value.review,
          recommended: this.selectedRating >= 3 ? 'yes' : 'no',
        }
      }

      this.contentSvc.submitCourseRating(req).then((data: any) => {
        if (data && data.params && data.params.status === 'Successful') {
          this.openSnackbar('Thank You for your feedback!')
          this.dialogRef.close({ event: 'CONFIRMED' })
        } else {
          this.dialogRef.close({ event: 'CONFIRMED' })
          this.openSnackbar('Something went wrong, please try again later!')
        }
      })
        .catch((err: any) => {
          console.log("err", err)
          this.openSnackbar(err.error.message)
        })
    }

  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
