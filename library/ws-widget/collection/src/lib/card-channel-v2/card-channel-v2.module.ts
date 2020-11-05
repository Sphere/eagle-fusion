import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CardChannelV2Component } from './card-channel-v2.component'
import { MatCardModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'
import { PipeDurationTransformModule, DefaultThumbnailModule } from '@ws-widget/utils'

@NgModule({
  declarations: [CardChannelV2Component],
  imports: [
    CommonModule,
    RouterModule,
    PipeDurationTransformModule,
    DefaultThumbnailModule,
    // Material Imports
    MatCardModule,
    MatIconModule,
  ],
  exports: [CardChannelV2Component],
  entryComponents: [CardChannelV2Component],
})
export class CardChannelModuleV2 { }
