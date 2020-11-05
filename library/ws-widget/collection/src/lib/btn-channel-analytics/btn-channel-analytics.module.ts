import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnChannelAnalyticsComponent } from './btn-channel-analytics.component'
import { RouterModule } from '@angular/router'
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
} from '@angular/material'
@NgModule({
  declarations: [BtnChannelAnalyticsComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [BtnChannelAnalyticsComponent],
  entryComponents: [BtnChannelAnalyticsComponent],
})
export class BtnChannelAnalyticsModule { }
