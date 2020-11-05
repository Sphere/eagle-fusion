import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeLimitToPipe } from './pipe-limit-to.pipe'

@NgModule({
  declarations: [PipeLimitToPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeLimitToPipe],
})
export class PipeLimitToModule { }
