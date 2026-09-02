import { Component, Input, OnInit } from '@angular/core'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { LogoutComponent, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { LoggerService } from '@ws-widget/utils'
import { Observable } from 'rxjs'

@Component({
  standalone: false,
  selector: 'ws-mobile-profile-nav',
  templateUrl: './mobile-profile-nav.component.html',
  styleUrls: ['./mobile-profile-nav.component.scss'],

})
export class MobileProfileNavComponent implements OnInit {
  @Input() showbackButton?: boolean
  @Input() showLogOutIcon?: boolean
  @Input() trigerrNavigation?: boolean = false
  @Input() navigateTohome?: boolean = false
  isXSmall$: Observable<boolean>
  constructor(
    private readonly dialog: MatDialog,
    public router: Router,
    private readonly contentSvc: WidgetContentService,
    private readonly logger: LoggerService,
    private readonly valueSvc: ValueService,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
  }

  ngOnInit() {
    this.contentSvc.backMessage.subscribe((data: any) => {
      if (data) {
        sessionStorage.setItem('clickedUrl', data)
      }
    })
  }

  logout() {
    this.dialog.open<LogoutComponent, MatDialogConfig>(LogoutComponent, {
      panelClass: 'logout-dialog-container',
    })
  }

  backScreen() {
    this.logger.log('now')
    const backURL = sessionStorage.getItem('currentWindow')
    const url3 = `${document.baseURI}`
    this.logger.log(backURL)
    if (backURL) {
      this.contentSvc.changeWork({ "type": "back", "back": true })
    } else {
      this.handleNoBackUrl()
    }
    this.contentSvc.workMessage.subscribe((data: any) => {
      this.logger.log(data, 'back')
    })

    if (this.trigerrNavigation) {
      this.router.navigate(['/app/profile-view'])
    } else {
      this.handleNavigateAfterBack(url3)
    }
  }

  private handleNoBackUrl(): void {
    const orgcheck = sessionStorage.getItem('work')
    const academicCheck = sessionStorage.getItem('academic')
    const eduList = sessionStorage.getItem('onListPage')
    this.logger.log(eduList)
    this.logger.log(academicCheck)
    this.logger.log(orgcheck)
    if (orgcheck) {
      this.contentSvc.changeWork({ "type": "work", "back": true })
    } else if (academicCheck && eduList === null) {
      this.contentSvc.changeWork({ "type": "academic", "back": true })
    } else if (eduList) {
      this.contentSvc.changeWork({ "type": "onListPage", "back": true })
    }
  }

  private handleNavigateAfterBack(url3: string): void {
    if (this.navigateTohome) {
      this.navigateHome(url3)
    } else {
      this.handleWorkOrAcademicBack()
    }
  }

  private navigateHome(url3: string): void {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    } else {
      this.logger.log("fasdfasdwew")
      const url = '/page/home'
      location.href = `${url3}${url}`
    }
  }

  private handleWorkOrAcademicBack(): void {
    const orgcheck = sessionStorage.getItem('work')
    const academicCheck = sessionStorage.getItem('academic')
    this.logger.log(academicCheck)
    this.logger.log(orgcheck)
    if (orgcheck) {
      this.contentSvc.changeWork({ "type": "work", "back": true })
    } else if (academicCheck) {
      this.contentSvc.changeWork({ "type": "academic", "back": true })
    } else {
      const backURL = sessionStorage.getItem('currentWindow')
      this.logger.log(backURL)
      const url = sessionStorage.getItem('clickedUrl') || ''
      sessionStorage.removeItem('clickedUrl')
      this.logger.log(url)
    }
  }
}
