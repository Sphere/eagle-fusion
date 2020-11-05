import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipeSafeSanitizerPipe } from './pipe-safe-sanitizer.pipe'

@NgModule({
  declarations: [PipeSafeSanitizerPipe],
  imports: [
    CommonModule,
  ],
  exports: [PipeSafeSanitizerPipe],
})
export class PipeSafeSanitizerModule { }
