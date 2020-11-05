import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material'
import { BtnFlagComponent } from './btn-flag.component'

@NgModule({
  declarations: [BtnFlagComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [BtnFlagComponent],
})
export class BtnFlagModule { }
