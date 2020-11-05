import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { GamificationRoutingModule } from './gamification-routing.module'
import {
  MatTabsModule,
  MatCardModule,
  MatDividerModule,
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
} from '@angular/material'

import { UserImageModule } from '@ws-widget/collection'
import { PipeNameTransformModule, PipeCountTransformModule } from '@ws-widget/utils'

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    GamificationRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    UserImageModule,
    PipeNameTransformModule,
    PipeCountTransformModule,
  ],
})
export class GamificationModule { }
