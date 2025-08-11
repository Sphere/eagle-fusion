import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HorizontalScrollerComponent } from './horizontal-scroller.component'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'

@NgModule({
  declarations: [HorizontalScrollerComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  exports: [HorizontalScrollerComponent],
})
export class HorizontalScrollerModule { }
