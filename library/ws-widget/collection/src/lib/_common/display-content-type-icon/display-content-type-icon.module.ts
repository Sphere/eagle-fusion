import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DisplayContentTypeIconComponent } from './display-content-type-icon.component'
import { MatIconModule, MatTooltipModule } from '@angular/material'

@NgModule({
  declarations: [DisplayContentTypeIconComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [DisplayContentTypeIconComponent],
})
export class DisplayContentTypeIconModule { }
