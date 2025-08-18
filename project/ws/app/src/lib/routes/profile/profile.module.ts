import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { BtnPageBackModule } from '@ws-widget/collection'
import { LogoutModule } from '@ws-widget/utils'
// modules
import { ProfileRoutingModule } from './profile-routing.module'
// comps
import { ProfileComponent } from './profile.component'
// import { AnalyticsModule } from './routes/analytics/analytics.module'
// import { BadgesResolver2 } from './routes/badges/badges.resolver2'
// import { CompetencyModule } from './routes/competency/competency.module'
// import { CompetencyResolverService } from './routes/competency/resolver/assessment.resolver'
import { DashboardModule } from './routes/dashboard/dashboard.module'
// import { InterestModule } from './routes/interest/interest.module'
// import { InterestUserResolve } from './routes/interest/resolvers/interest-user.resolve'
// import { LearningModule } from './routes/learning/learning.module'
// import { LearningHistoryResolver } from './routes/learning/resolvers/learning-history.resolver'
// import { LearningTimeResolver } from './routes/learning/resolvers/learning-time.resolver'
import { SettingsModule } from './routes/settings/settings.module'
// import { BadgesModule } from './routes/badges/badges.module'
// import { BadgesModule } from '../gamification/routes/badges/badges.module'

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    // BadgesModule,
    CommonModule,
    ProfileRoutingModule,
    // CompetencyModule,
    DashboardModule,
    // InterestModule,
    // LearningModule,
    SettingsModule,
    // AnalyticsModule,
    BtnPageBackModule,
    LogoutModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  providers: [
    // InterestUserResolve,
    // BadgesResolver2,
    // CompetencyResolverService,
    // LearningTimeResolver,
    // LearningHistoryResolver,
  ],
})
export class ProfileModule { }
