import {
  Component, OnInit, ViewChild, ElementRef,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MobileScromAdapterService } from '../../../services/mobile-scrom-adapter.service'
import { LoggerService, SafeResourceUrlService } from '../../../../../library/ws-widget/utils/src/public-api'

@Component({
  standalone: false,
  selector: 'ws-scrom-player',
  templateUrl: './scrom-player.component.html',
  styleUrls: ['./scrom-player.component.scss'],

})
export class ScromPlayerComponent implements OnInit {
  iframeUrl: any
  isLandscapeModeEnforced = false
  @ViewChild('iframeElem', { static: false }) iframeElem!: ElementRef<HTMLIFrameElement>
  constructor(
    public route: ActivatedRoute,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly scormAdapterService: MobileScromAdapterService,
    private readonly logger: LoggerService
  ) {
    (window as any).API = this.scormAdapterService
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    const scormUrl = this.route.snapshot.queryParamMap.get('scormUrl')
    this.logger.log('>>>>>>>>>>>', scormUrl, this.route.snapshot.queryParamMap)
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
    this.scormAdapterService.setProperties({
      contentId: this.route.snapshot.queryParamMap.get('identifier') || '',
      userId: this.route.snapshot.queryParamMap.get('userId') || '',
      batchId: this.route.snapshot.queryParamMap.get('batchId') || '',
      courseId: this.route.snapshot.queryParamMap.get('courseId') || '',
      authorization: this.route.snapshot.queryParamMap.get('Authorization'),
      userToken: this.route.snapshot.queryParamMap.get('userToken'),
    })
    this.scormAdapterService.loadDataV2(req, header)

  }




  createIframeUrl(scormUrl: any) {
    this.logger.log(scormUrl)
    const safeUrl = this.safeResourceUrlSvc.trust(typeof scormUrl === 'string' ? scormUrl : undefined)
    if (!safeUrl) {
      this.logger.log('Blocked unsafe scormUrl', scormUrl)
      return
    }
    this.iframeUrl = safeUrl
  }

  receiveMessage(msg: any) {
    // /* tslint:disable-next-line */
    this.logger.log('msg=>', msg)
  }
}
