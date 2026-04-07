import { Component, Input, OnInit } from '@angular/core'
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { LoggerService } from '@ws-widget/utils'

@Component({
    selector: 'ws-mobile-profile-nav',
    templateUrl: './mobile-profile-nav.component.html',
    styleUrls: ['./mobile-profile-nav.component.scss'],
    
})
export class MobileProfileNavComponent implements OnInit {
  @Input() showbackButton?: boolean
  @Input() showLogOutIcon?: boolean
  @Input() trigerrNavigation?: boolean = false
  @Input() navigateTohome?: boolean = false
  constructor(
    private dialog: MatDialog,
    public router: Router,
    private contentSvc: WidgetContentService,
    private logger: LoggerService,
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
      const ob = {
        "type": "back",
        "back": true,
      }
      this.contentSvc.changeWork(ob)
    } else {
      const orgcheck = sessionStorage.getItem('work')
      const academicCheck = sessionStorage.getItem('academic')
      const eduList = sessionStorage.getItem('onListPage')
      this.logger.log(eduList)
      this.logger.log(academicCheck)
      this.logger.log(orgcheck)
      if (orgcheck) {
        const ob = {
          "type": "work",
          "back": true,
        }
        this.contentSvc.changeWork(ob)
      } else if (academicCheck && eduList === null) {
        const ob = {
          "type": "academic",
          "back": true,
        }
        this.contentSvc.changeWork(ob)
      } else {
        if (eduList) {
          const ob = {
            "type": "onListPage",
            "back": true,
          }
          this.contentSvc.changeWork(ob)
        }
      }
    }
    this.contentSvc.workMessage.subscribe(async (data: any) => {
      this.logger.log(data, 'back')
      if (data === undefined) {

      }
      // this.showView = await data
    })

    if (this.trigerrNavigation) {
      this.router.navigate(['/app/profile-view'])
    } else {
      if (this.navigateTohome) {
        if (localStorage.getItem('orgValue') === 'nhsrc') {
          this.router.navigateByUrl('/organisations/home')
        } else {
          this.logger.log("fasdfasdwew")
          // this.currentText = text.name
          const url = '/page/home'
          location.href = `${url3}${url}`
          // this.router.navigate(['/page/home'])
        }
      } else {
        const orgcheck = sessionStorage.getItem('work')
        const academicCheck = sessionStorage.getItem('academic')
        this.logger.log(academicCheck)
        this.logger.log(orgcheck)
        if (orgcheck) {
          const ob = {
            "type": "work",
            "back": true,
          }
          this.contentSvc.changeWork(ob)
        } else if (academicCheck) {
          const ob = {
            "type": "academic",
            "back": true,
          }
          this.contentSvc.changeWork(ob)
        } else {
          const backURL = sessionStorage.getItem('currentWindow')
          this.logger.log(backURL)
          const url = sessionStorage.getItem('clickedUrl') || ''
          sessionStorage.removeItem('clickedUrl')
          this.logger.log(url)
          //this.router.navigateByUrl(url)
        }
      }
    }
  }
}
