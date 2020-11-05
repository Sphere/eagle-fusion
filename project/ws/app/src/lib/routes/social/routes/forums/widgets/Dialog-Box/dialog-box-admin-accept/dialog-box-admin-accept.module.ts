import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatRadioModule } from '@angular/material'
import { DialogBoxAdminAcceptComponent } from './dialog-box-admin-accept.component'

@NgModule({
  declarations: [DialogBoxAdminAcceptComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  exports: [DialogBoxAdminAcceptComponent],
})
export class DialogBoxAdminAcceptModule { }
