import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatListModule } from '@angular/material/list'
import { MatTreeModule } from '@angular/material/tree'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatInputModule } from '@angular/material/input'
import { MatDialogModule } from '@angular/material/dialog'
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
  BtnContentShareModule,
} from '@ws-widget/collection'

import { WidgetResolverModule } from '@ws-widget/resolver'
import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { UserImageModule } from './../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { AppTocModule } from '@ws/app'
import { QuizModule } from './plugins/quiz/quiz.module'
import { MatTooltipModule } from '@angular/material/tooltip'
import { TranslateModule } from '@ngx-translate/core'
@NgModule({
  declarations: [ViewerComponent, ViewerTocComponent],
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
    MatTooltipModule,
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
    BtnContentShareModule,
    PipePartialContentModule,
    MatTabsModule,
    ViewerTopBarModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    UserImageModule,
    AppTocModule,
    QuizModule,
    NgCircleProgressModule.forRoot({}),
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewerModule { }
