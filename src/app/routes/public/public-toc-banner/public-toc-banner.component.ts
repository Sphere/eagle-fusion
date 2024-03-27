import { Component, OnInit, Input } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { Router } from '@angular/router'
@Component({
  selector: 'ws-public-toc-banner',
  templateUrl: './public-toc-banner.component.html',
  styleUrls: ['./public-toc-banner.component.scss'],
})
export class PublicTocBannerComponent implements OnInit {
  @Input() content: any
  tocConfig: any = null
  routelinK = 'license'
  displayStyle = 'none'
  constructor(
    private http: HttpClient,
    private signUpSvc: SignupService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.fetchTocConfig()
  }

  showPopup() {
    this.displayStyle = 'block'
  }
  closePopup() {
    this.displayStyle = 'none'
  }
  login() {
    this.signUpSvc.keyClockLogin()
  }
  createAcct() {
    if (localStorage.getItem('preferedLanguage')) {
      localStorage.removeItem('preferedLanguage')
    }
    this.router.navigateByUrl('app/create-account')
  }
  fetchTocConfig() {
    this.http.get('assets/configurations/feature/toc.json').pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }
}
