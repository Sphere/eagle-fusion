import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatSliderModule } from '@angular/material/slider'

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
    exports: [ImageCropComponent]
})
export class ImageCropModule { }
