import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { NSQuiz } from '../../quiz.model'

@Component({
  selector: 'viewer-view-assesment-questions',
  templateUrl: './view-assesment-questions.component.html',
  styleUrls: ['./view-assesment-questions.component.scss'],
})
export class ViewAssesmentQuestionsComponent implements OnInit {

  @Input() question: NSQuiz.IQuestion = {
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
  }
  @Output() itemSelected = new EventEmitter<string | Object>()
  constructor() { }

  ngOnInit() {
  }

}
