import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import {
  MatProgressSpinnerModule,
  MatCardModule,
  MatIconModule,
  MatDividerModule,
  MatButtonModule,
  MatExpansionModule,
  MatListModule,
  MatTabsModule,
} from '@angular/material'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { WidgetResolverModule } from '@ws-widget/resolver'

import { CardDetailComponent } from './components/card-detail/card-detail.component'
import { CompetencyHomeComponent } from './components/competency-home/competency-home.component'
import { AchievementsComponent } from './components/achievements/achievements.component'
import { HorizontalScrollerModule } from '@ws-widget/utils'

@NgModule({
  declarations: [CardDetailComponent, CompetencyHomeComponent, AchievementsComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HorizontalScrollerModule,

    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    WidgetResolverModule,
  ],
})
export class CompetencyModule {}
