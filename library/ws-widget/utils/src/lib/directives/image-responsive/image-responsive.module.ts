import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ImageResponsiveDirective } from './image-responsive.directive'

@NgModule({
  declarations: [ImageResponsiveDirective],
  imports: [
    CommonModule,
  ],
  exports: [ImageResponsiveDirective],
})
export class ImageResponsiveModule { }
