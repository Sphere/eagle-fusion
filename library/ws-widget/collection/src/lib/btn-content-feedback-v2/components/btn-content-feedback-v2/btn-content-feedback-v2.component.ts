import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { IWidgetBtnContentFeedbackV2 } from '@ws-widget/collection'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { BtnContentFeedbackDialogV2Component } from '../btn-content-feedback-dialog-v2/btn-content-feedback-dialog-v2.component'
import { ConfigurationsService } from '../../../../../../utils/src/public-api'

@Component({
  selector: 'ws-widget-btn-content-feedback-v2',
  templateUrl: './btn-content-feedback-v2.component.html',
  styleUrls: ['./btn-content-feedback-v2.component.scss'],
})
export class BtnContentFeedbackV2Component extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetBtnContentFeedbackV2> {
  @Input() widgetData!: IWidgetBtnContentFeedbackV2
  @Input() forPreview = false
  isFeedbackEnabled = false
  constructor(private dialog: MatDialog, private configSvc: ConfigurationsService) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isFeedbackEnabled = !this.configSvc.restrictedFeatures.has('contentFeedback')
    }
  }

  openFeedbackDialog() {
    if (!this.forPreview) {
      this.dialog.open<BtnContentFeedbackDialogV2Component, IWidgetBtnContentFeedbackV2>(
        BtnContentFeedbackDialogV2Component,
        { data: this.widgetData, minWidth: '320px', width: '500px' },
      )
    }
  }
}
