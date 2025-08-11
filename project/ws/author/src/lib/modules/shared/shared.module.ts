import { WorkFlowService } from './../../services/work-flow.service'
import { NotificationService } from './../../services/notification.service'
import { ConditionCheckService } from './services/condition-check.service'
import { PipeContentRouteModule } from '@ws-widget/collection'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatNativeDateModule } from '@angular/material/core'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatStepperModule } from '@angular/material/stepper'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'
// import { ImageCropModule } from '@ws-widget/utils/src/public-api'
import { AuthEditorStepsComponent } from './components/auth-editor-steps/auth-editor-steps.component'
import { CommentsDialogComponent } from './components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from './components/error-parser/error-parser.component'
import { NotificationComponent } from './components/notification/notification.component'
import { RelativeUrlPipe } from './pipes/relative-url.pipe'
import { AccessControlService } from './services/access-control.service'
import { ApiService } from './services/api.service'
import { StatusDisplayComponent } from './components/status-display/status-display.component'
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component'
import { RestoreDialogComponent } from './components/restore-dialog/restore-dialog.component'
import { UnpublishDialogComponent } from './components/unpublish-dialog/unpublish-dialog.component'
import { ShowHideToolTipDirective } from './directives/show-hide-tool-tip.directive'
import { StatusTrackComponent } from './components/status-track/status-track.component'
import { PlayerNavigationWidgetComponent } from '../../../../../../../library/ws-widget/collection/src/lib/player-navigation-widget/player-navigation-widget.component'
import { RouterModule } from '@angular/router'
import { CourseRatingDialogComponent } from './components/course-rating/course-rating-dialog.component'
import { TextFieldModule } from '@angular/cdk/text-field'

@NgModule({
    declarations: [
        RelativeUrlPipe,
        NotificationComponent,
        CommentsDialogComponent,
        ConfirmDialogComponent,
        AuthEditorStepsComponent,
        ErrorParserComponent,
        StatusDisplayComponent,
        DeleteDialogComponent,
        CourseRatingDialogComponent,
        RestoreDialogComponent,
        UnpublishDialogComponent,
        ShowHideToolTipDirective,
        StatusTrackComponent,
        PlayerNavigationWidgetComponent
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
        // ImageCropModule,
        PipeContentRouteModule,
        RouterModule,
        TextFieldModule
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
        // ImageCropModule,
        AuthEditorStepsComponent,
        ErrorParserComponent,
        PipeContentRouteModule,
        StatusDisplayComponent,
        DeleteDialogComponent,
        CourseRatingDialogComponent,
        RestoreDialogComponent,
        UnpublishDialogComponent,
        ShowHideToolTipDirective,
        StatusTrackComponent,
        PlayerNavigationWidgetComponent,
        TextFieldModule
    ],
    providers: [
        ApiService,
        AccessControlService,
        ConditionCheckService,
        WorkFlowService,
        NotificationService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
    ]
})
export class SharedModule { }
