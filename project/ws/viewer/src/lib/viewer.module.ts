import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgCircleProgressModule } from 'ng-circle-progress'
import {
  MatCardModule,
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatListModule,
  MatTreeModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTabsModule,
  MatInputModule,
} from '@angular/material'

import { ViewerRoutingModule } from './viewer-routing.module'

import {
  PipeDurationTransformModule,
  PipeLimitToModule,
  DefaultThumbnailModule,
  PipePartialContentModule,
} from '@ws-widget/utils'

import {
  ErrorResolverModule,
  BtnPageBackModule,
  BtnFullscreenModule,
  DisplayContentTypeModule,
  BtnContentDownloadModule,
  BtnContentLikeModule,
  BtnContentShareModule,
  BtnGoalsModule,
  BtnPlaylistModule,
  BtnContentFeedbackModule,
  DisplayContentTypeIconModule,
  BtnContentFeedbackV2Module,
  PlayerBriefModule,
} from '@ws-widget/collection'

import { WidgetResolverModule } from '@ws-widget/resolver'
import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { FilterResourcePipe } from './pipes/filter-resource.pipe'
import { BtnMailUserModule } from './../../../../../library/ws-widget/collection/src/lib/btn-mail-user/btn-mail-user.module'
import { UserImageModule } from './../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { AppTocModule } from '@ws/app'

@NgModule({
  declarations: [ViewerComponent, ViewerTocComponent, FilterResourcePipe],
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatListModule,
    MatTreeModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ViewerRoutingModule,
    ErrorResolverModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    DefaultThumbnailModule,
    BtnPageBackModule,
    BtnFullscreenModule,
    WidgetResolverModule,
    DisplayContentTypeModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    DisplayContentTypeIconModule,
    PipePartialContentModule,
    MatTabsModule,
    PlayerBriefModule,
    ViewerTopBarModule,
    FormsModule,
    BtnMailUserModule,
    UserImageModule,
    AppTocModule,
    NgCircleProgressModule.forRoot({}),
  ],
})
export class ViewerModule { }
