import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss']
})
export class AssessmentDetailComponent implements OnInit {
  @Input() duration = 0
  @Input() quizJson = {
    timeLimit: 0,
    questions: [
      {
        multiSelection: false,
        question: '',
        questionId: '',
        options: [
          {
            optionId: '',
            text: '',
            isCorrect: false,
          },
        ],
      },
    ],
    isAssessment: false,
  }
  constructor() { }

  ngOnInit() {
  }

}
