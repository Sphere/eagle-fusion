import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LayoutTabComponent } from './layout-tab.component'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { WidgetResolverModule } from '@ws-widget/resolver'
@NgModule({
    declarations: [LayoutTabComponent],
    imports: [CommonModule, MatTabsModule, WidgetResolverModule]
})
export class LayoutTabModule { }
