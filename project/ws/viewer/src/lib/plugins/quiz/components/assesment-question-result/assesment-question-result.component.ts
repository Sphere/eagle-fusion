import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'viewer-assesment-question-result',
  templateUrl: './assesment-question-result.component.html',
  styleUrls: ['./assesment-question-result.component.scss'],
})
export class AssesmentQuestionResultComponent implements OnInit {
  @Input() answer: any
  @Input() isCorrect: any
  @Input() isExplanation: any
  @Output() resultEvent = new EventEmitter()
  constructor() { }

  ngOnInit() {
  }
  emitResult() {
    this.resultEvent.emit('true')
  }
}
