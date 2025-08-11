import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'


import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  // UserContentRatingModule,
  // BtnContentFeedbackV2Module,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

import { VideoComponent } from './video.component'
import { RouterModule } from '@angular/router'
import { SharedModule } from '../../../../../author/src/lib/modules/shared/shared.module'

@NgModule({
  declarations: [VideoComponent],
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatButtonModule,
    WidgetResolverModule,
    PipeLimitToModule,
    PipePartialContentModule,
    PipeDurationTransformModule,
    // BtnContentDownloadModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    UserImageModule,
    // BtnContentFeedbackModule,
    DisplayContentTypeModule,
    //UserContentRatingModule,
    //BtnContentFeedbackV2Module,
    //PlayerBriefModule,
    SharedModule
  ],
  exports: [
    VideoComponent,
  ],
})
export class VideoModule { }
