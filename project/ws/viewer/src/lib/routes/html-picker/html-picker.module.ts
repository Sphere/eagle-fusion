import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HtmlPickerComponent } from './html-picker.component'
import { HtmlPickerRoutingModule } from './html-picker-routing.module'
import { HtmlPickerModule as HtmlPickerViewContainerModule } from '../../route-view-container/html-picker/html-picker.module'
@NgModule({
  declarations: [HtmlPickerComponent],
  imports: [
    CommonModule,
    HtmlPickerRoutingModule,
    HtmlPickerViewContainerModule,
  ],
})
export class HtmlPickerModule { }
