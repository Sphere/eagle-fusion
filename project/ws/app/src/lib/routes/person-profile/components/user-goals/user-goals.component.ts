import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core'
import { TFetchStatus } from '@ws-widget/utils/src/public-api'

@Component({
  standalone: false,
  selector: 'ws-app-user-goals',
  templateUrl: './user-goals.component.html',
  styleUrls: ['./user-goals.component.scss'],

})
export class UserGoalsComponent implements OnInit, OnChanges {
  @Input() wid = ''
  fetchGoalsStatus: TFetchStatus = 'none'
  suggestionsLimit = 4
  isInitialized = false

  constructor(
  ) { }

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
  }

}
