import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router } from '@angular/router'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'

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
    private configSvc: ConfigurationsService,
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
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    let url1 = local === 'hi' ? 'hi' : ""
    let url3 = `${document.baseURI}`
    if (url3.includes('hi')) {
      url3 = url3.replace(/hi\//g, '')
    }
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
      let eduList = sessionStorage.getItem('onListPage')
      console.log(eduList)
      console.log(academicCheck)
      console.log(orgcheck)
      if (orgcheck) {
        let ob = {
          "type": "work",
          "back": true
        }
        this.contentSvc.changeWork(ob)
      } else if (academicCheck && eduList === null) {
        let ob = {
          "type": "academic",
          "back": true
        }
        this.contentSvc.changeWork(ob)
      } else {
        if (eduList) {
          let ob = {
            "type": "onListPage",
            "back": true
          }
          this.contentSvc.changeWork(ob)
        }
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
          console.log("fasdfasdwew")
          // this.currentText = text.name
          let url = '/page/home'
          location.href = `${url3}${url1}${url}`
          // this.router.navigate(['/page/home'])
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
