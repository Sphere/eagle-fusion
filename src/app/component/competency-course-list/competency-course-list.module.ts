import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'

import { CompetencyCourseListComponent } from './competency-course-list.component'
import { AshaLearningComponent } from './asha-learning/asha-learning.component'
import { AshaLearningCompletedComponent } from './asha-learning-completed/asha-learning-completed.component'
import { MatCardModule } from '@angular/material/card'
import { StepperComponent } from './stepper/stepper.component'

@NgModule({
  declarations: [
    CompetencyCourseListComponent,
    AshaLearningComponent,
    AshaLearningCompletedComponent,
    StepperComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [
    CompetencyCourseListComponent,
  ],
})
export class CompetencyCourseListModule { }
