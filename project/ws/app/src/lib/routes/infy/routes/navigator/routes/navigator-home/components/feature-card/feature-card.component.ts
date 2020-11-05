import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-app-feature-card',
  templateUrl: './feature-card.component.html',
  styleUrls: ['./feature-card.component.scss'],
})
export class FeatureCardComponent implements OnInit {
  @Input() url = ''
  @Input() name = ''
  @Input() description = ''
  @Input() active = true
  @Input() groupId = 0

  constructor() {}

  ngOnInit() {}
}
