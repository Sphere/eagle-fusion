import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { QuickTourComponent } from './quick-tour.component'

@NgModule({
  declarations: [QuickTourComponent],
  imports: [
    CommonModule,
    WidgetResolverModule,
  ],
  exports: [QuickTourComponent],
})
export class QuickTourModule { }
