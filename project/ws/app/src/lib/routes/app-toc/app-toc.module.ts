import { NgModule } from '@angular/core'
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
// import { AppTocAnalyticsComponent } from './routes/app-toc-analytics/app-toc-analytics.component'
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
import { AppTocReferencesComponent } from './routes/app-toc-references/app-toc-references.component'
import { AppTocHomeComponent } from './components/app-toc-home/app-toc-home.component'
import { AppTocHomeComponent as AppTocHomeRootComponent } from './routes/app-toc-home/app-toc-home.component'
import { AppTocOverviewComponent } from './components/app-toc-overview/app-toc-overview.component'
// import { AppTocBannerComponent } from './components/app-toc-banner/app-toc-banner.component'
import { AppTocCohortsComponent } from './components/app-toc-cohorts/app-toc-cohorts.component'
import { AppTocContentCardComponent } from './components/app-toc-content-card/app-toc-content-card.component'
import { AppTocDiscussionComponent } from './components/app-toc-discussion/app-toc-discussion.component'
// import { CreateBatchDialogComponent } from './components/create-batch-dialog/create-batch-dialog.component'

// services
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { ProfileResolverService } from './../user-profile/resolvers/profile-resolver.service'
import { AppTocService } from './services/app-toc.service'
// import { TrainingApiService } from '../infy/routes/training/apis/training-api.service'

