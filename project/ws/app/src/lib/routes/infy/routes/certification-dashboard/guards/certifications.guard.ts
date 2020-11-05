import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router'

import { ConfigurationsService } from '@ws-widget/utils'

@Injectable()
export class CertificationsGuard implements CanActivate {
  constructor(private configSvc: ConfigurationsService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot) {
    const requiredFeatures: string[] = (next.data && next.data.requiredFeatures) || []

    if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
      const requiredFeaturesMissing = requiredFeatures.some(item =>
        (this.configSvc.restrictedFeatures || new Set()).has(item),
      )

      if (requiredFeaturesMissing) {
        this.router.navigate(['/app/profile/assess/certification'])
        return false
      }
    }

    return true
  }
}
