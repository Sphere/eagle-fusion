import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, OnDestroy } from '@angular/core'
import { SafeUrl } from '@angular/platform-browser'
import { IPreviewDevice } from '../../../modules/viewer/viewer.component'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-auth-card-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('mobile', { static: true }) mobile: ElementRef<any> | null = null
  @ViewChild('tab', { static: true }) tab: ElementRef<any> | null = null
  @ViewChild('desktop', { static: true }) desktop: ElementRef<any> | null = null
  identifier = ''
  mimeTypeRoute = ''
  routerSubscription!: Subscription
  iframeUrl: SafeUrl = ''
  actionType = 'Edit Content'
  previewDevices: IPreviewDevice[] = [
    { value: 'mobile', viewValue: this.mobile ? this.mobile.nativeElement.value : '', height: '812px', width: '375px' },
    { value: 'tab', viewValue: this.tab ? this.tab.nativeElement.value : '', height: '1024px', width: '768px' },
    {
      value: 'desktop',
      viewValue: this.desktop
        ? this.desktop.nativeElement.value ? this.desktop.nativeElement.value : 'Desktop'
        : 'Desktop',
      height: '950px',
      width: '1400px',
    },
  ]
  selected: IPreviewDevice = this.previewDevices[2]
  isXSmall = false

  constructor(private valueSvc: ValueService, private activatedRoute: ActivatedRoute, private router: Router) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  ngOnInit() {
    this.routerSubscription = this.activatedRoute.data.subscribe(data => {
      if (data.content) {
        this.identifier = data.content.identifier
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(data.content.mimeType)
        this.actionType = data.content.status === 'Draft' || data.content.status === 'Live' ? 'Edit Content' : 'Take Action'
      }
    })
    this.updateIframeUrl()
  }

  ngOnChanges() {
    this.updateIframeUrl()
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
  }

  ngAfterViewInit() {
    this.previewDevices = [
      { value: 'mobile', viewValue: this.mobile ? this.mobile.nativeElement.value : '', height: '812px', width: '375px' },
      { value: 'tab', viewValue: this.tab ? this.tab.nativeElement.value : '', height: '1024px', width: '768px' },
      {
        value: 'desktop',
        viewValue: this.desktop
          ? this.desktop.nativeElement.value ? this.desktop.nativeElement.value : 'Desktop'
          : 'Desktop',
        height: '950px',
        width: '1400px',
      },
    ]
    this.selected = this.previewDevices[2]
  }

  updateIframeUrl() {
    this.iframeUrl = `/viewer/${this.mimeTypeRoute}/${this.identifier}?preview=true`
  }

  takeAction() {
    this.router.navigateByUrl(`/author/editor/${this.identifier}`)
  }
}
