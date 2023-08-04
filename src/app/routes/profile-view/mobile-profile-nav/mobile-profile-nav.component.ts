import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router } from '@angular/router'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'

@Component({
  selector: 'ws-mobile-profile-nav',
  templateUrl: './mobile-profile-nav.component.html',
  styleUrls: ['./mobile-profile-nav.component.scss'],
})
export class MobileProfileNavComponent implements OnInit {
  @Input() showbackButton?: Boolean
  @Input() showLogOutIcon?: Boolean
  @Input() trigerrNavigation?: Boolean = false
  @Input() navigateTohome?: Boolean = false
  constructor(
    private dialog: MatDialog,
    public router: Router,
    private contentSvc: WidgetContentService,
  ) {
    this.contentSvc.backMessage.subscribe((data: any) => {
      if (data) {
        sessionStorage.setItem('clickedUrl', data)
      }
    })
  }

  ngOnInit() {
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }

  backScreen() {
    if (this.trigerrNavigation) {
      this.router.navigate(['/app/profile-view'])
    } else {
      if (this.navigateTohome) {
        if (localStorage.getItem('orgValue') === 'nhsrc') {
          this.router.navigateByUrl('/organisations/home')
        } else {
          this.router.navigate(['/page/home'])
        }
      } else {
        const url = sessionStorage.getItem('clickedUrl') || ''
        sessionStorage.removeItem('clickedUrl')
        this.router.navigateByUrl(url)
      }
    }
  }
}
