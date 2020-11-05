import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-app-learning-home',
  templateUrl: './learning-home.component.html',
  styleUrls: ['./learning-home.component.scss'],
})
export class LearningHomeComponent implements OnInit {
  enabledTab = this.activatedRoute.snapshot.data.pageData.data.enabledTabs.learning.subTabs

  constructor(
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

}
