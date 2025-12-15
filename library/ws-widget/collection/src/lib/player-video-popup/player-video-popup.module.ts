import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { PlayerVideoPopupComponent } from './player-video-popup-component'

@NgModule({
  declarations: [PlayerVideoPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatListModule
  ],
  exports: [PlayerVideoPopupComponent]
})
export class PlayerVideoPopupModule { }
