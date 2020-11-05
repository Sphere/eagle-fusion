
// imports for Angular library
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

// import for custom routing module
import { LearningHubHomeRoutingModule } from './home-routing.module'

// import for custom component
import { LearningHubHomeComponent } from './home.component'

@NgModule({
  declarations: [LearningHubHomeComponent],
  imports: [
    CommonModule,
    LearningHubHomeRoutingModule,
  ],
})
export class LearningHubHomeModule { }
