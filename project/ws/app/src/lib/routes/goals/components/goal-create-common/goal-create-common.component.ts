import { Component, OnInit } from '@angular/core'
import { NsGoal, BtnGoalsService } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { TFetchStatus, EventService } from '@ws-widget/utils'
@Component({
  selector: 'ws-app-goal-create-common',
  templateUrl: './goal-create-common.component.html',
  styleUrls: ['./goal-create-common.component.scss'],
})
export class GoalCreateCommonComponent implements OnInit {

  commonGoals: NsGoal.IGoalsGroup[] = this.route.snapshot.data.commonGoals.data
  error = this.route.snapshot.data.commonGoals.error

  isExpanded: { [groupName: string]: boolean } = {}
  groupFetchStatus: { [groupId: string]: TFetchStatus } = {}

  constructor(private route: ActivatedRoute,
              private goalsSvc: BtnGoalsService,
              private events: EventService,
  ) { }

  ngOnInit() {
  }

  getGoalGroup(groupId: string) {
    this.isExpanded[groupId] = !this.isExpanded[groupId]
    const existingGroup = this.commonGoals.find(g => g.id === groupId)
    if (existingGroup && existingGroup.goals && existingGroup.goals.length) {
      return
    }
    this.groupFetchStatus[groupId] = 'fetching'
    this.goalsSvc.getGoalGroup(groupId).subscribe(
      (group: NsGoal.IGoalsGroup) => {
        this.groupFetchStatus[groupId] = 'done'
        if (existingGroup) {
          existingGroup.goals = group.goals
        }
      },
      () => {
        this.groupFetchStatus[groupId] = 'error'
      },
    )
  }

  goalCreated(groupId: string, goalId: string) {
    this.raiseTelemetry(goalId)
    const goalGroup = this.commonGoals.find(group => group.id === groupId)
    if (goalGroup) {

      goalGroup.goals = goalGroup.goals.filter(goal => goal.id !== goalId)
    }
  }
  raiseTelemetry(goalId: string) {
    this.events.raiseInteractTelemetry('goal', 'create', {
      goalId,
    })
  }
}
