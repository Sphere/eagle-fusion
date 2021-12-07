
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@ws-widget/utils'
import { PublicHomeComponent } from './public-home.component'
import { WidgetResolverModule } from '@ws-widget/resolver/src/public-api'
@NgModule({
  declarations: [PublicHomeComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    BtnPageBackModule,
    MatButtonModule,
    HorizontalScrollerModule,
    PipeSafeSanitizerModule,
    WidgetResolverModule,
  ],

  exports: [PublicHomeComponent],
})
export class PublicHomeModule { }