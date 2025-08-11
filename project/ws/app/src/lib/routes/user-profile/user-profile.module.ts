import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete'

import { UserProfileRoutingModule } from './user-profile-routing.module'
import { UserProfileComponent } from './components/user-profile/user-profile.component'
// import { TabDirective } from './components/user-profile/tab.directive'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { UserProfileService } from './services/user-profile.service'
import { LoaderService } from '@ws/author/src/public-api'
import { BtnPageBackModule } from '@ws-widget/collection'
import { ChatbotComponent } from './chatbot/chatbot/chatbot.component'
import { TextFieldModule } from '@angular/cdk/text-field'

@NgModule({
  declarations: [
    UserProfileComponent,
    ChatbotComponent,
  ],
  imports: [
    BtnPageBackModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UserProfileRoutingModule,
    SharedModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatListModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatAutocompleteModule,
    TextFieldModule
  ],
  providers: [UserProfileService, LoaderService],
})
export class UserProfileModule { }
