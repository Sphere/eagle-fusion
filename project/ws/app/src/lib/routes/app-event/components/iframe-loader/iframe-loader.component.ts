import { Component, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { EiframeUrl } from '../../interfaces/event-details.model'
import { EventService } from '../../services/event.service'

@Component({
  selector: 'ws-app-iframe-loader',
  templateUrl: './iframe-loader.component.html',
  styleUrls: ['./iframe-loader.component.scss'],
})
export class IframeLoaderComponent implements OnInit {
  iframeSrc: SafeResourceUrl | null = null
  iframeUrl: string | null = null
  iframeType: string | null = null
  constructor(
    private domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private appEventSvc: EventService,
  ) { }

  ngOnInit() {
    this.appEventSvc.bannerisEnabled.next(false)
    this.iframeType = this.activatedRoute.snapshot.paramMap.get('iframe')
    if (this.iframeType === EiframeUrl.QUIZ) {
      this.iframeUrl = 'https://lab42.idemo-ppc.com/colligo/'
    } else if (this.iframeType === EiframeUrl.WEBEX) {
      this.iframeUrl = 'https://lab42.idemo-ppc.com/zoomonlex/'
    } else if (this.iframeType === EiframeUrl.VR) {
      this.iframeUrl = 'https://lab42.idemo-ppc.com/virtualevents/'
    }
    this.iframeSrc = this.iframeUrl ? this.domSanitizer.bypassSecurityTrustResourceUrl(this.iframeUrl) : null
  }

}
