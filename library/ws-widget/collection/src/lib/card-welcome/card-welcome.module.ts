import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatExpansionModule, MatIconModule } from '@angular/material'
import { HorizontalScrollerModule } from '@ws-widget/utils'
import { ActivitiesService } from '../../../../../../project/ws/app/src/lib/routes/activities/services/activities.service'
import { ActivityCardModule } from '../activity-card/activity-card.module'
import { TourModule } from '../_common/tour-guide/tour-guide.module'
import { UserImageModule } from '../_common/user-image/user-image.module'
import { CardWelcomeComponent } from './card-welcome.component'
import { ChallengeModule } from '../challenge/challenge.module'

@NgModule({
  declarations: [CardWelcomeComponent],
  imports: [
    CommonModule,
    UserImageModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    HorizontalScrollerModule,
    ActivityCardModule,
    TourModule,
    ChallengeModule,
  ],
  entryComponents: [CardWelcomeComponent],
  providers: [ActivitiesService],
})
export class CardWelcomeModule { }
