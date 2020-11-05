import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GalleryViewComponent } from './gallery-view.component'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { HorizontalScrollerModule } from '../../../../utils/src/public-api'
import { MatIconModule, MatCardModule } from '@angular/material'

@NgModule({
  declarations: [GalleryViewComponent],
  imports: [CommonModule, WidgetResolverModule, HorizontalScrollerModule, MatIconModule, MatCardModule],
  exports: [GalleryViewComponent],
  entryComponents: [GalleryViewComponent],
})
export class GalleryViewModule { }
