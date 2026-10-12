import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  standalone: false,
  selector: 'viewer-assesment-question-result',
  templateUrl: './assesment-question-result.component.html',
  styleUrls: ['./assesment-question-result.component.scss'],

})
export class AssesmentQuestionResultComponent {
  @Input() answer: any
  @Input() isCorrect: any
  @Input() isExplanation: any
  @Output() resultEvent = new EventEmitter()
  constructor() { }

  emitResult() {
    this.resultEvent.emit('true')
  }
}
