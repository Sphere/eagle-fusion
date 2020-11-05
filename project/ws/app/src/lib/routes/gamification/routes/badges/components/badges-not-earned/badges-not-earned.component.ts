import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-app-badges-not-earned',
  templateUrl: './badges-not-earned.component.html',
  styleUrls: ['./badges-not-earned.component.scss'],
})
export class BadgesNotEarnedComponent implements OnInit {
  constructor() { }
  @Input()
  badge!: any

  ngOnInit() { }
}
