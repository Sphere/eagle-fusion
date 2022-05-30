import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { QuizComponent } from './quiz.component'
import { OverviewComponent } from './components/overview/overview.component'
import { QuestionComponent } from './components/question/question.component'
import { SubmitQuizDialogComponent } from './components/submit-quiz-dialog/submit-quiz-dialog.component'

import { PipeDurationTransformModule, PipeLimitToModule } from '@ws-widget/utils'

import {
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatListModule,
  MatRadioModule,
  MatSidenavModule,
  MatTableModule,
  MatButtonModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
} from '@angular/material'

import { BtnFullscreenModule } from '@ws-widget/collection'
import { AssesmentOverviewComponent } from './components/assesment-overview/assesment-overview.component'

@NgModule({
  declarations: [
    QuizComponent,
    OverviewComponent,
    QuestionComponent,
    SubmitQuizDialogComponent,
    AssesmentOverviewComponent,
  ],
  entryComponents: [SubmitQuizDialogComponent, OverviewComponent],
  imports: [
    CommonModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatTableModule,
    MatButtonModule,
    BtnFullscreenModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [QuizComponent],
})
export class QuizModule { }
