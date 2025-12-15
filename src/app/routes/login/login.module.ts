import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

// Material modules
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSliderModule } from '@angular/material/slider'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatSelectModule } from '@angular/material/select'
import { MatAutocompleteModule } from '@angular/material/autocomplete'

// Components
import { RegisterComponent } from '../register/register.component'
import { LoginOtpComponent } from '../login-otp/login-otp.component'
import { BnrcLoginOtpComponent } from '../bnrc-login-otp/bnrc-login-otp.component'
import { CreateAccountComponent } from '../create-account/create-account.component'
import { YourLocationComponent } from '../your-location/your-location.component'
import { NewTncComponent } from '../new-tnc/new-tnc.component'
import { YourBackgroundComponent } from '../your-background/your-background.component'
import { AlmostDoneComponent } from '../almost-done/almost-done.component'
import { CompleteProfileComponent } from '../complete-profile/complete-profile.component'
import { MobileLoginComponent } from '../mobile-login/mobile-login.component'
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component'
import { ScrollDetectorDirective } from '../new-tnc/new-tnc.directive'
import { LoginComponent } from '../../component/login/login.component'
import { BnrcRegisterComponent } from '../bnrc-component/bnrc-register.component'
import { UpsmfRegisterComponent } from '../upsmf-component/upsmf-register.component'
import { MpRegisterComponent } from '../mp-component/mp-register.component'
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  declarations: [
    RegisterComponent,
    LoginOtpComponent,
    BnrcLoginOtpComponent,
    CreateAccountComponent,
    YourLocationComponent,
    NewTncComponent,
    YourBackgroundComponent,
    AlmostDoneComponent,
    CompleteProfileComponent,
    MobileLoginComponent,
    ForgotPasswordComponent,
    ScrollDetectorDirective,
    LoginComponent,
    BnrcRegisterComponent,
    UpsmfRegisterComponent,
    MpRegisterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatDialogModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class LoginModule { }
