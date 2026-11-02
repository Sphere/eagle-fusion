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
  /** The creator's hint for the learner's chosen option (CKEditor HTML). */
  @Input() hint = ''
  /** After a wrong answer: the creator's hint for the correct option(s). */
  @Input() correctHint = ''
  @Output() resultEvent = new EventEmitter()
  constructor() { }

  emitResult() {
    this.resultEvent.emit('true')
  }
}
