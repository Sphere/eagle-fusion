import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PageResolve } from '@ws-widget/utils'
import { ProfileComponent } from './profile.component'
// import { FeatureUsageComponent } from './routes/analytics/routes/feature-usage/feature-usage.component'
// import { LearningComponent } from './routes/analytics/routes/learning/learning.component'
// import { PlansComponent } from './routes/analytics/routes/plans/plans.component'
// import { AchievementsComponent } from './routes/competency/components/achievements/achievements.component'
// import { BadgesResolver2 } from './routes/badges/badges.resolver2'
// import { CardDetailComponent } from './routes/competency/components/card-detail/card-detail.component'
// import { CompetencyHomeComponent } from './routes/competency/components/competency-home/competency-home.component'
// import { CompetencyResolverService } from './routes/competency/resolver/assessment.resolver'
import { DashboardComponent } from './routes/dashboard/components/dashboard/dashboard.component'
// import { InterestComponent } from './routes/interest/components/interest/interest.component'
// import { InterestUserResolve } from './routes/interest/resolvers/interest-user.resolve'
// import { LearningHistoryComponent } from './routes/learning/components/learning-history/learning-history.component'
// import { LearningHomeComponent } from './routes/learning/components/learning-home/learning-home.component'
// import { LearningTimeComponent } from './routes/learning/components/learning-time/learning-time.component'
// import { LearningHistoryResolver } from './routes/learning/resolvers/learning-history.resolver'
// import { LearningTimeResolver } from './routes/learning/resolvers/learning-time.resolver'
import { SettingsComponent } from './routes/settings/settings.component'
// import { BadgeComponent } from '../gamification/routes/badges/components/badge/badge.component'
// import { BadgesComponent } from './routes/badges/badges.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent,
        children: routes,
        data: {
          pageType: 'feature',
          pageKey: 'profile',
        },
        resolve: {
          pageData: PageResolve,
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ProfileRoutingModule { }
