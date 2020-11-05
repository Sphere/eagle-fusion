import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-goal-track-accept',
  templateUrl: './goal-track-accept.component.html',
  styleUrls: ['./goal-track-accept.component.scss'],
})
export class GoalTrackAcceptComponent implements OnInit {

  trackGoal: any
  error: any
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.route.parent && this.route.parent.snapshot) {
      this.trackGoal = this.route.parent.snapshot.data.trackGoal.data
      this.error = this.route.parent.snapshot.data.trackGoal.error
    }
  }
}
