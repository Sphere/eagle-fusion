import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSliderModule,
} from '@angular/material'
import { ImageCropperModule } from 'ngx-image-cropper'
import { ImageCropComponent } from './image-crop.component'

@NgModule({
  declarations: [ImageCropComponent],
  imports: [
    CommonModule,
    ImageCropperModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    MatSliderModule,
  ],
  exports: [ImageCropComponent],
  entryComponents: [ImageCropComponent],
})
export class ImageCropModule { }
