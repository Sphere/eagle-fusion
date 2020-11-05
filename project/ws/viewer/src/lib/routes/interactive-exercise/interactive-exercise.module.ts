import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InteractiveExerciseComponent } from './interactive-exercise.component'
import { InteractiveExerciseRoutingModule } from './interactive-exercise-routing.module'
@NgModule({
  declarations: [InteractiveExerciseComponent],
  imports: [
    CommonModule,
    InteractiveExerciseRoutingModule,
  ],
})
export class InteractiveExerciseModule { }
