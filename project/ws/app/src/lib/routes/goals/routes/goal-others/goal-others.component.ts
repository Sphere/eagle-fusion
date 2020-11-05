import { Component } from '@angular/core'
import { NsGoal, BtnGoalsService } from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { TFetchStatus } from '@ws-widget/utils'

@Component({
  selector: 'ws-app-goal-others',
  templateUrl: './goal-others.component.html',
  styleUrls: ['./goal-others.component.scss'],
})
export class GoalOthersComponent {
  fetchGoalsStatus: TFetchStatus = 'none'
  othersGoals: NsGoal.IGoal[] = this.route.snapshot.data.othersGoals.data
  error = this.route.snapshot.data.othersGoals.error

  constructor(private route: ActivatedRoute, private goalsSvc: BtnGoalsService) {}

  updateGoals() {
    this.fetchGoalsStatus = 'fetching'
    this.othersGoals = []
    this.goalsSvc.getOthersGoals('isInIntranet').subscribe(response => {
      this.fetchGoalsStatus = 'done'
      this.othersGoals = response
    })
  }
}
