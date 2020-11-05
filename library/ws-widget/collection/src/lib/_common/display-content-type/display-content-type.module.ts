import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DisplayContentTypeComponent } from './display-content-type.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'

@NgModule({
  declarations: [DisplayContentTypeComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [DisplayContentTypeComponent],
})
export class DisplayContentTypeModule {}
