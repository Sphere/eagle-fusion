import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChallengeComponent } from './challenge.component'
import { ActivityCardModule } from '../activity-card/activity-card.module'
import { HorizontalScrollerModule } from '@ws-widget/utils'
import { MatCardModule, MatButtonModule, MatProgressSpinnerModule } from '@angular/material'

@NgModule({
  declarations: [ChallengeComponent],
  imports: [
    CommonModule,
    ActivityCardModule,
    HorizontalScrollerModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  exports: [ChallengeComponent],
})
export class ChallengeModule { }
