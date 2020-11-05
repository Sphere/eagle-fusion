import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DndQuizComponent } from './dnd-quiz.component'
import { DndSnippetComponent } from './components/dnd-snippet/dnd-snippet.component'

@NgModule({
  declarations: [DndQuizComponent, DndSnippetComponent],
  imports: [
    CommonModule,
  ],
})
export class DndQuizModule { }
