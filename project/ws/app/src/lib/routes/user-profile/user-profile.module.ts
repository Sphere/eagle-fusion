import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatCardModule } from '@angular/material/card'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatRadioModule } from '@angular/material/radio'
import { MatChipsModule } from '@angular/material/chips'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatSelectModule } from '@angular/material/select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatTableModule } from '@angular/material/table'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { MatAutocompleteModule } from '@angular/material/autocomplete'

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
