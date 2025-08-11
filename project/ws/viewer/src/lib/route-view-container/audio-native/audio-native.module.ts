import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'


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
