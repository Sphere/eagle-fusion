import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentProgressComponent } from './content-progress.component'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatTooltipModule } from '@angular/material/tooltip'

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
