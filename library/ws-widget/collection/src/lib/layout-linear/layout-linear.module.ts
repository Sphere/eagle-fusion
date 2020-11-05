import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutLinearComponent } from './layout-linear.component'
import { WidgetResolverModule } from '@ws-widget/resolver'
@NgModule({
  declarations: [LayoutLinearComponent],
  imports: [CommonModule, WidgetResolverModule],
  entryComponents: [LayoutLinearComponent],
})
export class LayoutLinearModule {}
