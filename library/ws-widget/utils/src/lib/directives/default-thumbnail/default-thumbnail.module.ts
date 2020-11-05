import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DefaultThumbnailDirective } from './default-thumbnail.directive'

@NgModule({
  declarations: [DefaultThumbnailDirective],
  imports: [
    CommonModule,
  ],
  exports: [DefaultThumbnailDirective],
})
export class DefaultThumbnailModule { }
