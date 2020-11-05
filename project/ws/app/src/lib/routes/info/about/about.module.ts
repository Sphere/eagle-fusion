import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutHomeComponent } from './components/about-home.component'
import {
  MatToolbarModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
} from '@angular/material'
import { BtnPageBackModule } from '@ws-widget/collection'
import { HorizontalScrollerModule, PipeSafeSanitizerModule } from '@ws-widget/utils'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [AboutHomeComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,

    BtnPageBackModule,
    HorizontalScrollerModule,
    WidgetResolverModule,
    PipeSafeSanitizerModule,

  ],
  exports: [AboutHomeComponent],
})
export class AboutModule { }
