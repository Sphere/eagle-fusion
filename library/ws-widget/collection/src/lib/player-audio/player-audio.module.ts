import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerAudioComponent } from './player-audio.component'

@NgModule({
  declarations: [PlayerAudioComponent],
  imports: [CommonModule],
  entryComponents: [PlayerAudioComponent],
  exports: [PlayerAudioComponent],
})
export class PlayerAudioModule {}
