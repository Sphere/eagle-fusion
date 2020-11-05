import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatTooltipModule } from '@angular/material'
import { BtnFullscreenComponent } from './btn-fullscreen.component'

@NgModule({
  declarations: [BtnFullscreenComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [BtnFullscreenComponent],
  entryComponents: [BtnFullscreenComponent],
})
export class BtnFullscreenModule { }
