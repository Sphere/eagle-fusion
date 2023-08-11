import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatSnackBarModule,
  MatChipsModule,
  MatButtonModule,
} from '@angular/material'

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
