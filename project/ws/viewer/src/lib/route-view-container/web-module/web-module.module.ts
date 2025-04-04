import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'


import {
  // BtnContentDownloadModule,
  // BtnContentFeedbackModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  DisplayContentTypeModule,
  UserImageModule,
  // UserContentRatingModule,
  // BtnContentFeedbackV2Module,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import { WidgetResolverModule } from '@ws-widget/resolver'

import { WebModuleModule as PluginWebModuleModule } from '../../plugins/web-module/web-module.module'

import { WebModuleRoutingModule } from './web-module-routing.module'

import { WebModuleComponent } from './web-module.component'

@NgModule({
  declarations: [WebModuleComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
    WebModuleRoutingModule,
    PluginWebModuleModule,
    WidgetResolverModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    // UserContentRatingModule,
    // BtnContentFeedbackV2Module,
    // PlayerBriefModule,
  ],
  exports: [
    WebModuleComponent,
  ],
})
export class WebModuleModule { }
