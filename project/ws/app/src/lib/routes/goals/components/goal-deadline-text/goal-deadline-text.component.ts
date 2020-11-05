import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-app-goal-deadline-text',
  templateUrl: './goal-deadline-text.component.html',
  styleUrls: ['./goal-deadline-text.component.scss'],
})
export class GoalDeadlineTextComponent implements OnInit {

  @Input() endDate = 0
  deadlinePassed = false
  constructor() {
  }

  ngOnInit() {
    const now = new Date()
    const currentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime()
    this.deadlinePassed = this.endDate < currentTime
  }

}
