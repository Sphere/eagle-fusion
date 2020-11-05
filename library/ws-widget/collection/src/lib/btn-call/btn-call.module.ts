import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnCallComponent } from './btn-call.component'
import { BtnCallDialogComponent } from './btn-call-dialog/btn-call-dialog.component'
import { MatIconModule, MatButtonModule, MatTooltipModule, MatSnackBarModule, MatDialogModule } from '@angular/material'

@NgModule({
  declarations: [BtnCallComponent, BtnCallDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  exports: [BtnCallComponent],
  entryComponents: [BtnCallComponent, BtnCallDialogComponent],
})
export class BtnCallModule { }
