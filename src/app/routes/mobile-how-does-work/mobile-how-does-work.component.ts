import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core'
import { ScrollService } from '../../services/scroll.service'
import { MatDialog } from '@angular/material/dialog'
import { VideoPopupComponent } from '../how-does-it-works-popup/how-does-it-works-popup.component'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Component({
  selector: 'ws-mobile-how-does-work',
  templateUrl: './mobile-how-does-work.component.html',
  styleUrls: ['./mobile-how-does-work.component.scss'],
})
export class MobileHowDoesWorkComponent implements OnInit {
  @Input() config: any
  /** to listen the eevnt **/
  @Output() openPlayer = new EventEmitter()
  videoData: any[] = []
  constructor(
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.config?.data.forEach((element: any) => {
      if (element.url) {
        element.url = this.sanitizeUrl(element.url)
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
      panelClass: 'howDoesItWorksDialog'
    })
  }
}
