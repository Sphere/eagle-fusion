import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ws-mobile-how-does-work',
  templateUrl: './mobile-how-does-work.component.html',
  styleUrls: ['./mobile-how-does-work.component.scss'],
})
export class MobileHowDoesWorkComponent implements OnInit {
  @Input() data: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }
  openIframe(data?: any, index?: any) {
    const emitData = {
      videoData: data,
      videoIndex: index,
    }
    this.openPlayer.emit(emitData)
  }
}
