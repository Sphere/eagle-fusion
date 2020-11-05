import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
} from '@angular/core'
import { SafeUrl } from '@angular/platform-browser'

export interface IPreviewDevice {
  value: string
  viewValue: string
  height: string
  width: string
}

@Component({
  selector: 'ws-auth-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('mobile', { static: true }) mobile: ElementRef<any> | null = null
  @ViewChild('tab', { static: true }) tab: ElementRef<any> | null = null
  @ViewChild('desktop', { static: true }) desktop: ElementRef<any> | null = null
  @Input() identifier: string | null = null
  @Input() mimeTypeRoute: string | null = null
  iframeUrl: SafeUrl = `author/toc/${this.identifier}/overview`
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
  // = {
  //   value: 'desktop',
  //   viewValue: this.desktop
  //     ? this.desktop.nativeElement.value ? this.desktop.nativeElement.value : 'Desktop'
  //     : 'Desktop',
  //   height: '950px',
  //   width: '1280px',
  // }
  constructor(private accessControlSvc: AccessControlService) {}

  ngOnInit() {}

  ngOnChanges() {
    if (this.accessControlSvc.authoringConfig.newDesign) {
      if (this.mimeTypeRoute === 'channel') {
        this.iframeUrl = `author/viewer/channel/${this.identifier}`
      } else {
        this.iframeUrl = `author/toc/${this.identifier}/overview`
      }
    } else {
      this.iframeUrl = `/viewer/${this.mimeTypeRoute}/${this.identifier}?preview=true`
    }
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
    // = {
    //   value: 'desktop',
    //   viewValue: this.desktop
    //     ? this.desktop.nativeElement.value ? this.desktop.nativeElement.value : 'Desktop'
    //     : 'Desktop',
    //   height: '950px',
    //   width: '1280px',
    // }
  }

  ngOnDestroy() {}
}
