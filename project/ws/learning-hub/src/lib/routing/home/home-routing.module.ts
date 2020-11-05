// imports for Angular Library
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'

// imports for Custom components
import { LearningHubHomeComponent } from './home.component'

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LearningHubHomeComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class LearningHubHomeRoutingModule { }
