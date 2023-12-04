import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material'
import { Router } from '@angular/router'
import { ConfigurationsService, ValueService, LogoutComponent } from '../../../../../library/ws-widget/utils/src/public-api'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MobileAboutPopupComponent } from '../../mobile-about-popup/mobile-about-popup.component'
import { ProfileSelectComponent } from '../profile-select/profile-select.component'
import { forkJoin, from } from 'rxjs'
// import * as  _ from 'lodash'
import { DomSanitizer } from '@angular/platform-browser'
import { map, mergeMap } from 'rxjs/operators'
import { ConfigService as CompetencyConfiService } from '../../competency/services/config.service'
import * as _ from './lodash'
import { FormControl, FormGroup } from '@angular/forms'
@Component({
  selector: 'ws-mobile-profile-dashboard',
  templateUrl: './mobile-profile-dashboard.component.html',
  styleUrls: ['./mobile-profile-dashboard.component.scss'],
})
export class MobileProfileDashboardComponent implements OnInit {
  showMobileView = false
  showAcademicElse = false
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  certificates: any = []
  imgURI: any = []
  certificateThumbnail: any = []
  photoUrl: any
  image = '/fusion-assets/icons/prof1.png'
  loader = true
  showbackButton = false
  showLogOutIcon = false
  profileData: any
  navigateTohome = true
  selectedIndex = 'personal'
  showView: any = ''
  gotData: any
  userForm: FormGroup
  userData: any
  hideData = false
  currentProfession: any
  showLogOutBtn = false
  // language: any
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private contentSvc: WidgetContentService,
    private domSanitizer: DomSanitizer,
    private valueSvc: ValueService,
    private CompetencyConfiService: CompetencyConfiService
  ) {
    this.gotData = this.contentSvc.workMessage.subscribe(async (data: any) => {
      console.log(data)
      if (data.type === 'work' || data.type === 'academic') {
        if (data.back === true || data.edit === 'save') {
          this.showView = ''
        } else {
          this.showView = await data
        }
      }
      if (data.type === 'onListPage') {
        this.hideData = false
        this.selectedIndex = 'personal'
        this.selectedIndex = ''
      }
      if (data.type === 'back' && this.showMobileView) {
        this.hideData = false
        this.selectedIndex = 'personal'
        this.selectedIndex = ''
      }
      // sessionStorage.removeItem('academic')
      sessionStorage.removeItem('currentWindow')
    })
    this.userForm = new FormGroup({
      language: new FormControl(),
    })
  }

  ngOnInit() {
    if (sessionStorage.getItem('currentWindow')) {
      sessionStorage.removeItem('currentWindow')
    }
    this.userProfileSvc.updateuser$.pipe().subscribe(item => {
      if (item) {
        // this.selectedIndex = 'academic'
        this.getUserDetails()
      }
    })
    forkJoin([this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id),
    this.contentSvc.fetchUserBatchList(this.configSvc.unMappedUser.id)]).pipe().subscribe((res: any) => {
      this.loader = false
      this.profileData = _.get(res[0], 'profileDetails.profileReq')
      this.setAcademicDetail(res[0])
      this.processCertiFicate(res[1])
    })

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.showMobileView = isXSmall
      if (isXSmall) {
        this.selectedIndex = ''
        this.showbackButton = true
        this.showLogOutIcon = true
        this.showLogOutBtn = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
        this.showLogOutBtn = true
      }
    })

    // this.CompetencyConfiService.setConfig(this.profileData)
  }
  changeFunction(text: string) {
    if (text === 'organization') {
      sessionStorage.setItem('currentWindow', 'organization')
      this.showView = ''
      sessionStorage.removeItem('work')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text == 'language') {
      window.scroll(0, 0)
      sessionStorage.setItem('currentWindow', 'language')
      this.showLogOutIcon = false
      this.getUserDetails()
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text === 'personal') {
      sessionStorage.setItem('currentWindow', 'personal')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
    if (text && this.showMobileView) {
      console.log(text, 'mobileview', this.showMobileView)
      this.hideData = true
    }
    if (text === 'academic') {
      sessionStorage.setItem('currentWindow', 'education')
    }

    if (text === 'certificates') {
      // this.hideData = true
      window.scroll(0, 0)
      sessionStorage.setItem('currentWindow', 'certificates')
      if (sessionStorage.getItem('onListPage')) {
        sessionStorage.removeItem('onListPage')
      }
    }
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }
  processCertiFicate(data: any) {

    const certificateIdArray = _.map(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), 'identifier')
    this.formateRequest(data)
    from(certificateIdArray).pipe(
      map(certId => {
        this.certificateThumbnail.push({ identifier: certId })
        return certId
      }),
      mergeMap(certId =>
        this.contentSvc.getCertificateAPI(certId)
      )
    ).subscribe(() => {
      setTimeout(() => {
        this.contentSvc.updateValue$.subscribe((res: any) => {
          if (res) {
            _.forEach(this.certificates, cvalue => {
              if (res[cvalue.identifier]) {
                cvalue['image'] = this.domSanitizer.bypassSecurityTrustUrl(res[cvalue.identifier])
                cvalue['printUri'] = res[cvalue.identifier]
              }
            })
          }
        })
      }, 500)
    })

  }

  formateRequest(data: any) {
    const issuedCertificates = _.reduce(_.flatten(_.filter(_.map(data, 'issuedCertificates'), certificate => {
      return certificate.length > 0
    })), (result: any, value) => {
      result.push({
        identifier: value.identifier,
        name: value.name,
      })
      return result
    }, [])
    this.certificates = issuedCertificates
  }

  openAboutDialog() {
    if (this.userProfileSvc.isBackgroundDetailsFilled(this.profileData)) {
      const dialogRef = this.dialog.open(MobileAboutPopupComponent, {
        width: '312px',
        height: '369px',
        data: this.userProfileData.personalDetails.about ? this.userProfileData.personalDetails.about : '',
      })

      dialogRef.afterClosed().subscribe(result => {
        // tslint:disable-next-line: no-console
        console.log('The dialog was closed', result)
      })
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `/page/home` } })
    }
  }
  assignProfession(data: any) {
    this.currentProfession = data
  }
  setAcademicDetail(data: any) {
    if (data) {
      this.userProfileData = data.profileDetails.profileReq
      this.currentProfession = this.userProfileData.professionalDetails[0].profession
      if (_.get(this.userProfileData, 'personalDetails')) {
        this.photoUrl = this.userProfileData.personalDetails.photo
      } else {
        this.photoUrl = this.userProfileData.photo
      }

      if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
        this.academicsArray = this.userProfileData.academics
      }
      this.CompetencyConfiService.setConfig(this.userProfileData, data.profileDetails)
    }
  }
  saveLanguage(form: any) {
    const obj = {
      preferences: {
        language: form.value.language,
      },
    }
    const userdata = Object.assign(this.userData['profileDetails'], obj)
    //   // this.chosenLanguage = path.value
    const reqUpdate = {
      request: {
        userId: this.userData.identifier,
        profileDetails: userdata,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(result => {
      console.log(result)
      if (form.value.language === 'en') {
        // this.chosenLanguage = ''
        window.location.assign(`${location.origin}/app/profile-view`)
        // window.location.reload(true)
      } else {
        // window.location.reload(true)
        window.location.assign(`${location.origin}/${form.value.language}/app/profile-view`)
      }
    },
      () => {
      })
    // })
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        async (data: any) => {
          if (data) {
            this.loader = false
            this.userProfileData = await data.profileDetails.profileReq
            this.userData = await data
            this.currentProfession = this.userProfileData.professionalDetails[0].profession
            const lang = (data && data.profileDetails && data.profileDetails!.preferences && data.profileDetails!.preferences!.language !== undefined) ? data.profileDetails.preferences.language : location.href.includes('/hi/') ? 'hi' : 'en'
            console.log(lang)
            this.userForm.patchValue({ language: lang })
            if (this.userProfileData.academics && Array.isArray(this.userProfileData.academics)) {
              this.academicsArray = this.userProfileData.academics
            }
            if (this.userProfileData.personalDetails.photo) {
              this.photoUrl = this.userProfileData.personalDetails.photo
            }
          }
        })
    }
  }

  openProfileDialog(): void {
    const dialogRef = this.dialog.open(ProfileSelectComponent, {
      width: '600px',
    })
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line: no-console
      console.log('The dialog was closed', result)
    })
  }

  eductionEdit() {
    this.navigate(`app/education-list`)
  }

  workInfoEdit() {
    this.navigate(`app/workinfo-list`)
  }

  personalDetailEdit() {
    this.navigate('app/personal-detail-edit')
  }

  navigate(navigateUrl: any) {
    if (this.userProfileSvc.isBackgroundDetailsFilled(this.profileData)) {
      this.router.navigate([navigateUrl])
    } else {
      this.router.navigate(['/app/about-you'], { queryParams: { redirect: `/page/home` } })
    }
  }

  openCompetency(event: any) {
    console.log(event)
    this.router.navigate([`app/user/self-assessment`])
  }
  ngOnDestroy() {
    if (this.gotData) {
      this.gotData.unsubscribe()
    }
  }

  openCompetencyDashboard(event: any) {
    console.log(event)
    this.router.navigate([`app/user/competency`])
  }
}
