import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentPickerV2Component } from './content-picker-v2.component'
import { RouterModule } from '@angular/router'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox'
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio'

import { SearchInputComponent } from './components/search-input/search-input.component'
import { FiltersComponent } from './components/filters/filters.component'

@NgModule({
  declarations: [ContentPickerV2Component, SearchInputComponent, FiltersComponent],
  imports: [
    CommonModule,
    RouterModule,
    DefaultThumbnailModule,
    PipeDurationTransformModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    MatRadioModule,
  ],
  exports: [
    ContentPickerV2Component,
  ],
})
export class ContentPickerV2Module { }
