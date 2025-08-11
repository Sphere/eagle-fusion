import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips'
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select'
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs'

import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { DisplayContentTypeModule } from '../_common/display-content-type/display-content-type.module'
import { PickerContentComponent } from './picker-content.component'

@NgModule({
  declarations: [PickerContentComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DefaultThumbnailModule,
    PipeDurationTransformModule,
    // material modules
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    DisplayContentTypeModule,
    MatSelectModule,
    MatTabsModule,
    MatRadioModule,
  ],
  exports: [PickerContentComponent],
})
export class PickerContentModule { }
