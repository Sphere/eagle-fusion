import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ws-app-app-toc-analytics-tiles',
  templateUrl: './app-toc-analytics-tiles.component.html',
  styleUrls: ['./app-toc-analytics-tiles.component.scss'],
})
export class AppTocAnalyticsTilesComponent implements OnInit {
  @Input() uniqueUsers!: number
  @Input() description!: string
  @Input() title!: string
  @Input() category1!: string
  @Input() category2!: string
  @Input() category3!: string
  @Input() analyticsDataClient: any
  @Output() clickEvent = new EventEmitter<string>()

  constructor() { }

  ngOnInit() {
  }
  onClick(type: string) {
    this.clickEvent.emit(type)
  }
}
