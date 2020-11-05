import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import {
  BtnPageBackModule,
  DisplayContentTypeModule,
  PickerContentModule,
  EmailInputModule,
  DisplayContentsModule,
  UserAutocompleteModule,
} from '@ws-widget/collection'
import { GoalsRoutingModule } from './goals-routing.module'
import { GoalDeleteDialogComponent } from './components/goal-delete-dialog/goal-delete-dialog.component'
import { GoalAcceptDialogComponent } from './components/goal-accept-dialog/goal-accept-dialog.component'
import { GoalRejectDialogComponent } from './components/goal-reject-dialog/goal-reject-dialog.component'
import { GoalCardComponent } from './components/goal-card/goal-card.component'
import { GoalCreateComponent } from './routes/goal-create/goal-create.component'
import { GoalTrackComponent } from './routes/goal-track/goal-track.component'
import { GoalHomeComponent } from './routes/goal-home/goal-home.component'
import { GoalNotificationComponent } from './routes/goal-notification/goal-notification.component'
import {
  MatProgressSpinnerModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatProgressBarModule,
  MatRadioModule,
  MatTabsModule,
  MatToolbarModule,
  MatInputModule,
  MatTooltipModule,
  MatDialogModule,
  MatListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatTableModule,
} from '@angular/material'
import { GoalMeComponent } from './routes/goal-me/goal-me.component'
import { GoalOthersComponent } from './routes/goal-others/goal-others.component'
import { PipeDurationTransformModule } from '@ws-widget/utils'
import { GoalCreateCommonComponent } from './components/goal-create-common/goal-create-common.component'
import { GoalCreateCustomComponent } from './components/goal-create-custom/goal-create-custom.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { GoalCommonCardComponent } from './components/goal-common-card/goal-common-card.component'
import { GoalTrackAcceptComponent } from './components/goal-track-accept/goal-track-accept.component'
import { GoalTrackRejectComponent } from './components/goal-track-reject/goal-track-reject.component'
import { GoalAcceptCardComponent } from './components/goal-accept-card/goal-accept-card.component'
import { GoalDeadlineTextComponent } from './components/goal-deadline-text/goal-deadline-text.component'
import { GoalShareDialogComponent } from './components/goal-share-dialog/goal-share-dialog.component'
import { GoalSharedDeleteDialogComponent } from './components/goal-shared-delete-dialog/goal-shared-delete-dialog.component'
import { GoalTrackPendingComponent } from './components/goal-track-pending/goal-track-pending.component'
import { NoAccessDialogComponent } from './components/no-access-dialog/no-access-dialog.component'

@NgModule({
  declarations: [
    GoalDeleteDialogComponent,
    GoalAcceptDialogComponent,
    GoalRejectDialogComponent,
    GoalCardComponent,
    GoalCreateComponent,
    GoalTrackComponent,
    GoalHomeComponent,
    GoalNotificationComponent,
    GoalMeComponent,
    GoalOthersComponent,
    GoalCreateCommonComponent,
    GoalCreateCustomComponent,
    GoalCommonCardComponent,
    GoalTrackAcceptComponent,
    GoalTrackRejectComponent,
    GoalAcceptCardComponent,
    GoalDeadlineTextComponent,
    GoalShareDialogComponent,
    GoalSharedDeleteDialogComponent,
    GoalTrackPendingComponent,
    NoAccessDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoalsRoutingModule,
    BtnPageBackModule,
    DisplayContentTypeModule,
    DisplayContentsModule,
    PipeDurationTransformModule,
    EmailInputModule,
    PickerContentModule,
    PipeDurationTransformModule,

    // Material Imports
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    UserAutocompleteModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTableModule,
  ],
  entryComponents: [
    GoalAcceptDialogComponent,
    GoalDeleteDialogComponent,
    GoalRejectDialogComponent,
    GoalSharedDeleteDialogComponent,
    GoalShareDialogComponent,
    NoAccessDialogComponent,
  ],
})
export class GoalsModule { }
