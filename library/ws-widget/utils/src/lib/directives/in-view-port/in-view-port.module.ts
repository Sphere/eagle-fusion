import { InViewPortDirective } from './in-view-port.directive'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

@NgModule({
  declarations: [InViewPortDirective],
  exports: [InViewPortDirective],
  imports: [
    CommonModule,
  ],
})
export class InViewPortModule { }
