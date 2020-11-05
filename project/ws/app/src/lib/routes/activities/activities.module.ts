import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { ActivitiesRoutingModule } from './activities-routing.module'
import { ActivitiesComponent } from './components/activities/activities.component'
import { ChallengeStripComponent } from './components/challenge-strip/challenge-strip.component'
import { ActivityCardModule } from '@ws-widget/collection/src/lib/activity-card/activity-card.module'

@NgModule({
  declarations: [ActivitiesComponent, ChallengeStripComponent],
  imports: [
    CommonModule,
    ActivitiesRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    HorizontalScrollerModule,
    ActivityCardModule,
  ],
})
export class ActivitiesModule { }
