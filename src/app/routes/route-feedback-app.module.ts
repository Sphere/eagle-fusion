import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackModule } from '@ws/app'

@NgModule({
  declarations: [],
  imports: [CommonModule, FeedbackModule],
  exports: [FeedbackModule],
})
export class RouteFeedbackAppModule {}
