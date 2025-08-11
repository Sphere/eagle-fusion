import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PipeLimitToPipe } from '@ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.pipe'

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'


import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  BtnFullscreenModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  DisplayContentTypeModule,
  // UserContentRatingModule,
  UserImageModule,
  // BtnContentFeedbackV2Module,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

// import { HtmlRoutingModule } from './html-routing.module'

import { HtmlModule as HtmlPluginModule } from '../../plugins/html/html.module'

import { HtmlComponent } from './html.component'
import { SharedModule } from '../../../../../author/src/lib/modules/shared/shared.module'
// import { ViewerCourseInfoModule } from '../../plugins/viewer-course-info/viewer-course-info.module'

@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    HtmlPluginModule,
    RouterModule,
    // HtmlRoutingModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    BtnFullscreenModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    // UserContentRatingModule,
    // BtnContentFeedbackV2Module,
    // PlayerBriefModule,
    // ViewerCourseInfoModule,
    SharedModule
  ],
  providers: [PipeLimitToPipe],
  exports: [HtmlComponent],
})
export class HtmlModule { }
