import { Component, OnInit, Input } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { Router } from '@angular/router'
@Component({
    standalone: false,
    selector: 'ws-public-toc-banner',
    templateUrl: './public-toc-banner.component.html',
    styleUrls: ['./public-toc-banner.component.scss'],

})
export class PublicTocBannerComponent implements OnInit {
  @Input() content: any
  tocConfig: any = null
  routelinK = 'license'
  displayStyle = 'none'

  /**
   * Display name for the author, matching what the authenticated TOC shows.
   *
   * `creator` is the raw username (e.g. `creatorjhpaastrika_0qfj`); the human name lives in
   * `creatorDetails[0].name`. This page is fed by the public search API, which returns
   * `creatorDetails` as a JSON **string**, while the content-service returns it already
   * parsed — so handle both rather than indexing blindly, which would yield `"["` and then
   * `undefined`. Falls back to `creator` so this can never render less than it does today.
   */
  get authorName(): string {
    const raw = this.content ? this.content.creatorDetails : null
    let details: any = raw
    if (typeof raw === 'string') {
      try {
        details = JSON.parse(raw)
      } catch {
        details = null
      }
    }
    const first = Array.isArray(details) ? details[0] : details
    return (first && first.name) || (this.content ? this.content.creator : '') || ''
  }
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
    this.http.get('fusion-assets/files/toc.json').pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }
}
