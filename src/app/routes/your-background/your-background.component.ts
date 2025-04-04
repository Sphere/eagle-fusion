import { HttpClient } from '@angular/common/http'
import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

@Component({
  selector: 'ws-your-background',
  templateUrl: './your-background.component.html',
  styleUrls: ['./your-background.component.scss'],
})
export class YourBackgroundComponent implements OnInit {
  @Input() aboutYou: any
  bgImgSelect: any
  almostDone = false
  professions: any
  nextBtnDisable = true
  userId = ''
  firstName = ''
  middleName = ''
  lastName = ''
  email = ''
  selectedAddress: any
  professionUrl = '../../../fusion-assets/files/professions.json'
  constructor(
    private http: HttpClient,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private UserAgentResolverService: UserAgentResolverService,
  ) { }

  ngOnInit() {
    this.http.get(this.professionUrl).subscribe((data: any) => {
      if (this.aboutYou.value.country !== 'India') {
        this.professions = data.professions.filter((s: any) => {
          return s.name !== 'ASHA'
        })
      } else {
        this.professions = data.professions
      }
    })
    this.nextBtnDisable = true
  }
  imgSelect(img: any) {
    if (img) {
      this.nextBtnDisable = false
    }
    this.bgImgSelect = img.name
    this.onsubmit()
  }
  changeBackgroung() {
    this.almostDone = false
  }

  updateProfile() {
    if (this.configSvc.userProfile) {

      this.userId = this.configSvc.userProfile.userId || ''
      this.email = this.configSvc.userProfile.email || ''
      this.firstName = this.configSvc.userProfile.firstName || ''
      this.middleName = this.configSvc.userProfile.middleName || ''
      this.lastName = this.configSvc.userProfile.lastName || ''
    }
    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'
    this.selectedAddress = this.aboutYou.value.country
    if (this.aboutYou.value.state) {
      this.selectedAddress += ', ' + `${this.aboutYou.value.state}`
    }
    if (this.aboutYou.value.distict) {
      this.selectedAddress += ', ' + `${this.aboutYou.value.distict}`
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    const userObject: any = {
      firstname: this.firstName,
      middlename: this.middleName,
      surname: this.lastName,
      regNurseRegMidwifeNumber: '[NA]',
      primaryEmail: this.email,
      dob: this.aboutYou.value.dob,
      postalAddress: this.selectedAddress,
      osName: userAgent.OS,
      browserName: userAgent.browserName,
      userCookie,
      profileLocation: 'sphere-web/your-background',
    }
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })
    const reqUpdate = {
      request: {
        userId: this.userId,
        profileDetails: {
          profileLocation: 'sphere-web/your-background',
          profileReq: {
            id: this.userId,
            userId: this.userId,
            personalDetails: userObject,
          },
        },
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      if (data) {
        if (local === 'en') {
          this.openSnackbar('User profile details updated successfully!')
        } else {
          this.openSnackbar('उपयोगकर्ता प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया!')
        }

      }
    })
  }

  onsubmit() {
    if (this.bgImgSelect) {
      if (this.bgImgSelect === 'Mother/Family Member') {
        this.updateProfile()
        this.activateRoute.queryParams.subscribe(params => {
          const url = params.redirect
          if (url) {
            localStorage.removeItem('url_before_login')
            this.router.navigate([url])
          } else {
            this.router.navigate(['page', 'home'])
          }
        })
      } else {
        this.almostDone = true
      }
    }
  }
  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
