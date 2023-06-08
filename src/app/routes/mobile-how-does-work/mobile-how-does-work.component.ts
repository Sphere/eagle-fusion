import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'ws-mobile-how-does-work',
  templateUrl: './mobile-how-does-work.component.html',
  styleUrls: ['./mobile-how-does-work.component.scss'],
})
export class MobileHowDoesWorkComponent implements OnInit {
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
