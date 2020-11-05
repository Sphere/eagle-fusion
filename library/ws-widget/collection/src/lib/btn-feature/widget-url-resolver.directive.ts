import { Directive, HostListener, Input } from '@angular/core'
import { Router } from '@angular/router'
import { MobileAppsService } from '../../../../../../src/app/services/mobile-apps.service'

@Directive({
  selector: '[wsWidgetUrlResolver]',
})
export class WidgetUrlResolverDirective {
  constructor(
    private router: Router,
    // private mobileAppsSvc: MobileAppsService,
    private mobileAppsSvc: MobileAppsService,
  ) { }

  @Input() wsWidgetUrlResolver!: boolean
  @Input() url!: string
  @Input() mobileAppFunction?: string

  // @Input() mobileAppFunction?: string
  @HostListener('click', ['$event'])
  clicked(event: Event) {
    event.preventDefault()
    // if (this.mobileAppFunction && this.mobileAppsSvc.isMobile) {
    //   this.mobileAppsSvc.sendDataAppToClient(this.mobileAppFunction, {})
    //   return
    // }
    if (this.mobileAppFunction && this.mobileAppsSvc.isMobile) {
      this.mobileAppsSvc.sendDataAppToClient(this.mobileAppFunction, {})
      return
    }
    if (!this.url) {
      return
    }
    if (this.wsWidgetUrlResolver) {
      this.router.navigate(['/externalRedirect', { externalUrl: this.url }], {
        skipLocationChange: true,
      })
    } else {
      this.router.navigateByUrl(this.url)
    }
  }
}
