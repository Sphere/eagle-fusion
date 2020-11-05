import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { LayoutModule } from '@angular/cdk/layout'
import {
  MatListModule,
  MatIconModule,
  MatDividerModule,
  MatRippleModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatDialogModule,
  MatTooltipModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatBadgeModule,
  MatTabsModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatChipsModule,
  MatMenuModule,
} from '@angular/material'

import { PipeSafeSanitizerModule } from '@ws-widget/utils'
import {
  UserImageModule,
  DisplayContentTypeModule,
  BtnContentFeedbackV2Module,
} from '@ws-widget/collection'

import { MyFeedbackRoutingModule } from './my-feedback-routing.module'
import { HomeComponent } from './components/home/home.component'
import { FeedbackListComponent } from './components/feedback-list/feedback-list.component'
import { FeedbackThreadComponent } from './components/feedback-thread/feedback-thread.component'
import { FeedbackThreadItemComponent } from './components/feedback-thread-item/feedback-thread-item.component'
import { MyFeedbackService } from './services/my-feedback.service'
import { FeedbackFilterDialogComponent } from './components/feedback-filter-dialog/feedback-filter-dialog.component'
import { FeedbackTypeComponent } from './components/feedback-type/feedback-type.component'
import { FeedbackThreadHeaderComponent } from './components/feedback-thread-header/feedback-thread-header.component'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'

@NgModule({
  declarations: [
    HomeComponent,
    FeedbackListComponent,
    FeedbackThreadComponent,
    FeedbackThreadItemComponent,
    FeedbackFilterDialogComponent,
    FeedbackTypeComponent,
    FeedbackThreadHeaderComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatRippleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTabsModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    PipeSafeSanitizerModule,
    UserImageModule,
    DisplayContentTypeModule,
    BtnContentFeedbackV2Module,
    MyFeedbackRoutingModule,
  ],
  providers: [MyFeedbackService, FeedbackSummaryResolver, FeedbackConfigResolver],
  entryComponents: [FeedbackFilterDialogComponent],
})
export class MyFeedbackModule {}
