import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-app-goal-accept-card',
  templateUrl: './goal-accept-card.component.html',
  styleUrls: ['./goal-accept-card.component.scss'],
})
export class GoalAcceptCardComponent implements OnInit {
  @Input() accept: any

  isExpanded = false
  goalProgressBarStyle: { left: string } = { left: '0%' }
  constructor() { }

  ngOnInit() {
    if (this.accept) {
      this.accept.progress = 0.3
      const progress = Math.min(
        Math.round((this.accept.progress || 0) * 100),
        89,
      )
      this.goalProgressBarStyle = {
        left: `${progress}%`,
      }
    }
  }
}
