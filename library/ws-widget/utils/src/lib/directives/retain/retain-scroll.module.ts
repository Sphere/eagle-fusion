import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RetainScrollDirective } from './retain.directive'

@NgModule({
  declarations: [RetainScrollDirective],
  imports: [
    CommonModule,
  ],
  exports: [RetainScrollDirective],
})
export class RetainScrollModule { }
