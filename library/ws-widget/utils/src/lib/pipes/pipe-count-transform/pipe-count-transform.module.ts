import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeCountTransformPipe } from './pipe-count-transform.pipe'

@NgModule({
  declarations: [PipeCountTransformPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeCountTransformPipe],
})
export class PipeCountTransformModule { }
