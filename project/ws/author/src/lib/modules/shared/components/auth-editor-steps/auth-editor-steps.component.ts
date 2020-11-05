import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { IAuthSteps } from '@ws/author/src/lib/interface/auth-stepper'

@Component({
  selector: 'ws-auth-editor-steps',
  templateUrl: './auth-editor-steps.component.html',
  styleUrls: ['./auth-editor-steps.component.scss'],
})
export class AuthEditorStepsComponent implements OnInit {
  @Input() currentStep = 0
  @Input() steps: IAuthSteps[] | null = null
  @Output() change = new EventEmitter<number>()
  constructor() {}

  ngOnInit() {}
}
