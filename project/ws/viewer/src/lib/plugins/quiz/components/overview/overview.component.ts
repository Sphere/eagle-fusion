import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { NSQuiz } from '../../quiz.model'

@Component({
  selector: 'viewer-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @Input() learningObjective = ''
  @Input() complexityLevel = ''
  @Input() duration = 0
  @Input() timeLimit = 0
  @Input() noOfQuestions = 0
  @Output() userSelection = new EventEmitter<NSQuiz.TUserSelectionType>()

  constructor() { }

  ngOnInit() {
  }

  overviewed(event: NSQuiz.TUserSelectionType) {
    this.userSelection.emit(event)
  }
}
