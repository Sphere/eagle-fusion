import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { PlayerVideoPopupComponent } from './player-video-popup-component'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [PlayerVideoPopupComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatListModule,
    TranslateModule,
  ],
  exports: [PlayerVideoPopupComponent],
})
export class PlayerVideoPopupModule { }
