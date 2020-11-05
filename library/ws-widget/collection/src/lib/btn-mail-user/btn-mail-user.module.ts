import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
} from '@angular/material'

import { BtnMailUserComponent } from './btn-mail-user.component'
import { BtnMailUserDialogComponent } from './btn-mail-user-dialog/btn-mail-user-dialog.component'

@NgModule({
  declarations: [BtnMailUserComponent, BtnMailUserDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  exports: [BtnMailUserComponent],
  entryComponents: [BtnMailUserComponent, BtnMailUserDialogComponent],
})
export class BtnMailUserModule { }
