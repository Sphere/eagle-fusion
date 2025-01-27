import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatChipsModule } from '@angular/material/chips'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { SignupComponent } from './signup.component'
import { SignupRoutingModule } from './signup-routing.module'

@NgModule({
  declarations: [SignupComponent],
  imports: [
    SignupRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
  exports: [SignupComponent],
})
export class SignupModule { }
