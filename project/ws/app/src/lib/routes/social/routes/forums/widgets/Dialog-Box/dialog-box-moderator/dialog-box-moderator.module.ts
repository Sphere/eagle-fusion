import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogBoxModeratorComponent } from './dialog-box-moderator.component'
import { MatIconModule } from '@angular/material/icon'
import { MatRadioModule } from '@angular/material/radio'
import { FormsModule } from '@angular/forms'
import { MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
@NgModule({
  declarations: [DialogBoxModeratorComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
  ],
  exports: [DialogBoxModeratorComponent],
})
export class DialogBoxModeratorModule { }
