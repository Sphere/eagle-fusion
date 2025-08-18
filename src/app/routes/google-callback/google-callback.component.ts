import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { WidgetContentService } from '@ws-widget/collection'
import { SignupService } from '../signup/signup.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'ws-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss'],
})
export class GoogleCallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private contentSvc: WidgetContentService,
    private signupService: SignupService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const tokenurl = this.router.url.split('&')
    const req = {
      idToken: tokenurl[1].replace('id_token=', ''),
    }
    // console.log(req.idToken)
    // const storageItem1 = localStorage.getItem(`google_token`)
    const url = this.router.url
    // let resStr = req.idToken.localeCompare(storageItem1)
    // console.log(resStr)
    // const storageItem2 = localStorage.getItem(`google_isSignedIn`)
    if (url.includes('/google/callback')) {
      // this.signinURL = `https://oauth2.googleapis.com/tokeninfo?id_token=${storageItem1}`
      // this.isSignedIn = true
      this.contentSvc.googleAuthenticate(req).subscribe(
        async (results: any) => {
          const result = await this.signupService.fetchStartUpDetails()
          if (result.status === 401) {
            this.openSnackbar(result.error.params.errmsg)
          }
          if (result.status === 419) {
            this.openSnackbar(result.error.params.errmsg)
          }
          if (result.status === 200 && result.roles.length > 0) {
            this.openSnackbar(results.msg)
            if (localStorage.getItem('url_before_login')) {
              location.href = localStorage.getItem('url_before_login') || ''
            } else {
              location.href = '/page/home'
            }
          }
        },
        (err: any) => {
          this.openSnackbar(err.error)
          // this.errorMessage = err.error
          this.router.navigate(['/app/login'])
        }
      )
    }
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
