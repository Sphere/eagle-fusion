import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'


import { WidgetResolverModule } from '@ws-widget/resolver'

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
  DefaultThumbnailModule,
  PipePartialContentModule,
  PipeSafeSanitizerModule,
} from '@ws-widget/utils'

// import { AudioNativeModule as AudioNativePluginModule } from '../../plugins/audio-native/audio-native.module'

import { AudioNativeComponent } from './audio-native.component'

@NgModule({
  declarations: [AudioNativeComponent],
  imports: [
    // AudioNativePluginModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentFeedbackV2Module,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    CommonModule,
    DefaultThumbnailModule,
    DisplayContentTypeModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSnackBarModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    RouterModule,
    // UserContentRatingModule,
    UserImageModule,
    WidgetResolverModule,
    PipeSafeSanitizerModule,
    // PlayerBriefModule,
  ],
  exports: [AudioNativeComponent],
})
export class AudioNativeModule { }
