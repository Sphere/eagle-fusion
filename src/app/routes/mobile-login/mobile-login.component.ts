import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'ws-mobile-login',
  templateUrl: './mobile-login.component.html',
  styleUrls: ['./mobile-login.component.scss'],
})
export class MobileLoginComponent implements OnInit {
  loginForm: FormGroup
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
  }

  onSubmit(form: any) {
    console.log(form.value)
  }

}
