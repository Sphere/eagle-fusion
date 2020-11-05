import { Component, Input, OnInit } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { MatDialog } from '@angular/material'
import {
  BtnCallDialogComponent,
  IWidgetBtnCallDialogData,
} from './btn-call-dialog/btn-call-dialog.component'
import { EventService, ConfigurationsService } from '@ws-widget/utils'

export interface IWidgetBtnCall {
  userName: string
  userPhone: string
  replaceIconWithLabel?: boolean
}
@Component({
  selector: 'ws-widget-btn-call',
  templateUrl: './btn-call.component.html',
  styleUrls: ['./btn-call.component.scss'],
})
export class BtnCallComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<IWidgetBtnCall> {
  @Input() widgetData!: IWidgetBtnCall
  isCallEnabled = false

  constructor(private events: EventService, private dialog: MatDialog, private configSvc: ConfigurationsService) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isCallEnabled = !this.configSvc.restrictedFeatures.has('callUsers')
    }
  }

  showCallDialog() {
    this.raiseTelemetry()
    this.dialog.open<BtnCallDialogComponent, IWidgetBtnCallDialogData>(BtnCallDialogComponent, {
      data: {
        name: this.widgetData.userName,
        phone: this.widgetData.userPhone,
      },
    })
  }

  raiseTelemetry() {
    this.events.raiseInteractTelemetry(
      'call',
      'openDialog',
      {
        name: this.widgetData.userName,
        phone: this.widgetData.userPhone,
      },
    )
  }
}
