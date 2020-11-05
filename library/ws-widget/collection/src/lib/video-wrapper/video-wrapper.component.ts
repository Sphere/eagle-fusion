import { Component, OnInit, Input } from '@angular/core'
import { WidgetBaseComponent, NsWidgetResolver } from '../../../../resolver/src/public-api'
import { IWidgetWrapperMedia } from './video-wrapper.model'
import { Platform } from '@angular/cdk/platform'

@Component({
  selector: 'ws-widget-video-wrapper',
  templateUrl: './video-wrapper.component.html',
  styleUrls: ['./video-wrapper.component.scss'],
})
export class VideoWrapperComponent extends WidgetBaseComponent implements
  OnInit, NsWidgetResolver.IWidgetData<IWidgetWrapperMedia> {

  @Input() widgetData!: IWidgetWrapperMedia
  constructor(private platform: Platform) {
    super()
  }

  ngOnInit() {
    if (this.widgetData) {
      if (this.widgetData.externalData) {
        if (!(this.widgetData.externalData.iframeSrc) && this.widgetData.videoData) {
          if (this.platform.IOS) {
            this.widgetData.videoData.isVideojs = true
          } else if ((!this.platform.WEBKIT) && (!this.platform.IOS) && (!this.platform.SAFARI)) {
            this.widgetData.videoData.isVideojs = true
          } else if (this.platform.ANDROID) {
            this.widgetData.videoData.isVideojs = true
          } else {
            this.widgetData.videoData.isVideojs = false
          }
        }
      }
    }

  }
}
