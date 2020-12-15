import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DashboardComponent } from './components/dashboard/dashboard.component'
import { HorizontalScrollerModule, PipeDurationTransformModule, DefaultThumbnailModule } from '@ws-widget/utils'
import { UserImageModule, CardKnowledgeModule } from '@ws-widget/collection'
import { InterestModule } from './../interest/interest.module'
import { LearningModule } from './../learning/learning.module'
import { CompetencyModule } from './../competency/competency.module'
import {
  MatCardModule,
  MatChipsModule,
  MatIconModule,
  MatDatepickerModule,
  MatDividerModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
} from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { CalendarModule } from '../../module/calendar-module/calendar.module'
import { RouterModule } from '@angular/router'
import { CoursePendingCardComponent } from './components/course-pending-card/course-pending-card.component'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'

@NgModule({
  declarations: [DashboardComponent, CoursePendingCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatDividerModule,
    MatButtonModule,
    DefaultThumbnailModule,
    HorizontalScrollerModule,
    UserImageModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    CalendarModule,
    RouterModule,
    CardKnowledgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InterestModule,
    LearningModule,
    CompetencyModule,
  ],
  providers: [UserProfileService],
})
export class DashboardModule { }
