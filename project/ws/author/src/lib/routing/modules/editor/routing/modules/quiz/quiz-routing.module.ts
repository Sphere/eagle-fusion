import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { QuizComponent } from './components/quiz/quiz.component'

const routes: Routes = [
  {
    path: '',
    component: QuizComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class QuizRoutingModule {}
