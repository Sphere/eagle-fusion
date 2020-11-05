import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { QuizComponent } from './quiz.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: QuizComponent,
    resolve: {
      content: ViewerResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewerResolve],
})
export class QuizRoutingModule { }
