import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DndQuizComponent } from './dnd-quiz.component'
import { DndQuizRoutingModule } from './dnd-quiz-routing.module'
@NgModule({
  declarations: [DndQuizComponent],
  imports: [
    CommonModule,
    DndQuizRoutingModule,
  ],
})
export class DndQuizModule { }
