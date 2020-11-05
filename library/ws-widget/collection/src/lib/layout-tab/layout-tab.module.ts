import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutTabComponent } from './layout-tab.component'
import { MatTabsModule } from '@angular/material'
import { WidgetResolverModule } from '@ws-widget/resolver'
@NgModule({
  declarations: [LayoutTabComponent],
  imports: [CommonModule, MatTabsModule, WidgetResolverModule],
  entryComponents: [LayoutTabComponent],
})
export class LayoutTabModule {}
