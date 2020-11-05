import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService } from '../../../../utils/src/public-api'
import { NsContent } from '../_services/widget-content.model'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog/btn-content-share-dialog.component'

@Component({
  selector: 'ws-widget-btn-content-share',
  templateUrl: './btn-content-share.component.html',
  styleUrls: ['./btn-content-share.component.scss'],
})
export class BtnContentShareComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsContent.IContent> {
  @Input() widgetData!: NsContent.IContent
  @Input() isDisabled = false
  @Input() showText = false
  @Input() forPreview = false
  showBtn = false
  isShareEnabled = false

  constructor(private dialog: MatDialog, private configSvc: ConfigurationsService) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }
    // tslint:disable-next-line: max-line-length
    this.showBtn = this.configSvc.rootOrg !== 'RootOrg'
  }

  shareContent() {
    if (!this.forPreview) {
      this.dialog.open<BtnContentShareDialogComponent, { content: NsContent.IContent }>(
        BtnContentShareDialogComponent,
        {
          data: { content: this.widgetData },
        },
      )
    }
  }
}
