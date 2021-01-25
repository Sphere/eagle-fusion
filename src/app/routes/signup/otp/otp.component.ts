import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'ws-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup | undefined

  constructor() { }

  ngOnInit() {
    this.otpForm = new FormGroup({
      otp: new FormControl('', [Validators.required])
    })
  }

}
