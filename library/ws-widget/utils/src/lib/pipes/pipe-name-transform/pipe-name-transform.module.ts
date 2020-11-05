import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeNameTransformPipe } from './pipe-name-transform.pipe'

@NgModule({
  declarations: [PipeNameTransformPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeNameTransformPipe],
})
export class PipeNameTransformModule { }
