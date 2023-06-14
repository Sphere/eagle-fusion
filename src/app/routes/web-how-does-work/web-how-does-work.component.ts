import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'ws-web-how-does-work',
  templateUrl: './web-how-does-work.component.html',
  styleUrls: ['./web-how-does-work.component.scss'],
})
export class WebHowDoesWorkComponent implements OnInit {
  @Input() data: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()

  constructor(private scrollService: ScrollService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToHowSphereWorks') {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    })

  }
  // openIframe(data?: any, index?: any) {
  //   const emitData = {
  //     videoData: data,
  //     videoIndex: index,
  //   }
  //   this.openPlayer.emit(emitData)
  // }
}
