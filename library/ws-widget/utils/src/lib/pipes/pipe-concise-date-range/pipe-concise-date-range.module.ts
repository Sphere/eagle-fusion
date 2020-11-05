import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeConciseDateRangePipe } from './pipe-concise-date-range.pipe'

@NgModule({
  declarations: [PipeConciseDateRangePipe],
  imports: [CommonModule],
  exports: [PipeConciseDateRangePipe],
})
export class PipeConciseDateRangeModule {}
