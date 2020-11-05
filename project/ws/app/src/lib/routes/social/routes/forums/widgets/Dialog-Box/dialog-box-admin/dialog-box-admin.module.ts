import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule, MatDialogModule, MatIconModule, MatRadioModule } from '@angular/material'
import { MatFormFieldModule } from '@angular/material/form-field'
import { DialogBoxAdminComponent } from './dialog-box-admin.component'

@NgModule({
  declarations: [DialogBoxAdminComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  exports: [DialogBoxAdminComponent],
})
export class DialogBoxAdminModule { }
