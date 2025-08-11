import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentProgressComponent } from './content-progress.component'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'

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
