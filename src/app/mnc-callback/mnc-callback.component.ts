import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError } from 'rxjs/operators'
import { of } from 'rxjs'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { API_END_POINTS } from '../constants/apiConstants'

const FALLBACK_ERROR = 'Something went wrong. Please try again or contact support@aastrika.org'

@Component({
  standalone: false,
  selector: 'ws-mnc-callback',
  templateUrl: './mnc-callback.component.html',
  styleUrls: ['./mnc-callback.component.scss'],
})
export class MNCCallbackComponent implements OnInit {
  isLoading = false

  constructor(
    private orgService: OrgServiceService,
    private logger: LoggerService,
    private http: HttpClient
  ) { }

  /**
   * Called on component load.
   * Clears any existing session first so a second user logging in via MNC SSO
   * on the same browser does not inherit the previous user's connect.sid cookie.
   * Then reads the encrypted userToken from sessionStorage and triggers the callback.
   */
  ngOnInit() {
    const tokenFromUrl = new URLSearchParams(window.location.search).get('token')
    const mnc_userToken = tokenFromUrl || sessionStorage.getItem('mnc_userToken') || null
    this.logger.log('[MNC] ngOnInit - token source:', tokenFromUrl ? 'URL param' : (mnc_userToken ? 'sessionStorage' : 'missing'))
    if (mnc_userToken) {
      this.isLoading = true
      this.logger.log('[MNC] Clearing existing session before login')
      this.http.get(API_END_POINTS.LOGOUT_USER).pipe(
        catchError(err => {
          this.logger.log('[MNC] Session clear failed (non-fatal):', err.status)
          return of(null)
        })
      ).subscribe(() => {
        this.logger.log('[MNC] Session cleared, initiating callback')
        this.checkMNCCallback(mnc_userToken)
      })
    } else {
      this.logger.log('[MNC] No userToken found in URL or sessionStorage, skipping callback')
    }
  }

  /**
   * Sends the encrypted userToken (JWT) to the backend for verification and decoding.
   * On success, redirects to the MNC org-details page.
   * On error, shows a snackbar with the message from the backend, then redirects to home.
   */
  checkMNCCallback(userToken: any) {
    this.logger.log('[MNC] Sending userToken to backend')
    const data = { userToken }
    try {
      this.orgService.setMNCId(data).subscribe((res: any) => {
        this.logger.log('[MNC] Backend response:', res)
        localStorage.setItem('loc', JSON.stringify(res))
        if (res.message === 'success') {
          this.logger.log('[MNC] Success - redirecting to org-details')
          sessionStorage.removeItem('mnc_userToken')
          location.href = '/app/org-details?orgId=Maharashtra%20Nursing%20Council'
        }
      }, (err: any) => {
        this.logger.log('[MNC] API error - status:', err.status, 'error:', err)
        this.isLoading = false
        const message = (err.error && err.error.message) ? err.error.message : FALLBACK_ERROR
        this.showErrorToast(message)
      })
    } catch (err) {
      this.logger.log('[MNC] Unexpected error in checkMNCCallback:', err)
      this.isLoading = false
      this.showErrorToast(FALLBACK_ERROR)
    }
  }

  /**
   * Stores the error message in sessionStorage and redirects to /public/home,
   * where the snackbar is shown after the page loads.
   */
  private showErrorToast(message: string) {
    sessionStorage.setItem('mnc_error', message)
    location.href = '/public/home'
  }
}
