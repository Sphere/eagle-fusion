import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ClassChangeOnScrollDirective } from './class-change-on-scroll.directive'

@NgModule({
  declarations: [ClassChangeOnScrollDirective],
  imports: [
    CommonModule,
  ],
  exports: [ClassChangeOnScrollDirective],
})
export class ClassChangeOnScrollModule { }
