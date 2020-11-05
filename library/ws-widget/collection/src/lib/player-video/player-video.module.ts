import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerVideoComponent } from './player-video.component'

@NgModule({
  declarations: [PlayerVideoComponent],
  imports: [
    CommonModule,
  ],
  exports: [PlayerVideoComponent],
  entryComponents: [PlayerVideoComponent],
})
export class PlayerVideoModule { }
