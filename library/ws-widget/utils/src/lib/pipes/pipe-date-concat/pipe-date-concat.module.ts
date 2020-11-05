import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeDateConcatPipe } from './pipe-date-concat.pipe'

@NgModule({
  declarations: [PipeDateConcatPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeDateConcatPipe],
})
export class PipeDateConcatModule { }
