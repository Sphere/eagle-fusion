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
    console.log('now')
    let backURL = sessionStorage.getItem('currentWindow')
    console.log(backURL)
    if (backURL) {
      let ob = {
        "type": "back",
        "back": true
      }
      this.contentSvc.changeWork(ob)
    } else {
      let orgcheck = sessionStorage.getItem('work')
      let academicCheck = sessionStorage.getItem('academic')
      console.log(academicCheck)
      console.log(orgcheck)
      if (orgcheck) {
        let ob = {
          "type": "work",
          "back": true
        }
        this.contentSvc.changeWork(ob)
      } else if (academicCheck) {
        let ob = {
          "type": "academic",
          "back": true
        }
        this.contentSvc.changeWork(ob)
      }
    }
    this.contentSvc.workMessage.subscribe(async (data: any) => {
      console.log(data, 'back')
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
          this.router.navigate(['/page/home'])
        }
      } else {
        let orgcheck = sessionStorage.getItem('work')
        let academicCheck = sessionStorage.getItem('academic')
        console.log(academicCheck)
        console.log(orgcheck)
        if (orgcheck) {
          let ob = {
            "type": "work",
            "back": true
          }
          this.contentSvc.changeWork(ob)
        } else if (academicCheck) {
          let ob = {
            "type": "academic",
            "back": true
          }
          this.contentSvc.changeWork(ob)
        } else {
          let backURL = sessionStorage.getItem('currentWindow')
          console.log(backURL)
          const url = sessionStorage.getItem('clickedUrl') || ''
          sessionStorage.removeItem('clickedUrl')
          console.log(url)
          //this.router.navigateByUrl(url)
        }
      }
    }
  }
}
