import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule, MatChipsModule, MatInputModule, MatIconModule, MatButtonModule } from '@angular/material'
import { SignupComponent } from './signup.component'
import { SignupRoutingModule } from './signup-routing.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component'

@NgModule({
  declarations: [SignupComponent, ForgotPasswordComponent],
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
