import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { NsContent } from '../_services/widget-content.model'
import { BtnGoalsDialogComponent } from './btn-goals-dialog/btn-goals-dialog.component'
import { NsGoal } from './btn-goals.model'
import { ConfigurationsService } from '../../../../utils/src/public-api'

const VALID_CONTENT_TYPES: NsContent.EContentTypes[] = [
  NsContent.EContentTypes.MODULE,
  NsContent.EContentTypes.KNOWLEDGE_ARTIFACT,
  NsContent.EContentTypes.COURSE,
  NsContent.EContentTypes.PROGRAM,
  NsContent.EContentTypes.RESOURCE,
]

@Component({
  selector: 'ws-widget-btn-goals',
  templateUrl: './btn-goals.component.html',
  styleUrls: ['./btn-goals.component.scss'],
})
export class BtnGoalsComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<NsGoal.IBtnGoal> {
  @Input() widgetData!: NsGoal.IBtnGoal
  @Input() forPreview = false
  @Input() status?: string
  isValidContent = false
  isGoalsEnabled = false

  constructor(private dialog: MatDialog, private configSvc: ConfigurationsService) {
    super()
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
    }
    if (
      this.widgetData &&
      this.widgetData.contentType &&
      VALID_CONTENT_TYPES.includes(this.widgetData.contentType)
    ) {
      this.isValidContent = true
    }
  }

  openDialog() {
    if (!this.forPreview) {
      this.dialog.open(BtnGoalsDialogComponent, {
        width: '600px',
        data: {
          contentId: this.widgetData.contentId,
          contentName: this.widgetData.contentName,
        },
      })
    }
  }
}
