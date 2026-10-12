import { Component, effect, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService } from '../../../../utils/src/public-api'
import { NsContent } from '../_services/widget-content.model'
import { BtnContentShareDialogComponent } from './btn-content-share-dialog/btn-content-share-dialog.component'
import { ThemeService } from '../../../../../../src/app/services/theme.service'

@Component({
  standalone: false,
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
  @Input() isTocBanner = false
  showBtn = false
  isShareEnabled = false
  isDark: boolean
  constructor(private readonly dialog: MatDialog, private readonly configSvc: ConfigurationsService, private readonly themeSvc: ThemeService) {
    super()
    effect(() => {
      this.isDark = this.themeSvc.isDark()
    })
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
          width: '90vw',
          maxWidth: '480px',
        },
      )
    }
  }
}
