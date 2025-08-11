import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'


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
  BtnPageBackModule,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

import { QuizComponent } from './quiz.component'
import { QuizRoutingModule } from './quiz-routing.module'

import { QuizModule as QuizPluginModule } from '../../plugins/quiz/quiz.module'
import { SharedModule } from '../../../../../author/src/lib/modules/shared/shared.module'

@NgModule({
  declarations: [QuizComponent],
  imports: [
    CommonModule,
    QuizRoutingModule,
    QuizPluginModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    WidgetResolverModule,
    // UserContentRatingModule,
    // BtnContentFeedbackV2Module,
    BtnPageBackModule,
    //PlayerBriefModule,
    SharedModule
  ],
  exports: [
    QuizComponent,
  ],
})
export class QuizModule { }
