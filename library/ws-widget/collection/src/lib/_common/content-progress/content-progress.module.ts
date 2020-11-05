import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentProgressComponent } from './content-progress.component'
import { MatProgressBarModule, MatTooltipModule } from '@angular/material'

@NgModule({
  declarations: [ContentProgressComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  exports: [ContentProgressComponent],
})
export class ContentProgressModule { }
