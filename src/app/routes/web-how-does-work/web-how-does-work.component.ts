import { Component, OnInit, Input, Output, EventEmitter, ElementRef, effect } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ScrollService } from '../../services/scroll.service'
import { VideoPopupComponent } from '../how-does-it-works-popup/how-does-it-works-popup.component'
import { MatDialog } from '@angular/material/dialog'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-how-does-work',
  templateUrl: './web-how-does-work.component.html',
  styleUrls: ['./web-how-does-work.component.scss'],
})
export class WebHowDoesWorkComponent implements OnInit {
  @Input() config: any = {}
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()
  videoData: any[] = []
  isXSmall$ = false
  constructor(
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private valueSvc: ValueService
  ) {
    effect(() => {
      this.isXSmall$ = this.valueSvc?.isMobile() ? true : false
    })
  }

  ngOnInit() {
    if (!this.config.data) {
      this.config = JSON.parse(localStorage.getItem('videoData'))
    }
    this.config?.data.forEach((element: any) => {
      if (element.url) {
        element.url = typeof (element.url) == 'string' ? this.sanitizeUrl(element.url) : element.url
      }
      this.videoData.push(element)
    })
    this.scrollService.scrollToDivEvent.subscribe((targetDivId: string) => {
      if (targetDivId === 'scrollToHowSphereWorks') {
        this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }

  sanitizeUrl(url?: string): SafeResourceUrl | null {
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null
  }
  openVideoPopup(url: string) {
    this.dialog.open(VideoPopupComponent, {
      data: { 'url': url },
      panelClass: 'howDoesItWorksDialog',
    })
  }
}
