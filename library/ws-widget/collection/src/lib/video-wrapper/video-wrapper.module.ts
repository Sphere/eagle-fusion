import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VideoWrapperComponent } from './video-wrapper.component'
import { PlayerVideoModule } from '../player-video/player-video.module'
import { EmbeddedPageModule } from '../embedded-page/embedded-page.module'

@NgModule({
    declarations: [VideoWrapperComponent],
    imports: [
        CommonModule,
        PlayerVideoModule,
        EmbeddedPageModule,
    ],
    exports: [VideoWrapperComponent]
})
export class VideoWrapperModule { }
