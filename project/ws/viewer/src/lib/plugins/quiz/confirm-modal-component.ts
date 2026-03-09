import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'viewer-confirm-modal-component',
  templateUrl: './confirm-modal-component.html',
  styleUrls: ['./confirm-modal-component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ConfirmmodalComponent implements OnInit {
  ratingsForm!: UntypedFormGroup
  contentMeta!: ISearchContent
  isSubmitPressed = false
  children = 0
  isNew = 'No'
  isMobile = false
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating!: number
  isMandatory: boolean = true

  constructor(
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ConfirmmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    public contentSvc: WidgetContentService,
    private logger: LoggerService,
    private translate: TranslateService
  ) {

    dialogRef.disableClose = true
  }

  ngOnInit() {
    this.logger.log("data", this.data)
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.ratingsForm = this.formBuilder.group({
      review: ['', Validators.required],
    })
    if (
      this.data.request &&
      this.data.request.courseRating &&
      this.data.request.courseRating.content &&
      this.data.request.courseRating.content.length > 0
    ) {
      this.logger.log("Data available:", this.data)

      const firstContent = this.data.request.courseRating.content[0]
      if (firstContent.rating) {
        this.logger.log("Rating:", firstContent.rating)
        this.logger.log("Review:", firstContent.review)

        this.selectedRating = firstContent.rating
        if (firstContent.rating <= 3 && !firstContent.review) {
          this.isMandatory = true
        }
        this.ratingsForm.controls.review.setValue(firstContent.review)
      } else {
        this.logger.error("Missing rating or review in content:", firstContent)
      }
    } else {
      this.logger.log("No course rating content available - this is normal for new ratings")
    }

  }

  redirect() {
    this.dialogRef.close({ event: 'CONFIRMED' })
  }
  setRating(rating: number) {
    this.logger.log(rating)
    this.selectedRating = rating
    this.logger.log("rating:", rating, this.ratingsForm.controls.review.value)
    if (rating <= 3 && (this.ratingsForm.controls.review.value === '' || this.ratingsForm.controls.review.value === null)) {
      this.isMandatory = true
    } else {
      this.isMandatory = false
    }
  }

  submitData() {
    if (!this.isMandatory && this.selectedRating) {
      this.logger.log("yes here")
      this.submitRating(this.ratingsForm)
    }
  }

  submitRating(ratingsForm: any) {
    let userId = ''
    if (this.selectedRating) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      let req
      if (this.data) {
        req = {
          activityId: this.data.request.courseId,
          userId,
          activityType: 'Course',
          rating: this.selectedRating,
          review: ratingsForm.value.review ? ratingsForm.value.review : null,
          recommended: this.selectedRating >= 3 ? 'yes' : 'no',
        }
      }

      this.contentSvc.submitCourseRating(req)
        .then((data: any) => {
          if (data && data.params && data.params.status === 'Successful') {
            this.openSnackbar(this.translate.instant("FEEDBACK_SUCCESS"))
            this.dialogRef.close({ event: 'CONFIRMED' })
          } else {
            this.dialogRef.close({ event: 'CONFIRMED' })
            this.openSnackbar(this.translate.instant("ERROR_MSG"))
          }
        })
        .catch((err: any) => {
          if (err && err.error && err.error.message) {
            this.openSnackbar(this.translate.instant(err.error.message))
          } else {
            this.openSnackbar(this.translate.instant("ERROR_MSG1"))
          }
        })
    }
  }

  openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
