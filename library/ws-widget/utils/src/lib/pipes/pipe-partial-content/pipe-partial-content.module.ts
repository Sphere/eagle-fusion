import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipePartialContentPipe } from './pipe-partial-content.pipe'

@NgModule({
  declarations: [PipePartialContentPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipePartialContentPipe],
})
export class PipePartialContentModule { }
