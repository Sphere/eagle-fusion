import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnKbAnalyticsComponent } from './btn-kb-analytics.component'
import { MatButtonModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [BtnKbAnalyticsComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  exports: [BtnKbAnalyticsComponent],
  entryComponents: [BtnKbAnalyticsComponent],
})
export class BtnKbAnalyticsModule { }
