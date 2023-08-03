import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { MobileScromAdapterService } from '../../../services/mobile-scrom-adapter.service'

@Component({
  selector: 'ws-scrom-player',
  templateUrl: './scrom-player.component.html',
  styleUrls: ['./scrom-player.component.scss'],
})
export class ScromPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  iframeUrl: any
  isLandscapeModeEnforced = false

  constructor(
    public route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private scormAdapterService: MobileScromAdapterService
  ) {
    (window as any).API = this.scormAdapterService
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    const scormUrl = this.route.snapshot.queryParamMap.get('scormUrl')
    console.log('>>>>>>>>>>>', scormUrl, this.route.snapshot.queryParamMap)
    this.createIframeUrl(scormUrl)
    this.scormAdapterService.contentId = this.route.snapshot.queryParamMap.get('identifier') || ''
    const req: any = {
      request: {
        userId: this.route.snapshot.queryParamMap.get('userId') || '',
        batchId: this.route.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.route.snapshot.queryParamMap.get('courseId') || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    const header = {
      Authorization: this.route.snapshot.queryParamMap.get('Authorization'),
      userToken: this.route.snapshot.queryParamMap.get('userToken'),
    }

    this.scormAdapterService.loadDataV2(req, header)

  }

  ngAfterViewInit() {
    this.checkAndEnforceLandscapeMode()
  }

  ngOnDestroy() {
    // this.releaseLandscapeModeLock()
  }

  checkAndEnforceLandscapeMode() {
    if (window.innerWidth < 380 && !this.isLandscapeModeEnforced) {
      this.isLandscapeModeEnforced = true
      const iframeElement: HTMLIFrameElement | null = document.querySelector('iframe.html-iframe')

      if (iframeElement) {
        iframeElement.style.height = '100vh'
        iframeElement.style.transform = 'rotate(90deg)'
        iframeElement.style.objectFit = 'cover'
      }

    }
  }



  createIframeUrl(scormUrl: any) {
    console.log(scormUrl)
    this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(scormUrl)
  }

  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    console.log('msg=>', msg)
  }
}
