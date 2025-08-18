import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'

import { ViewerTopBarComponent } from './viewer-top-bar.component'
import {
  BtnFullscreenModule, BtnPageBackModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  // BtnContentFeedbackModule,
  // DisplayContentTypeIconModule,
  // BtnContentFeedbackV2Module
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
    BtnFullscreenModule,
    BtnPageBackModule,
    MatTooltipModule,
    RouterModule,
    PipePartialContentModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    // BtnContentFeedbackModule,
    // BtnContentFeedbackV2Module,
  ],
  exports: [ViewerTopBarComponent],
  providers: [ValueService],
})
export class ViewerTopBarModule {
  isXSmall = false

  constructor() {

  }

}
