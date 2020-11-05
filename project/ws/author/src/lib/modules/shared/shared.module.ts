import { WorkFlowService } from './../../services/work-flow.service'
import { NotificationService } from './../../services/notification.service'
import { ConditionCheckService } from './services/condition-check.service'
import { PipeContentRouteModule } from '@ws-widget/collection'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatDialogRef,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MAT_DIALOG_DATA,
} from '@angular/material'
import { MatCardModule } from '@angular/material/card'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatRadioModule } from '@angular/material/radio'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatStepperModule } from '@angular/material/stepper'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
import { ImageCropModule } from '@ws-widget/utils/src/public-api'
import { AuthEditorStepsComponent } from './components/auth-editor-steps/auth-editor-steps.component'
import { CommentsDialogComponent } from './components/comments-dialog/comments-dialog.component'
import { CommentsComponent } from './components/comments/comments.component'
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from './components/error-parser/error-parser.component'
import { IprDialogComponent } from './components/ipr-dialog/ipr-dialog.component'
import { NotificationComponent } from './components/notification/notification.component'
import { RelativeUrlPipe } from './pipes/relative-url.pipe'
import { AccessControlService } from './services/access-control.service'
import { ApiService } from './services/api.service'
import { AuthExpiryDateConfirmComponent } from './components/auth-expiry-date-confirm/auth-expiry-date-confirm.component'
import { StatusDisplayComponent } from './components/status-display/status-display.component'
import { LastUpdateDisplayComponent } from './components/last-update-display/last-update-display.component'
import { ExpiryDateDisplayComponent } from './components/expiry-date-display/expiry-date-display.component'
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component'
import { RestoreDialogComponent } from './components/restore-dialog/restore-dialog.component'
import { UnpublishDialogComponent } from './components/unpublish-dialog/unpublish-dialog.component'
import { DraftDialogComponent } from './components/draft-dialog/draft-dialog.component'
import { ShowHideToolTipDirective } from './directives/show-hide-tool-tip.directive'
import { StatusTrackComponent } from './components/status-track/status-track.component'
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component'

@NgModule({
  declarations: [
    RelativeUrlPipe,
    CommentsComponent,
    NotificationComponent,
    CommentsDialogComponent,
    IprDialogComponent,
    ConfirmDialogComponent,
    AuthEditorStepsComponent,
    ErrorParserComponent,
    AuthExpiryDateConfirmComponent,
    StatusDisplayComponent,
    LastUpdateDisplayComponent,
    ExpiryDateDisplayComponent,
    DeleteDialogComponent,
    RestoreDialogComponent,
    UnpublishDialogComponent,
    DraftDialogComponent,
    ShowHideToolTipDirective,
    StatusTrackComponent,
    FeedbackFormComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatStepperModule,
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,
    MatSnackBarModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTreeModule,
    MatRadioModule,
    MatProgressBarModule,
    ImageCropModule,
    PipeContentRouteModule,
  ],
  exports: [
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatButtonModule,
    MatButtonToggleModule,
    RelativeUrlPipe,
    MatTooltipModule,
    CommentsComponent,
    MatAutocompleteModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatSidenavModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatListModule,
    MatSnackBarModule,
    NotificationComponent,
    CommentsDialogComponent,
    ConfirmDialogComponent,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTreeModule,
    MatRadioModule,
    MatProgressBarModule,
    IprDialogComponent,
    ImageCropModule,
    AuthEditorStepsComponent,
    ErrorParserComponent,
    PipeContentRouteModule,
    StatusDisplayComponent,
    LastUpdateDisplayComponent,
    DeleteDialogComponent,
    RestoreDialogComponent,
    UnpublishDialogComponent,
    DraftDialogComponent,
    ShowHideToolTipDirective,
    StatusTrackComponent,
    FeedbackFormComponent,
  ],
  providers: [
    ApiService,
    AccessControlService,
    ConditionCheckService,
    WorkFlowService,
    NotificationService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
  entryComponents: [
    AuthExpiryDateConfirmComponent,
    NotificationComponent,
    IprDialogComponent,
    CommentsDialogComponent,
    ConfirmDialogComponent,
    ErrorParserComponent,
    DeleteDialogComponent,
    RestoreDialogComponent,
    UnpublishDialogComponent,
    DraftDialogComponent,
    StatusTrackComponent,
    FeedbackFormComponent,
  ],
})
export class SharedModule {}
