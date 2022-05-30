import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { NSQuiz } from '../../quiz.model'

@Component({
  selector: 'viewer-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  // @Input() learningObjective = ''
  // @Input() complexityLevel = ''
  // @Input() duration = 0
  // @Input() timeLimit = 0
  // @Input() noOfQuestions = 0
  // @Input() progressStatus = ''
  // @Input() isNqocnContent = false
  // @Output() userSelection = new EventEmitter<NSQuiz.TUserSelectionType>()

  constructor(
    public dialogRef: MatDialogRef<OverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public submissionState: NSQuiz.TQuizSubmissionState,
  ) { }

  ngOnInit() {
  }

  // overviewed(event: NSQuiz.TUserSelectionType) {
  //   this.userSelection.emit(event)
  // }
}
