
import { Component, Inject } from '@angular/core'
import { GoalsError } from '../../_constants/goals-error.constants'
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'

interface IData {
  type: keyof typeof GoalsError,
  data: any
}

@Component({
  selector: 'ws-widget-btn-goals-error',
  templateUrl: './btn-goals-error.component.html',
  styleUrls: ['./btn-goals-error.component.scss'],
})
export class BtnGoalsErrorComponent {

  type: any = ''
  goalsError: any = GoalsError
  otherData: any

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) data: IData,
  ) {
    this.type = data.type
    this.otherData = data.data
  }

  showError(msg: string) {
    switch (this.type) {
      case GoalsError.CONTENT_ALREADY_EXISTS:
      case GoalsError.GOAL_TYPE_EMPTY:
      case GoalsError.INVALID_GOAL:
      case GoalsError.INVALID_GOAL_TYPE:
      case GoalsError.INVALID_USER:
      case GoalsError.META_NOT_FOUND:
      case GoalsError.PARENT_ALREADY_EXISTS:
        if (msg === 'failure') {
          return true
        }
        return false

      default:
        return false
    }
  }
}
