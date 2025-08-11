import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerPdfComponent } from './player-pdf.component'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'

import { ReactiveFormsModule } from '@angular/forms'
import { BtnFullscreenModule } from '../btn-fullscreen/btn-fullscreen.module'
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer'
@NgModule({
    declarations: [PlayerPdfComponent],
    imports: [
        CommonModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatMenuModule,
        MatButtonModule,
        MatSliderModule,
        MatToolbarModule,
        ReactiveFormsModule,
        BtnFullscreenModule,
        MatInputModule,
        NgxExtendedPdfViewerModule
    ],
    exports: [PlayerPdfComponent, NgxExtendedPdfViewerModule]
})
export class PlayerPdfModule { }
