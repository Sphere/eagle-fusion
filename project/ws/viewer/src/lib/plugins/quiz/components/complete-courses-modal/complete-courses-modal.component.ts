import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
  standalone: false,
  selector: 'app-complete-courses-modal',
  templateUrl: './complete-courses-modal.component.html',
  styleUrls: ['./complete-courses-modal.component.scss'],
})
export class CompleteCoursesModalComponent implements OnInit {

  navigateNextCourse = true
  nextLevel = 0
  constructor(
    public dialogRef: MatDialogRef<CompleteCoursesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.navigateNextCourse = this.data.navigateNextCourse
    this.nextLevel = Number(this.data.competencyLevel) + 1
  }

  goToAshaHome() {
    this.dialogRef.close({ event: 'CLOSE' })
  }

  startNextCourse() {
    this.dialogRef.close({
      event: 'STARTNEXTCOURSE',
      competencyId: this.data.competencyId,
      competencyLevel: this.data.competencyLevel,
      nextLevelId: this.data.nextLevelId,
    })
  }
}
