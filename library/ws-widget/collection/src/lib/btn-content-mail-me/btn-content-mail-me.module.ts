import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule } from '@angular/material'
import { BtnContentMailMeComponent } from './btn-content-mail-me.component'
import { BtnContentMailMeDialogComponent } from './btn-content-mail-me-dialog/btn-content-mail-me-dialog.component'

@NgModule({
  declarations: [BtnContentMailMeComponent, BtnContentMailMeDialogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  exports: [BtnContentMailMeComponent],
  entryComponents: [BtnContentMailMeComponent, BtnContentMailMeDialogComponent],
})
export class BtnContentMailMeModule { }
