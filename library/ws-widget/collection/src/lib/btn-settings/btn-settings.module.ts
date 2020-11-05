import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import {
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatListModule,
  MatTooltipModule,
} from '@angular/material'
import { BtnSettingsComponent } from './btn-settings.component'

@NgModule({
  declarations: [BtnSettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatListModule,
    MatTooltipModule,
  ],
  exports: [BtnSettingsComponent],
  entryComponents: [BtnSettingsComponent],
})
export class BtnSettingsModule { }
