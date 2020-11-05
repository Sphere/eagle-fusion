import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSidenavModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSelectModule,
} from '@angular/material'
import {
  BtnPageBackModule,
  DisplayContentsModule,
  DisplayContentTypeModule,
  EmailInputModule,
  PickerContentModule,
  UserAutocompleteModule,
  UserImageModule,
} from '@ws-widget/collection'
import { DialogAssignComponent } from './components/dialog-assign/dialog-assign.component'
import {
  DialogUserRoleSelectComponent,
} from './components/dialog-user-role-select/dialog-user-role-select.component'
import { UserFilterDisplayComponent } from './components/user-filter-display/user-filter-display.component'
import { ContentAssignmentRoutingModule } from './content-assignment-routing.module'
import { ContentAssignmentGuard } from './guards/content-assignment.guard'
import { AssignmentDetailsComponent } from './routes/assignment-details/assignment-details.component'
import { ContentAssignmentComponent } from './routes/content-assignment/content-assignment.component'

@NgModule({
  entryComponents: [DialogAssignComponent, DialogUserRoleSelectComponent],
  declarations: [
    ContentAssignmentComponent,
    UserFilterDisplayComponent,
    DialogAssignComponent,
    DialogUserRoleSelectComponent,
    AssignmentDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BtnPageBackModule,
    DisplayContentTypeModule,
    DisplayContentsModule,
    EmailInputModule,
    PickerContentModule,
    UserImageModule,

    // Material Imports
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatCardModule,
    MatGridListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatToolbarModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    UserAutocompleteModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTableModule,
    MatSidenavModule,
    MatStepperModule,
    MatSelectModule,
    ContentAssignmentRoutingModule,
  ],
  providers: [ContentAssignmentGuard],
})
export class ContentAssignmentModule { }
