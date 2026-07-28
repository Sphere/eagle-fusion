import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
} from '@angular/core'
import { SafeResourceUrl } from '@angular/platform-browser'
import { SafeResourceUrlService } from '@ws-widget/utils'

export interface IPreviewDevice {
  value: string
  viewValue: string
  height: string
  width: string
}

@Component({
  standalone: false,
  selector: 'ws-auth-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],

})
export class ViewerComponent implements AfterViewInit, OnChanges {
  @ViewChild('mobile', { static: true }) mobile: ElementRef<any> | null = null
  @ViewChild('tab', { static: true }) tab: ElementRef<any> | null = null
  @ViewChild('desktop', { static: true }) desktop: ElementRef<any> | null = null
  @Input() identifier: string | null = null
  @Input() mimeTypeRoute: string | null = null
  rawIframeUrl = `author/toc/${this.identifier}/overview`
  iframeUrl: SafeResourceUrl | null = null
  previewDevices: IPreviewDevice[] = [
    {
      value: 'mobile',
      viewValue: this.mobile ? this.mobile.nativeElement.value : '',
      height: '812px',
      width: '375px',
    },
    {
      value: 'tab',
      viewValue: this.tab ? this.tab.nativeElement.value : '',
      height: '1024px',
      width: '768px',
    },
    {
      value: 'desktop',
      viewValue: this.desktop
        ? this.desktop.nativeElement.value
          ? this.desktop.nativeElement.value
          : 'Desktop'
        : 'Desktop',
      height: '950px',
      width: '1400px',
    },
  ]
  selected: IPreviewDevice = this.previewDevices[2]
  constructor(
    private readonly accessControlSvc: AccessControlService,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
  ) {
    this.iframeUrl = this.safeResourceUrlSvc.trust(this.rawIframeUrl)
  }

  ngOnChanges() {
    if (this.accessControlSvc.authoringConfig.newDesign) {
      if (this.mimeTypeRoute === 'channel') {
        this.rawIframeUrl = `author/viewer/channel/${this.identifier}`
      } else {
        this.rawIframeUrl = `author/toc/${this.identifier}/overview`
      }
    } else {
      this.rawIframeUrl = `/viewer/${this.mimeTypeRoute}/${this.identifier}?preview=true`
    }
    this.iframeUrl = this.safeResourceUrlSvc.trust(this.rawIframeUrl)
  }

  ngAfterViewInit() {
    this.previewDevices = [
      {
        value: 'mobile',
        viewValue: this.mobile ? this.mobile.nativeElement.value : '',
        height: '812px',
        width: '375px',
      },
      {
        value: 'tab',
        viewValue: this.tab ? this.tab.nativeElement.value : '',
        height: '1024px',
        width: '768px',
      },
      {
        value: 'desktop',
        viewValue: this.desktop
          ? this.desktop.nativeElement.value
            ? this.desktop.nativeElement.value
            : 'Desktop'
          : 'Desktop',
        height: '950px',
        width: '1400px',
      },
    ]
    this.selected = this.previewDevices[2]
  }

}
