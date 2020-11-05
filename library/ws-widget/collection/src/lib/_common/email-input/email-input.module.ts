import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EmailInputComponent } from './email-input.component'
import { MatFormFieldModule, MatChipsModule, MatInputModule, MatIconModule } from '@angular/material'

@NgModule({
  declarations: [EmailInputComponent],
  imports: [
    CommonModule,

    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  exports: [EmailInputComponent],
})
export class EmailInputModule { }
