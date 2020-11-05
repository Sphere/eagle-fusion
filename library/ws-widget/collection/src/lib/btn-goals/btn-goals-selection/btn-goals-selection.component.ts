import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core'
import { TFetchStatus, EventService } from '../../../../../utils/src/public-api'
import { NsGoal } from '../btn-goals.model'
import { BtnGoalsService } from '../btn-goals.service'
import { MatSnackBar, MatListOption } from '@angular/material'
import { BtnGoalsErrorComponent } from '../btn-goals-error/btn-goals-error.component'

@Component({
  selector: 'ws-widget-btn-goals-selection',
  templateUrl: './btn-goals-selection.component.html',
  styleUrls: ['./btn-goals-selection.component.scss'],
})
export class BtnGoalsSelectionComponent implements OnInit {
  @Input() contentId!: string
  @Input() contentName!: string

  @ViewChild('contentAdd', { static: true }) contentAddMessage!: ElementRef<any>
  @ViewChild('contentRemove', { static: true }) contentRemoveMessage!: ElementRef<any>
  @ViewChild('contentUpdateError', { static: true }) contentUpdateError!: ElementRef<any>

  @Output() closeDialog = new EventEmitter()

  fetchGoalStatus: TFetchStatus = 'none'
  goals: NsGoal.IGoal[] | null = null

  selectedGoals = new Set<string>()

  constructor(
    private snackBar: MatSnackBar,
    private goalsSvc: BtnGoalsService,
    private eventSvc: EventService,
  ) { }

  ngOnInit() {
    this.fetchGoalStatus = 'fetching'
    this.goalsSvc.getUserGoals(NsGoal.EGoalTypes.USER, 'isInIntranet').subscribe(response => {
      this.fetchGoalStatus = 'done'
      this.goals = (response.goalsInProgress || [])
        .concat(response.completedGoals)
        .filter(goal => goal.type === NsGoal.EGoalTypes.USER)
      this.goals.forEach(goal => {
        if (goal.contentIds.includes(this.contentId)) {
          this.selectedGoals.add(goal.id)
        }
      })
    })
  }

  selectionChange(option: MatListOption) {
    const goalId = option.value
    const checked = option.selected
    const goal = (this.goals || []).find(item => item.id === goalId)
    if (goal && checked) {
      this.raiseTelemetry('add', goalId, this.contentId)
      this.goalsSvc.addContentToGoal(goalId, this.contentId, NsGoal.EGoalTypes.USER).subscribe(
        () => {
          this.snackBar.open(this.contentAddMessage.nativeElement.value)
        }
        ,
        err => {
          this.snackBar.openFromComponent(BtnGoalsErrorComponent, {
            data: {
              type: err.error.errors[0].code,
            },
            duration: 10000,
          })

          this.selectedGoals.delete(goalId)
          option.toggle()
        },
      )
    } else if (goal && !checked) {
      this.raiseTelemetry('remove', goalId, this.contentId)
      this.goalsSvc.removeContentFromGoal(goalId, this.contentId, NsGoal.EGoalTypes.USER).subscribe(
        () => {
          this.snackBar.open(this.contentRemoveMessage.nativeElement.value)
        }
        ,
        err => {
          this.snackBar.openFromComponent(BtnGoalsErrorComponent, {
            data: {
              type: err.error.errors[0].code,
            },
            duration: 10000,
          })
          this.selectedGoals.add(goalId)
          option.toggle()
        },
      )
    }
  }

  raiseTelemetry(action: 'add' | 'remove', goalId: string, contentId: string) {
    this.eventSvc.raiseInteractTelemetry('goal', `btn-goal-${action}`, {
      goalId,
      contentId,
    })
  }
}
