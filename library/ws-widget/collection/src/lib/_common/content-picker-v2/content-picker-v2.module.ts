import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentPickerV2Component } from './content-picker-v2.component'
import { RouterModule } from '@angular/router'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatRadioModule } from '@angular/material/radio'

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
