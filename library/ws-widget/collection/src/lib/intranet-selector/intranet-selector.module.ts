import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IntranetSelectorComponent } from './intranet-selector.component'
import { WidgetResolverModule } from '@ws-widget/resolver'

@NgModule({
  declarations: [IntranetSelectorComponent],
  imports: [
    CommonModule,
    WidgetResolverModule,
  ],
  entryComponents: [IntranetSelectorComponent],
})
export class IntranetSelectorModule { }
