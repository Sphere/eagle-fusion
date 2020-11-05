import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatButtonModule,
  MatIconModule,
  MatTooltipModule,
  MatMenuModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatListModule,
  MatDialogModule,
} from '@angular/material'

import { BtnGoalsComponent } from './btn-goals.component'
import { BtnGoalsDialogComponent } from './btn-goals-dialog/btn-goals-dialog.component'
import { BtnGoalsSelectionComponent } from './btn-goals-selection/btn-goals-selection.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { BtnGoalsErrorComponent } from './btn-goals-error/btn-goals-error.component'

@NgModule({
  declarations: [BtnGoalsComponent, BtnGoalsDialogComponent, BtnGoalsSelectionComponent, BtnGoalsErrorComponent],
  imports: [
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatListModule,
    MatDialogModule,
  ],
  exports: [BtnGoalsComponent],
  entryComponents: [BtnGoalsComponent, BtnGoalsDialogComponent, BtnGoalsErrorComponent],
})
export class BtnGoalsModule { }
