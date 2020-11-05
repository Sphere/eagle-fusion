import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MarketingComponent } from './marketing.component'
import { MarketingRoutingModule } from './marketing-routing.module'
import { MarketingServicesModule } from './marketing-services/marketing-services.module'
import {
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatListModule,
  MatButtonModule,
} from '@angular/material'
import { PageModule, BtnPageBackModule } from '@ws-widget/collection'

@NgModule({
  declarations: [MarketingComponent],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    MarketingServicesModule,
    PageModule,
    BtnPageBackModule,

    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class MarketingModule { }
