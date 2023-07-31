import { Component, OnInit, AfterViewInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { MobileScromAdapterService } from '../../../services/mobile-scrom-adapter.service'

@Component({
  selector: 'ws-scrom-player',
  templateUrl: './scrom-player.component.html',
  styleUrls: ['./scrom-player.component.scss']
})
export class ScromPlayerComponent implements OnInit, AfterViewInit {
  iframeUrl: any

  constructor(public route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private scormAdapterService: MobileScromAdapterService,
  ) {
    (window as any).API = this.scormAdapterService
    // if (window.addEventListener) {
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    this.scormAdapterService.LMSInitialize()
    const scormUrl = this.route.snapshot.paramMap.get('scormUrl')
    console.log('>>>>>>>>>>>', scormUrl)
    this.createIframeUrl(scormUrl)
  }
  ngAfterViewInit() {


  }
  createIframeUrl(scormUrl: any) {
    this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://sphere.aastrika.org/apis/proxies/v8/getContents/content/html/do_11363377478112870411138-latest/index_lms.html')
  }


  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    console.log("msg=>", msg)
  }



}
