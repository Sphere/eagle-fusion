import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IapComponent } from './iap.component'
import { IapRoutingModule } from './iap-routing.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { IapModule as IapViewContainerModule } from '../../route-view-container/iap/iap.module'

import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatButtonModule } from '@angular/material/button'
import { MatSnackBarModule } from '@angular/material/snack-bar'


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
} from '@ws-widget/collection'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  PipePartialContentModule,
} from '@ws-widget/utils'
@NgModule({
  declarations: [IapComponent],
  imports: [
    CommonModule,
    IapViewContainerModule,
    IapRoutingModule,
    WidgetResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    // BtnContentDownloadModule,
    // BtnContentFeedbackModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
    // UserContentRatingModule,
    // BtnContentFeedbackV2Module,
  ],
})
export class IapModule { }
