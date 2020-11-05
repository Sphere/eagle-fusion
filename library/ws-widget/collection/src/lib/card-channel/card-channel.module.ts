import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardChannelComponent } from './card-channel.component'
import { MatCardModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [CardChannelComponent],
  imports: [
    CommonModule,
    RouterModule,

    // Material Imports
    MatCardModule,
    MatIconModule,
  ],
  exports: [CardChannelComponent],
  entryComponents: [CardChannelComponent],
})
export class CardChannelModule { }
