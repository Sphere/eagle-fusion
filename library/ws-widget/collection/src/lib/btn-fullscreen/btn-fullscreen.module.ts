import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { BtnFullscreenComponent } from './btn-fullscreen.component'

@NgModule({
    declarations: [BtnFullscreenComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    exports: [BtnFullscreenComponent]
})
export class BtnFullscreenModule { }
