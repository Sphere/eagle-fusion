import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerVideoComponent } from './player-video.component'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
    declarations: [PlayerVideoComponent],
    imports: [
        CommonModule,
        MatIconModule
    ],
    exports: [PlayerVideoComponent]
})
export class PlayerVideoModule { }
