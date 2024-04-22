import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { ValueService } from '@ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-auth-course-rating-dialog',
  templateUrl: './course-rating-dialog.component.html',
  styleUrls: ['./course-rating-dialog.component.scss'],
})
export class CourseRatingDialogComponent implements OnInit {
  ratingsForm!: FormGroup
  contentMeta!: ISearchContent
  isSubmitPressed = false
  onAction = false
  children = 0
  isNew = 'No'
  isMobile = false
  stars: number[] = [1, 2, 3, 4, 5];
  selectedRating!: number
  constructor(
    private formBuilder: FormBuilder,

    public dialogRef: MatDialogRef<CourseRatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISearchContent,
    private valueSvc: ValueService,
  ) {
    dialogRef.disableClose = true
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
      this.dialogRef.close({ ratingsForm: this.ratingsForm, rating: this.selectedRating })
    }
  }

}
