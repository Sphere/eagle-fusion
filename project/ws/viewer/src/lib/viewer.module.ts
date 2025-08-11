import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatTreeModule } from '@angular/material/tree'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'


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
  // BtnContentDownloadModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnGoalsModule,
  // BtnPlaylistModule,
  // BtnContentFeedbackModule,
  DisplayContentTypeIconModule,
  // BtnContentFeedbackV2Module,
  // PlayerBriefModule,
} from '@ws-widget/collection'

import { WidgetResolverModule } from '@ws-widget/resolver'
import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { FilterResourcePipe } from './pipes/filter-resource.pipe'
// import { BtnMailUserModule } from './../../../../../library/ws-widget/collection/src/lib/btn-mail-user/btn-mail-user.module'
import { UserImageModule } from './../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { AppTocModule } from '@ws/app'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
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
    MatTooltipModule,
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
    // BtnContentDownloadModule,
    // BtnContentLikeModule,
    BtnContentShareModule,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    // BtnContentFeedbackModule,
    // BtnContentFeedbackV2Module,
    DisplayContentTypeIconModule,
    PipePartialContentModule,
    MatTabsModule,
    // PlayerBriefModule,
    ViewerTopBarModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    // BtnMailUserModule,
    UserImageModule,
    AppTocModule,
    NgCircleProgressModule.forRoot({}),
  ],
})
export class ViewerModule { }
