import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'
import { NsGoal } from '@ws-widget/collection/src/public-api'
import { PersonProfileService } from '../../services/person-profile.service'

@Component({
  selector: 'ws-app-user-goals',
  templateUrl: './user-goals.component.html',
  styleUrls: ['./user-goals.component.scss'],
})
export class UserGoalsComponent implements OnInit, OnChanges {
  @Input() wid = ''
  userGoals: NsGoal.IUserGoals | null = null
  fetchGoalsStatus: TFetchStatus = 'none'
  suggestionsLimit = 4
  isInitialized = false

  constructor(private personProfileSvc: PersonProfileService) { }

  ngOnInit() {
    if (this.wid) { this.fetchGoals() }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.wid.currentValue !== changes.wid.previousValue) && (this.isInitialized)) {
      this.wid = changes.wid.currentValue
      this.fetchGoals()
    }
  }

  fetchGoals() {
    this.fetchGoalsStatus = 'fetching'
    this.userGoals = { completedGoals: [], goalsInProgress: [] }
    this.personProfileSvc.getUserGoals(NsGoal.EGoalTypes.USER, 'isInIntranet', this.wid).subscribe(response => {
      this.fetchGoalsStatus = 'done'
      this.userGoals = response
    })
  }

}
