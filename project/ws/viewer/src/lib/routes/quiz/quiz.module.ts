import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatCardModule,
  MatDividerModule,
  MatButtonModule,
  MatDialogModule,
  MatToolbarModule,
  MatIconModule,
  MatSnackBarModule,
} from '@angular/material'

import {
  BtnContentDownloadModule,
  BtnContentFeedbackModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  UserContentRatingModule,
  BtnContentFeedbackV2Module,
  BtnPageBackModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

import { QuizComponent } from './quiz.component'
import { QuizRoutingModule } from './quiz-routing.module'
import { Viewertocmodalcomponent } from 'project/ws/viewer/src/lib/components/viewer-toc/viewer-toc-modal-component'
import { QuizModule as QuizViewContainerModule } from '../../route-view-container/quiz/quiz.module'

@NgModule({
  declarations: [QuizComponent, Viewertocmodalcomponent],
  entryComponents: [Viewertocmodalcomponent],
  imports: [
    CommonModule,
    QuizRoutingModule,
    QuizViewContainerModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    WidgetResolverModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    BtnPageBackModule,
  ],
})
export class QuizModule { }