// custom modules
import { WidgetResolverModule } from '@ws-widget/resolver'
import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { WrapperModule } from '../../../../../../../src/app/routes/discussion-forum/wrapper/wrapper.module'
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
  // BtnCallModule,
  // BtnContentDownloadModule,
  // BtnContentLikeModule,
  BtnContentShareModule,
  // BtnContentFeedbackModule,
  // BtnContentFeedbackV2Module,
  // BtnGoalsModule,
  // BtnMailUserModule,
  BtnPageBackModule,
  UserImageModule,
  DisplayContentTypeModule,
  // BtnPlaylistModule,
  DisplayContentTypeIconModule,
  ContentProgressModule,
  // UserContentRatingModule,
  PipeContentRouteModule,
  PipeContentRoutePipe,
  // BtnKbModule,
  // MarkAsCompleteModule,
  // PlayerBriefModule,
  CardContentModule,
  UserAutocompleteModule,

} from '@ws-widget/collection'
// import { AppTocDialogIntroVideoComponent } from './components/app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
// import { CertificationMetaResolver } from './routes/app-toc-certification/resolvers/certification-meta.resolver'
// import { ContentCertificationResolver } from './routes/app-toc-certification/resolvers/content-certification.resolver'
// import { CertificationApiService } from './routes/app-toc-certification/apis/certification-api.service'
// import { AppTocCertificationModule } from './routes/app-toc-certification/app-toc-certification.module'
// import { TrainingService } from '../infy/routes/training/services/training.service'
import { AppTocOverviewDirective } from './routes/app-toc-overview/app-toc-overview.directive'
import { AppTocOverviewComponent as AppTocOverviewRootComponent } from './routes/app-toc-overview/app-toc-overview.component'
import { AppTocHomeDirective } from './routes/app-toc-home/app-toc-home.directive'
// import { AppTocCohortsDirective } from './routes/app-toc-cohorts/app-toc-cohorts.directive'
// import { AppTocCohortsComponent as AppTocCohortsRootComponent } from './routes/app-toc-cohorts/app-toc-cohorts.component'
// import { AppTocAnalyticsTilesComponent } from './components/app-toc-analytics-tiles/app-toc-analytics-tiles.component'
// import { KnowledgeArtifactDetailsComponent } from './components/knowledge-artifact-details/knowledge-artifact-details.component'
import { ProfileImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/profile-image/profile-image.module'
import { EditorService } from '../../../../../author/src/lib/routing/modules/editor/services/editor.service'
import { ApiService, AccessControlService } from '../../../../../author/src/public-api'
import { LicenseComponent } from './components/license/license.component'
import { RetainScrollDirective } from './components/app-toc-home/retain-scroll.directive'
// import { AppTocSinglePageComponent } from './components/app-toc-single-page/app-toc-single-page.component'
// import { AppTocSinglePageComponent as AppTocSinglePageRootComponent } from './routes/app-toc-single-page/app-toc-single-page.component'
// import { AppTocSinglePageDirective } from './routes/app-toc-single-page/app-toc-single-page.directive'
import { AllDiscussionWidgetComponent } from './routes/widget/all-discussion-widget/all-discussion-widget.component'
import { AppTocHomePageComponent } from './components/app-toc-home-page/app-toc-home-page.component'
import { AppTocDesktopComponent } from './components/app-toc-desktop/app-toc-desktop.component'
import { AssessmentDetailComponent } from './components/assessment-detail/assessment-detail.component'
import { AppTocDesktopModalComponent } from './components/app-toc-desktop-modal/app-toc-desktop-modal.component'
import { AppTocCertificateModalComponent } from './components/app-toc-certificate-modal/app-toc-certificate-modal.component'
import { ConfirmmodalComponent } from 'project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component'
@NgModule({
  declarations: [
    ConfirmmodalComponent,
    // AppTocAnalyticsComponent,
    AppTocContentsComponent,
    AppTocReferencesComponent,
    AppTocHomeComponent,
    AppTocOverviewComponent,
    // AppTocBannerComponent,
    AppTocCohortsComponent,
    AppTocContentCardComponent,
    AppTocDiscussionComponent,
    // AppTocDialogIntroVideoComponent,
    AppTocOverviewDirective,
    AppTocOverviewRootComponent,
    AppTocHomeDirective,
    AppTocHomeRootComponent,
    // AppTocCohortsDirective,
    // AppTocCohortsRootComponent,
    // KnowledgeArtifactDetailsComponent,
    // AppTocAnalyticsTilesComponent,
    LicenseComponent,
    // AppTocSinglePageComponent,
    // AppTocSinglePageRootComponent,
    // AppTocSinglePageDirective,
    // CreateBatchDialogComponent,
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
    DisplayContentTypeIconModule,
    PipeDurationTransformModule,
    PipeSafeSanitizerModule,
    PipeLimitToModule,
    PipeNameTransformModule,
    PipeCountTransformModule,
    PipePartialContentModule,
    PipeContentRouteModule,
    // BtnCallModule,
    // BtnContentDownloadModule,
    // BtnContentLikeModule,
    // BtnContentFeedbackModule,
    // BtnContentFeedbackV2Module,
    // BtnGoalsModule,
    // BtnPlaylistModule,
    // BtnMailUserModule,
    BtnPageBackModule,
    HorizontalScrollerModule,
    UserImageModule,
    DefaultThumbnailModule,
    WidgetResolverModule,
    ContentProgressModule,
    // UserContentRatingModule,
    // BtnKbModule,
    // AppTocCertificationModule,
    // MarkAsCompleteModule,
    // PlayerBriefModule,
    MatProgressSpinnerModule,
    CardContentModule,
    BtnContentShareModule,
    UserAutocompleteModule,
    ProfileImageModule,
    NgCircleProgressModule.forRoot({}),
    DiscussionUiModule,
    WrapperModule,
  ],
  providers: [
    AppTocResolverService,
    AppTocService,
    PipeContentRoutePipe,
    // TrainingApiService,
    // TrainingService,
    // CertificationApiService,
    // CertificationMetaResolver,
    // ContentCertificationResolver,
    EditorService,
    ApiService,
    AccessControlService,
    ProfileResolverService,
  ],
  exports: [AppTocDiscussionComponent, AppTocCohortsComponent, AssessmentDetailComponent, AllDiscussionWidgetComponent],
  entryComponents: [
    ConfirmmodalComponent,
    // AppTocDialogIntroVideoComponent,
    AppTocOverviewComponent,
    AppTocHomeComponent,
    // AppTocSinglePageComponent,
    // AppTocSinglePageRootComponent,
    // CreateBatchDialogComponent,
    AppTocHomePageComponent,
    AppTocDesktopModalComponent,
    AppTocCertificateModalComponent,
  ],
})
export class AppTocModule { }
