import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'

const FALLBACK_ERROR = 'Something went wrong. Please try again or contact support@aastrika.org'

@Component({
  selector: 'ws-mnc-callback',
  templateUrl: './mnc-callback.component.html',
  styleUrls: ['./mnc-callback.component.scss']
})
export class MNCCallbackComponent implements OnInit {
  isLoading = false

  constructor(
    private orgService: OrgServiceService,
    private logger: LoggerService
  ) { }

  /**
   * Called on component load.
   * Reads the encrypted userToken from sessionStorage (set by index.html when
   * MNC portal redirects to /openid/MNC?userToken=<jwt>) and triggers the callback.
   */
  ngOnInit() {
    const mnc_userToken = sessionStorage.getItem('mnc_userToken') || null
    this.logger.log('[MNC] ngOnInit - userToken from sessionStorage:', mnc_userToken ? 'present' : 'missing')
    if (mnc_userToken) {
      this.isLoading = true
      this.logger.log('[MNC] Initiating callback with userToken')
      this.checkMNCCallback(mnc_userToken)
    } else {
      this.logger.log('[MNC] No userToken found in sessionStorage, skipping callback')
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
