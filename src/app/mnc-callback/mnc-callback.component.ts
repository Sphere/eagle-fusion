import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from 'project/ws/app/src/lib/routes/org/org-service.service'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'
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
   * The backend extracts user data (firstName, lastName, email, phone, rmNumber, role)
   * from the token using the shared secret agreed with the MNC portal.
   * On success, redirects to the MNC org-details page.
   * On 400/419 error, redirects to home (token invalid or expired).
   */
  checkMNCCallback(userToken: any) {
    this.logger.log('[MNC] Sending userToken to backend')
    const data = { userToken }
    try {
      // POST to MNC_Auth endpoint — backend verifies JWT and creates/updates user
      this.orgService.setMNCId(data).subscribe((res: any) => {
        this.logger.log('[MNC] Backend response:', res)
        localStorage.setItem('loc', JSON.stringify(res))
        if (res.message === 'success') {
          this.logger.log('[MNC] Success - redirecting to org-details')
          location.href = '/app/org-details?orgId=Maharashtra%20Nursing%20Council'
        }
      }, (err: any) => {
        this.logger.log('[MNC] API error - status:', err.status, 'error:', err)
        if (err.status === 400 || err.status === 419) {
          // Token invalid or expired — send user back to home
          this.logger.log('[MNC] Token invalid/expired - redirecting to home')
          location.href = '/public/home'
        }
      })
    } catch (err) {
      this.logger.log('[MNC] Unexpected error in checkMNCCallback:', err)
      location.href = '/public/home'
    }
  }
}