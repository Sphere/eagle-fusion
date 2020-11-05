import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatTreeModule,
  MatProgressSpinnerModule,
  MatIconModule,
  MatListModule,
} from '@angular/material'

import { MarketingServicesComponent } from './marketing-services.component'
import { PentagonModule } from '../pentagon/pentagon.module'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [MarketingServicesComponent],
  imports: [
    CommonModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
    PentagonModule,
    WidgetResolverModule,
  ],
  exports: [MarketingServicesComponent],
})
export class MarketingServicesModule { }
