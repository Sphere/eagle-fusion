import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DisplayContentTypeIconComponent } from './display-content-type-icon.component'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

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
