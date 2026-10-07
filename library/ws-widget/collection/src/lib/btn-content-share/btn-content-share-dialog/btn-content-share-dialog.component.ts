import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes'
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, EventService } from '@ws-widget/utils'
import { WidgetContentShareService } from '../../_services/widget-content-share.service'
import { NsContent } from '../../_services/widget-content.model'
import { ICommon } from '../../_models/common.model'
import * as htmlToImage from 'html-to-image'
import { TranslateService } from '@ngx-translate/core'
import { courseSlug } from '../../../../../../../src/app/constants/courseSlug'

@Component({
  standalone: false,
  selector: 'ws-widget-btn-content-share-dialog',
  templateUrl: './btn-content-share-dialog.component.html',
  styleUrls: ['./btn-content-share-dialog.component.scss'],

})
export class BtnContentShareDialogComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON]
  errorType: 'NoDomain' | 'InvalidDomain' | 'None' = 'None'
  sendInProgress = false
  message = ''
  isSocialMediaShareEnabled = false
  qrdata = ''
  sendStatus: 'INVALID_IDS_ALL' | 'SUCCESS' | 'INVALID_ID_SOME' | 'ANY' | 'NONE' = 'NONE'
  constructor(
    public events: EventService,
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BtnContentShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { content: NsContent.IContent },
    public shareSvc: WidgetContentShareService,
    public configSvc: ConfigurationsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translate: TranslateService,
  ) { }

  ngOnInit() {
    this.qrdata = this.publicUrl

    this.shareSvc.fetchConfigFile().subscribe((data: ICommon) => {
      if (data && data.shareMessage) {
        this.message = data.shareMessage
      } else {
        this.message = 'I want to share this artifact I found.'
      }
      this.cdr.detectChanges()
    })

    if (this.configSvc.restrictedFeatures) {
      this.isSocialMediaShareEnabled =
        !this.configSvc.restrictedFeatures.has('socialMediaFacebookShare') ||
        !this.configSvc.restrictedFeatures.has('socialMediaLinkedinShare') ||
        !this.configSvc.restrictedFeatures.has('socialMediaTwitterShare') ||
        !this.configSvc.restrictedFeatures.has('socialMediaWhatsappShare')
    }
  }

  saveAsImage(code: any) {
    htmlToImage.toPng(code.qrcElement.nativeElement)
      .then((dataUrl: string) => {
        const link = document.createElement('a')
        link.download = 'qrcode.png'
        link.href = dataUrl
        link.click()
      })
  }

  /**
   * The course's public page, the URL the sitemap and canonical tag use. Shared links and
   * the QR point here rather than at /app/toc, which needs a login and is not prerendered,
   * so link previews (WhatsApp, Teams, LinkedIn) would only see the portal's home tags.
   */
  get publicUrl(): string {
    const content = this.data.content
    const slug = courseSlug(content.name) || content.identifier
    return `${location.origin}/public/toc/overview/${content.identifier}/${slug}/`
  }

  get detailUrl() {
    let locationOrigin = location.origin
    if (this.configSvc.activeLocale && this.configSvc.activeLocale.path) {
      locationOrigin += `/${this.configSvc.activeLocale.path}`
    }
    switch (this.data.content.contentType) {
      case NsContent.EContentTypes.CHANNEL:
        return `${locationOrigin}${this.data.content.artifactUrl}`
      case NsContent.EContentTypes.KNOWLEDGE_BOARD:
        return `${locationOrigin}/app/knowledge-board/${this.data.content.identifier}`
      default:
        return this.publicUrl
    }
  }

  copyLink() {
    const done = (key: string) => this.snackBar.open(this.translate.instant(key), undefined, { duration: 3000 })
    navigator.clipboard.writeText(this.publicUrl).then(
      () => done('LINK_COPIED'),
      () => done('COPY_LINK_FAILED'),
    )
  }

  raiseTelemetry() {
    const extras = {
      values: [
        {
          contentId: this.data.content.identifier,
          contentType: this.data.content.contentType,
        },
      ],
    }
    this.events.raiseInteractTelemetry('btn-clicked', 'share', 'content', {
      id: this.data.content.identifier,
      type: this.data.content.contentType,
      version: "",
      rollup: {},
    }, extras
    )
  }
}
