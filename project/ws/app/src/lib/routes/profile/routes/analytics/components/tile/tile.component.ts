import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
})
export class TileComponent implements OnInit {
  @Input() icon = ''
  @Input() value = 0
  @Input() subTitle = ''
  constructor() { }

  ngOnInit() {
    if (this.value === null) {
      this.value = 0
    }
  }

}
