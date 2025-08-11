import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatRippleModule } from '@angular/material/core'
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SettingsComponent } from './settings.component'
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component'
import { SettingsService } from './settings.service'
// import { ProfileSettingsComponent } from '../../../person-profile/module/profile-settings/profile-settings.component'

@NgModule({
  declarations: [SettingsComponent, NotificationSettingsComponent,
    // ProfileSettingsComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTooltipModule,
  ],
  exports: [SettingsComponent],
  providers: [SettingsService],
})
export class SettingsModule { }
