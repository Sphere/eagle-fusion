import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Optional, SkipSelf } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { AppTocRoutingModule } from './app-toc-routing.module'
import { NgCircleProgressModule } from 'ng-circle-progress'

import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatTabsModule } from '@angular/material/tabs'
import { MatChipsModule } from '@angular/material/chips'
import { MatDividerModule } from '@angular/material/divider'
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatListModule } from '@angular/material/list'
import { MatDialogModule } from '@angular/material/dialog'
import { MatRadioModule } from '@angular/material/radio'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'

// comps
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
import { AppTocReferencesComponent } from './routes/app-toc-references/app-toc-references.component'
import { AppTocHomeComponent } from './components/app-toc-home/app-toc-home.component'
import { AppTocHomeComponent as AppTocHomeRootComponent } from './routes/app-toc-home/app-toc-home.component'
import { AppTocContentCardComponent } from './components/app-toc-content-card/app-toc-content-card.component'

// services
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { ProfileResolverService } from './../user-profile/resolvers/profile-resolver.service'
import { AppTocService } from './services/app-toc.service'

// custom modules
import { WidgetResolverModule } from '@ws-widget/resolver'
import { DiscussionUiModule, DiscussionService } from '@aastrika_npmjs/discussions-ui-v8'
import {
  PipeDurationTransformModule,
  PipeSafeSanitizerModule,
  PipeLimitToModule,
  PipePartialContentModule,
  HorizontalScrollerModule,
  DefaultThumbnailModule,
  PipeNameTransformModule,
  PipeCountTransformModule,
} from '@ws-widget/utils'
import {
  BtnContentShareModule,
  BtnPageBackModule,
  UserImageModule,
  DisplayContentTypeModule,
  ContentProgressModule,
  PipeContentRouteModule,
  PipeContentRoutePipe,
  CardContentModule,
} from '@ws-widget/collection'
import { AppTocOverviewComponent as AppTocOverviewRootComponent } from './routes/app-toc-overview/app-toc-overview.component'
import { AppTocHomeDirective } from './routes/app-toc-home/app-toc-home.directive'
import { ApiService, AccessControlService } from '../../../../../author/src/public-api'
import { LicenseComponent } from './components/license/license.component'
import { RetainScrollDirective } from './components/app-toc-home/retain-scroll.directive'
import { AllDiscussionWidgetComponent } from './routes/widget/all-discussion-widget/all-discussion-widget.component'
import { AppTocHomePageComponent } from './components/app-toc-home-page/app-toc-home-page.component'
import { AppTocDesktopComponent } from './components/app-toc-desktop/app-toc-desktop.component'
import { AssessmentDetailComponent } from './components/assessment-detail/assessment-detail.component'
import { AppTocDesktopModalComponent } from './components/app-toc-desktop-modal/app-toc-desktop-modal.component'
import { AppTocCertificateModalComponent } from './components/app-toc-certificate-modal/app-toc-certificate-modal.component'
import { ConfirmmodalComponent } from 'project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component'
import { TranslateModule } from '@ngx-translate/core'
@NgModule({
  declarations: [
    ConfirmmodalComponent,
    AppTocContentsComponent,
    AppTocReferencesComponent,
    AppTocHomeComponent,
    AppTocContentCardComponent,
    AppTocOverviewRootComponent,
    AppTocHomeDirective,
    AppTocHomeRootComponent,
    LicenseComponent,
    RetainScrollDirective,
    AllDiscussionWidgetComponent,
    AppTocHomePageComponent,
    AppTocDesktopComponent,
    AssessmentDetailComponent,
    AppTocDesktopModalComponent,
    AppTocCertificateModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AppTocRoutingModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatRadioModule,
    MatTabsModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DisplayContentTypeModule,
    PipeDurationTransformModule,
    PipeSafeSanitizerModule,
    PipeLimitToModule,
    PipeNameTransformModule,
    PipeCountTransformModule,
    PipePartialContentModule,
    PipeContentRouteModule,
    BtnPageBackModule,
    HorizontalScrollerModule,
    UserImageModule,
    DefaultThumbnailModule,
    WidgetResolverModule,
    ContentProgressModule,
    MatProgressSpinnerModule,
    CardContentModule,
    BtnContentShareModule,
    NgCircleProgressModule.forRoot({}),
    DiscussionUiModule,
    TranslateModule,
  ],
  providers: [
    AppTocResolverService,
    AppTocService,
    PipeContentRoutePipe,
    ApiService,
    AccessControlService,
    ProfileResolverService,
    {
      provide: DiscussionService,
      useFactory: (existing: DiscussionService | null) => existing,
      deps: [[new Optional(), new SkipSelf(), DiscussionService]],
    },
  ],
  exports: [AssessmentDetailComponent, AllDiscussionWidgetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppTocModule { }
