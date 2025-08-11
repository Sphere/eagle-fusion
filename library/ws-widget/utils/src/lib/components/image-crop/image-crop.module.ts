import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider'

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
