import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import {
  BtnContentShareModule,
  DisplayContentTypeModule,
  UserImageModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

import { AudioComponent } from './audio.component'
import { RouterModule } from '@angular/router'

import { AudioModule as AudioViewContainerModule } from '../../route-view-container/audio/audio.module'

@NgModule({
  declarations: [AudioComponent],
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    WidgetResolverModule,
    PipeLimitToModule,
    PipePartialContentModule,
    PipeDurationTransformModule,
    BtnContentShareModule,
    UserImageModule,
    DisplayContentTypeModule,
    AudioViewContainerModule,
  ],
})
export class AudioModule { }
