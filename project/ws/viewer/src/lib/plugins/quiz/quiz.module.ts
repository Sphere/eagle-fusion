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
  MatTabsModule,
  MatProgressBarModule,
} from '@angular/material'

import { BtnFullscreenModule } from '@ws-widget/collection'
import { AssesmentOverviewComponent } from './components/assesment-overview/assesment-overview.component'
import { AssesmentModalComponent } from './components/assesment-modal/assesment-modal.component'
import { ViewAssesmentQuestionsComponent } from './components/view-assesment-questions/view-assesment-questions.component'
import { SlideDirective } from './directives/slide.directive'
import { AssesmentCloseModalComponent } from './components/assesment-close-modal/assesment-close-modal.component'
import { AssesmentQuestionResultComponent } from './components/assesment-question-result/assesment-question-result.component'
import { QuizModalComponent } from './components/quiz-modal/quiz-modal.component'
import { ViewQuizQuestionComponent } from './components/view-quiz-question/view-quiz-question.component'
import { CloseQuizModalComponent } from './components/close-quiz-modal/close-quiz-modal.component'
import { ConfirmmodalComponent } from './confirm-modal-component'

@NgModule({
  declarations: [
    QuizComponent,
    OverviewComponent,
    QuestionComponent,
    SubmitQuizDialogComponent,
    AssesmentOverviewComponent,
    AssesmentModalComponent,
    ViewAssesmentQuestionsComponent,
    SlideDirective,
    AssesmentCloseModalComponent,
    AssesmentQuestionResultComponent,
    QuizModalComponent,
    ViewQuizQuestionComponent,
    CloseQuizModalComponent,
    ConfirmmodalComponent,
  ],
  // tslint:disable-next-line:max-line-length
  entryComponents: [SubmitQuizDialogComponent, AssesmentModalComponent, AssesmentOverviewComponent, AssesmentCloseModalComponent,
    QuizModalComponent, CloseQuizModalComponent, ConfirmmodalComponent],
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
    MatTabsModule,
    MatProgressBarModule,
  ],
  exports: [QuizComponent],
})
export class QuizModule { }
