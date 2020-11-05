import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsGoal, BtnGoalsService } from '@ws-widget/collection'
import { TFetchStatus } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-goal-me',
  templateUrl: './goal-me.component.html',
  styleUrls: ['./goal-me.component.scss'],
})
export class GoalMeComponent implements OnInit {
  fetchGoalsStatus: TFetchStatus = 'none'
  userGoals: NsGoal.IUserGoals = this.route.snapshot.data.userGoals.data
  error = this.route.snapshot.data.userGoals.error

  type = this.route.snapshot.data.type || 'all'

  constructor(private route: ActivatedRoute, private goalsSvc: BtnGoalsService) {}

  ngOnInit() {
    // TODO: remove hardcoding of goal progress
    // this.userGoals.goalsInProgress = this.userGoals.goalsInProgress.map(goal => {
    //   goal.progress = Math.random()
    //   return goal
    // })
  }

  updateGoals() {
    this.fetchGoalsStatus = 'fetching'
    this.userGoals = { completedGoals: [], goalsInProgress: [] }
    this.goalsSvc.getUserGoals(NsGoal.EGoalTypes.USER, 'isInIntranet').subscribe(response => {
      this.fetchGoalsStatus = 'done'
      this.userGoals = response
    })
  }

  deletedGoal(id: string) {
    this.userGoals.goalsInProgress = this.userGoals.goalsInProgress.filter(goal => goal.id !== id)
    this.userGoals.completedGoals = this.userGoals.completedGoals.filter(goal => goal.id !== id)
  }
}
