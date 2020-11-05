import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ElementHtmlComponent } from '../element-html/element-html.component'
import { PipeSafeSanitizerModule } from '@ws-widget/utils'

@NgModule({
  declarations: [ElementHtmlComponent],
  imports: [CommonModule, PipeSafeSanitizerModule],
  entryComponents: [ElementHtmlComponent],
})
export class ElementHtmlModule {}
