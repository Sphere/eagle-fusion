import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { EditorSharedModule } from '@ws/author/src/lib/routing/modules/editor/shared/shared.module'
import { QuizRoutingModule } from './quiz-routing.module'
import { AuthViewerModule } from '@ws/author/src/lib/modules/viewer/viewer.module'

import { QuizComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/components/quiz/quiz.component'
import { MatchTheFollowingComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/components/match-the-following/match-the-following.component'
import { MultipleChoiceQuestionComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/components/multiple-choice-question/multiple-choice-question.component'
import { FillUpsEditorComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/components/fill-ups-editor/fill-ups-editor.component'
import { QuestionEditorComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/components/question-editor/question-editor.component'
import { QuestionEditorSidenavComponent } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/shared/components/question-editor-sidenav/question-editor-sidenav.component'
import { QuizStoreService } from './services/store.service'
import { OpenPlainCkEditorComponent } from './shared/components/open-plain-ck-editor/open-plain-ck-editor.component'
import { RomanConvertPipe } from '@ws/author/src/lib/routing/modules/editor/routing/modules/quiz/shared/roman-convert.pipe'

@NgModule({
  declarations: [
    QuizComponent,
    QuestionEditorComponent,
    MatchTheFollowingComponent,
    MultipleChoiceQuestionComponent,
    FillUpsEditorComponent,
    QuestionEditorSidenavComponent,
    OpenPlainCkEditorComponent,
    RomanConvertPipe,

  ],
  imports: [
    CommonModule,
    SharedModule,
    EditorSharedModule,
    DragDropModule,
    QuizRoutingModule,
    AuthViewerModule,

  ],
  providers: [QuizStoreService],
  entryComponents: [OpenPlainCkEditorComponent],
})
export class QuizModule { }
