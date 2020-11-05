import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BadgesRoutingModule } from './badges-routing.module'
import { BadgeComponent } from './components/badge/badge.component'
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatProgressBarModule,
} from '@angular/material'
import { BadgesCardComponent } from './components/badges-card/badges-card.component'
import { BadgesNotEarnedComponent } from './components/badges-not-earned/badges-not-earned.component'
import { HorizontalScrollerModule, DefaultThumbnailModule } from '@ws-widget/utils'
@NgModule({
  declarations: [BadgeComponent, BadgesCardComponent, BadgesNotEarnedComponent],
  imports: [
    CommonModule,
    BadgesRoutingModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressBarModule,
    HorizontalScrollerModule,
    DefaultThumbnailModule,
  ],
})
export class BadgesModule { }
