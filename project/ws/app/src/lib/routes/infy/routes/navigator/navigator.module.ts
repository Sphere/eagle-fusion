import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { NavigatorRoutingModule } from './navigator-routing.module'
import { AccountDetailsComponent } from './routes/account-details/account-details.component'
import { ExploreComponent } from './routes/explore/explore.component'
import { IndustriesComponent } from './routes/industries/industries.component'
import { LeadersComponent } from './routes/leaders/leaders.component'
import { LearningPathComponent } from './routes/learning-path/learning-path.component'
import { RolesComponent } from './routes/roles/roles.component'
import { NavigatorCardComponent } from './routes/explore/components/navigator-card/navigator-card.component'
import {
  PipeLimitToModule,
  HorizontalScrollerModule,
  DefaultThumbnailModule,
} from '@ws-widget/utils'
import { RoleCardComponent } from './routes/roles/components/role-card/role-card.component'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { PentagonModule } from '../../../infy/routes/marketing/pentagon/pentagon.module'
import { MultilineSnackbarComponent } from '../navigator/components/multiline-snackbar/multiline-snackbar.component'

import { BtnGoalsModule, BtnPageBackModule } from '@ws-widget/collection'

import {
  MatButtonModule,
  MatCardModule,
  MatListModule,
  MatRadioModule,
  MatChipsModule,
  MatSnackBarModule,
  MatInputModule,
  MatDialogModule,
  MatTooltipModule,
  MatTreeModule,
  MatIconModule,
  MatSidenavModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatExpansionModule,
  MatTabsModule,
  MatGridListModule,
  MatCheckboxModule,
} from '@angular/material'
import { NavigatorHomeComponent } from './routes/navigator-home/navigator-home.component'
import { FeatureCardComponent } from './routes/navigator-home/components/feature-card/feature-card.component'
import { ResultComponent } from './routes/learning-path/components/result/result.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RoleComponent } from './routes/role/role.component'
import { LpDetailsComponent } from './routes/lp-details/lp-details.component'
import { LpCardComponent } from './routes/lp-details/components/lp-card/lp-card.component'
import { FullstackProgramComponent } from './routes/fullstack-program/fullstack-program.component'
import { FsCardComponent } from './routes/fullstack-program/components/fs-card/fs-card.component'
import { LaunchpadComponent } from './routes/launchpad/launchpad.component'
import { IndustryComponent } from './routes/industry/industry.component'
import { FsHomeComponent } from './routes/fs-home/fs-home.component'
import { IndustryAnalyticsComponent } from './routes/industry-analytics/industry-analytics.component'
import { RoleDetailsComponent } from './routes/role/role-details/role-details.component'
import { BpmDetailsComponent } from './routes/bpm-details/bpm-details.component'

@NgModule({
  declarations: [
    AccountDetailsComponent,
    ExploreComponent,
    IndustriesComponent,
    LeadersComponent,
    LearningPathComponent,
    RolesComponent,
    NavigatorCardComponent,
    RoleCardComponent,
    NavigatorHomeComponent,
    FeatureCardComponent,
    ResultComponent,
    MultilineSnackbarComponent,
    RoleComponent,
    LpDetailsComponent,
    LpCardComponent,
    FullstackProgramComponent,
    FsCardComponent,
    LaunchpadComponent,
    IndustryComponent,
    FsHomeComponent,
    IndustryAnalyticsComponent,
    RoleDetailsComponent,
    BpmDetailsComponent,
  ],
  entryComponents: [MultilineSnackbarComponent],
  imports: [
    CommonModule,
    NavigatorRoutingModule,
    BtnPageBackModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatRadioModule,
    MatChipsModule,
    MatSnackBarModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatGridListModule,
    MatToolbarModule,
    PipeLimitToModule,
    MatProgressSpinnerModule,
    WidgetResolverModule,
    HorizontalScrollerModule,
    MatExpansionModule,
    MatCheckboxModule,
    DefaultThumbnailModule,
    PentagonModule,
    BtnGoalsModule,
  ],
})
export class NavigatorModule { }
