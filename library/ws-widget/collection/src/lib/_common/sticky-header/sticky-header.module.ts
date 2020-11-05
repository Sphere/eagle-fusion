import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StickyHeaderComponent } from './sticky-header.component'

@NgModule({
  declarations: [StickyHeaderComponent],
  imports: [
    CommonModule,
  ],
  exports: [StickyHeaderComponent],
})
export class StickyHeaderModule { }
