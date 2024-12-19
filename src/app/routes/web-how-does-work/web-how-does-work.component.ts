import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'
import { VideoPopupComponent } from '../how-does-it-works-popup/how-does-it-works-popup.component'
import { MatDialog } from '@angular/material/dialog'

@Component({
  selector: 'ws-web-how-does-work',
  templateUrl: './web-how-does-work.component.html',
  styleUrls: ['./web-how-does-work.component.scss'],
})
export class WebHowDoesWorkComponent implements OnInit {
  @Input() data: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()
  constructor(private scrollService: ScrollService, private elementRef: ElementRef, public dialog: MatDialog,
  ) { }
  ngOnInit() {
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToHowSphereWorks') {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    })

  }
  openVideoPopup(number: any) {
    this.dialog.open(VideoPopupComponent, {
      data: { 'number': number },
    })
  }
}
