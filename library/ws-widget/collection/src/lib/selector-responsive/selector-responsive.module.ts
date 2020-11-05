import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorResponsiveComponent } from './selector-responsive.component'
import { LayoutModule } from '@angular/cdk/layout'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [SelectorResponsiveComponent],
  imports: [CommonModule, LayoutModule, WidgetResolverModule],
  exports: [SelectorResponsiveComponent],
  entryComponents: [SelectorResponsiveComponent],
})
export class SelectorResponsiveModule {}
