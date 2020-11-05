import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ContentPickerV2Component } from './content-picker-v2.component'
import { RouterModule } from '@angular/router'
import { DefaultThumbnailModule, PipeDurationTransformModule } from '@ws-widget/utils'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatSidenavModule,
  MatListModule,
  MatTooltipModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatMenuModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatRadioModule,
} from '@angular/material'
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
