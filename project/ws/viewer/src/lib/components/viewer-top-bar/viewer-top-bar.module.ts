import { GoalsModule } from './../../../../../app/src/lib/routes/goals/goals.module'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatDialogModule,
} from '@angular/material'
import { ViewerTopBarComponent } from './viewer-top-bar.component'
import {
  BtnFullscreenModule, BtnPageBackModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  BtnContentFeedbackModule,
  // DisplayContentTypeIconModule,
  BtnContentFeedbackV2Module,
  DownloadCertificateModule,
} from '@ws-widget/collection'
import { RouterModule } from '@angular/router'
import { ValueService, PipePartialContentModule } from '@ws-widget/utils'
@NgModule({
  declarations: [ViewerTopBarComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    BtnFullscreenModule,
    BtnPageBackModule,
    MatTooltipModule,
    RouterModule,
    PipePartialContentModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    GoalsModule,
    DownloadCertificateModule,
  ],
  exports: [ViewerTopBarComponent],
  providers: [ValueService],
})
export class ViewerTopBarModule {
  isXSmall = false

  constructor() {

  }

}
