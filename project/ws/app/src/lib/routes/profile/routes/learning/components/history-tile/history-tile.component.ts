import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ws-app-history-tile',
  templateUrl: './history-tile.component.html',
  styleUrls: ['./history-tile.component.scss'],
})
export class HistoryTileComponent implements OnInit {
  @Input() uniqueUsers!: number
  @Input() description!: string
  @Input() title!: string
  @Input() category1!: string
  @Input() category2!: string
  @Input() category3!: string
  @Output() clickEvent = new EventEmitter<string>()

  constructor() {}

  ngOnInit() {}
  onClick(type: string) {
    this.clickEvent.emit(type)
  }
}
