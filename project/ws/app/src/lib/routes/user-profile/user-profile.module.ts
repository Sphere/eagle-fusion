import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule,
  MatSidenavModule,
  MatCardModule,
  MatExpansionModule,
  MatRadioModule,
  MatChipsModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule,
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
} from '@angular/material'
import { UserProfileRoutingModule } from './user-profile-routing.module'
import { UserProfileComponent } from './components/user-profile/user-profile.component'
// import { TabDirective } from './components/user-profile/tab.directive'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { UserProfileService } from './services/user-profile.service'
import { LoaderService } from '@ws/author/src/public-api'
import { BtnPageBackModule } from '@ws-widget/collection'
import { ChatbotComponent } from './chatbot/chatbot/chatbot.component'

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
    MatInputModule,
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
  ],
  providers: [UserProfileService, LoaderService],
})
export class UserProfileModule { }
