import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnKbComponent } from './btn-kb.component'
import {
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatTooltipModule,
  MatDividerModule,
} from '@angular/material'
import { BtnKbDialogComponent } from './btn-kb-dialog/btn-kb-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MarkAsCompleteModule } from '../_common/mark-as-complete/mark-as-complete.module'
import { BtnKbConfirmComponent } from './btn-kb-confirm/btn-kb-confirm.component'

@NgModule({
  declarations: [BtnKbComponent, BtnKbDialogComponent, BtnKbConfirmComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
    MarkAsCompleteModule,
    MatDividerModule,

  ],
  exports: [BtnKbComponent],
  entryComponents: [BtnKbDialogComponent, BtnKbConfirmComponent],
})
export class BtnKbModule { }
