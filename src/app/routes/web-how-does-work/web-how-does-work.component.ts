import { Component, OnInit, Input, Output, EventEmitter, ElementRef, effect } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ScrollService } from '../../services/scroll.service'
import { VideoPopupComponent } from '../how-does-it-works-popup/how-does-it-works-popup.component'
import { MatDialog } from '@angular/material/dialog'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
    standalone: false,
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
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
    })
  }

  getYoutubeThumbnail(url: any): string {
    const urlStr = typeof url === 'string' ? url : (url?.changingThisBreaksApplicationSecurity || '')
    const match = urlStr.match(/embed\/([a-zA-Z0-9_-]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : ''
  }
}
