import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'ws-login-otp',
  templateUrl: './login-otp.component.html',
  styleUrls: ['./login-otp.component.scss'],
})
export class LoginOtpComponent implements OnInit {
  loginOtpForm: FormGroup
  constructor(private fb: FormBuilder) {
    this.loginOtpForm = this.fb.group({
      code: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
  }

}
