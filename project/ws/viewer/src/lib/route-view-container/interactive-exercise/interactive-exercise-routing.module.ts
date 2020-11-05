import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { InteractiveExerciseComponent } from './interactive-exercise.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: InteractiveExerciseComponent,
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
export class InteractiveExerciseRoutingModule { }
