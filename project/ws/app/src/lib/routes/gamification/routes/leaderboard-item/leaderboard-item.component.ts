import { Component, OnInit, Input } from '@angular/core'
// import { GamificationService } from '../../services/gamification.service'

@Component({
  selector: 'ws-app-leaderboard-item',
  templateUrl: './leaderboard-item.component.html',
  styleUrls: ['./leaderboard-item.component.scss'],
})
export class LeaderboardItemComponent implements OnInit {
  @Input() leaderboardItem!: any

  constructor() { }

  ngOnInit() {
  }
}
