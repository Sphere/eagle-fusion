import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AnalyticsComponent } from './analytics.component'
import { AnalyticsRoutingModule } from './analytics-routing.module'

import { BtnPageBackModule, PageModule } from '@ws-widget/collection'

import {
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
} from '@angular/material'
import { LinePlusBarChartComponent } from './components/line-plus-bar-chart/line-plus-bar-chart.component'

@NgModule({
  declarations: [AnalyticsComponent, LinePlusBarChartComponent],
  imports: [
    AnalyticsRoutingModule,
    BtnPageBackModule,
    PageModule,
    MatToolbarModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [AnalyticsComponent],
})
export class AnalyticsModule { }
