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

  }

  // deleteContent() {
  //   this.onAction = true
  //   const observable =
  //     this.accessService.getCategory(this.contentMeta) === 'Knowledge Board'
  //       ? this.apiService.delete(
  //         `${CONTENT_DELETE}/${this.contentMeta.identifier}/kb${this.accessService.orgRootOrgAsQuery}`,
  //       )
  //       : this.apiService.post(`${CONTENT_DELETE}${this.accessService.orgRootOrgAsQuery}`, {
  //         identifier: this.contentMeta.identifier,
  //         author: this.accessService.userId,
  //         isAdmin: this.accessService.hasRole(['editor', 'admin']),
  //         actorName: this.accessService.userName,
  //         action: 'deleted',
  //         comment: this.commentsForm.value.comments,
  //       })
  //   observable.pipe(
  //     mergeMap(() =>
  //       this.notificationSvc
  //         .deleteContent(
  //           this.contentMeta as any,
  //           this.commentsForm.value.comments,
  //         )
  //         .pipe(
  //           catchError(() => {
  //             return of({} as any)
  //           }),
  //         ),
  //     ),
  //   ).subscribe(
  //     () => {
  //       this.dialogRef.close(true)
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.SUCCESS,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //     },
  //     error => {
  //       this.onAction = false
  //       if (error.status === 409) {
  //         this.dialog.open(ErrorParserComponent, {
  //           width: this.isMobile ? '90vw' : '600px',
  //           height: 'auto',
  //           data: {
  //             errorFromBackendData: error.error,
  //           },
  //         })
  //       }
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.CONTENT_FAIL,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //     },
  //   )
  // }
}
