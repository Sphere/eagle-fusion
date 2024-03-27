import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, ValueService } from '@ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { ISearchContent } from '@ws/author/src/lib/interface/search'

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
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ConfirmmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    public contentSvc: WidgetContentService,
  ) {
    dialogRef.disableClose = true
  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    this.ratingsForm = this.formBuilder.group({
      review: ['', Validators.required],
    })
  }

  setRating(rating: number) {
    this.selectedRating = rating
  }

  submitData() {
    if (this.ratingsForm.controls.review.value && this.selectedRating) {
      this.submitRating(this.ratingsForm)
    }
  }

  submitRating(ratingsForm: any) {
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    let userId = ''
    if (ratingsForm.value.review) {
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
          review: ratingsForm.value.review,
          recommended: this.selectedRating >= 3 ? 'yes' : 'no',
        }
      }

      this.contentSvc.submitCourseRating(req)
        .then((data: any) => {
          if (data && data.params && data.params.status === 'Successful') {
            let message
            if (local === 'en') {
              message = `Thank You for your feedback!`
            } else {
              message = `आपकी प्रतिक्रिया के लिए आपका धन्यवाद!`
            }
            this.openSnackbar(message)
            this.dialogRef.close({ event: 'CONFIRMED' })
          } else {
            let message
            if (local === 'en') {
              message = `Something went wrong, please try again later!`
            } else {
              message = `कुछ गलत हो गया है। कृपया बाद में दोबारा प्रयास करें!`
            }
            this.dialogRef.close({ event: 'CONFIRMED' })
            this.openSnackbar(message)
          }
        })
        .catch((err: any) => {

          let message
          if (local === 'en') {
            message = `An error occurred, please try again later!`
          } else {
            message = `एक त्रुटि घटित हुई है, कृपया बाद में पुन: प्रयास करें!`
          }
          if (err && err.error && err.error.message) {
            this.openSnackbar(err.error.message)
          } else {
            this.openSnackbar(message)

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
