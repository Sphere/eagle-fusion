import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription, of } from 'rxjs'
import { NsTnc } from '../../models/tnc.model'
import { LoggerService, ConfigurationsService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ROOT_WIDGET_CONFIG, NsError } from '@ws-widget/collection'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { SignupService } from '../signup/signup.service'
import { delay, mergeMap } from 'rxjs/operators'

@Component({
  selector: 'ws-new-tnc',
  templateUrl: './new-tnc.component.html',
  styleUrls: ['./new-tnc.component.scss'],
})
export class NewTncComponent implements OnInit, OnDestroy {
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  result: any
  userId = ''
  createUserForm!: FormGroup
  showAcceptbtn = true
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  userData: any
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private tncProtectedSvc: TncAppResolverService,
    private tncPublicSvc: TncPublicResolverService,
    private userProfileSvc: UserProfileService,
    private http: HttpClient,
    private signupService: SignupService,
  ) {
  }

  async ngOnInit() {
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.tnc.data) {
        this.tncData = response.tnc.data
        // this.configSvc.isNewUser = Boolean(this.tncData && this.tncData.isNewUser)
        this.isPublic = response.isPublic || false
      } else {
        this.router.navigate(['error-service-unavailable'])
        // this.errorFetchingTnc = true
      }
    })

    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe((userDetails: any) => {
        this.userData = userDetails
        if (userDetails.profileDetails) {
          if (userDetails.tcStatus === 'false') {
            this.showAcceptbtn = true
          } else {
            this.showAcceptbtn = false
          }

        } else {
          this.showAcceptbtn = true
        }
      })
    }

    this.result = await this.signupService.fetchStartUpDetails()
    this.createUserForm = this.createTncFormFields()
  }

  createTncFormFields() {
    return new FormGroup({
      tncAccepted: new FormControl(''),
      firstname: new FormControl('', []),
      middlename: new FormControl('', []),
      surname: new FormControl('', []),
      mobile: new FormControl('', []),
      telephone: new FormControl('', []),
      primaryEmail: new FormControl('', []),
      primaryEmailType: new FormControl('', []),
      dob: new FormControl('', []),
      regNurseRegMidwifeNumber: new FormControl('', []),
    })
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  getTnc(locale: string) {
    let dpData: NsTnc.ITncUnit
    if (this.tncData) {
      dpData = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      const tncTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      if (locale === tncTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignTncData(dpData, data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignTncData(dpData, data)
        })
      }
    }
  }
  private assignTncData(dpData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[1] = { ...dpData }
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  getDp(locale: string) {
    let tncData: NsTnc.ITncUnit
    if (this.tncData) {
      tncData = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      const dpTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      if (locale === dpTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      }
    }
  }
  assignDp(tncData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[0] = tncData
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  async gotoLogin() {
    // this.http.get('/apis/proxies/v8/logout/user').toPromise()
    // this.configSvc.userProfile = null
    // this.router.navigate(['/app/login'])
    try {
      const url = `${document.baseURI}public/home`
      const keycloakurl = `${document.baseURI}auth/realms/sunbird/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(url)}`
      window.location.href = keycloakurl
      await this.http.get('/apis/proxies/v8/logout/user').toPromise()
      localStorage.removeItem('telemetrySessionId')
      localStorage.removeItem('loginbtn')
      localStorage.removeItem('url_before_login')
      localStorage.removeItem('tocData')
      localStorage.removeItem(`userUUID`)
    } catch (error) { }
  }

  private constructReq(form: any) {
    const userObject = form.value
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    const profileReq = {
      profileReq: {
        id: this.userId,
        userId: this.userId,
        personalDetails: userObject,
      },
    }
    return profileReq
  }

  acceptTnc() {
    if (this.tncData) {
      const generalTnc = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Generic T&C',
      )[0]
      const dataPrivacy = this.tncData.termsAndConditions.filter(
        tncUnit => tncUnit.name === 'Data Privacy',
      )[0]
      const termsAccepted: NsTnc.ITermAccepted[] = []
      if (generalTnc) {
        termsAccepted.push({
          acceptedLanguage: generalTnc.language,
          docName: generalTnc.name,
          version: generalTnc.version,
        })
      }
      if (dataPrivacy) {
        termsAccepted.push({
          acceptedLanguage: dataPrivacy.language,
          docName: dataPrivacy.name,
          version: dataPrivacy.version,
        })
      }
      this.isAcceptInProgress = true

      this.createUserForm.controls.tncAccepted.setValue('true')
      if (this.configSvc.userProfile) {
        this.userId = this.configSvc.userProfile.userId || ''
        this.createUserForm.controls.primaryEmail.setValue(this.configSvc.userProfile.email || '')
        this.createUserForm.controls.firstname.setValue(this.configSvc.userProfile.firstName || '')
        this.createUserForm.controls.surname.setValue(this.configSvc.userProfile.lastName || '')
        this.createUserForm.controls.regNurseRegMidwifeNumber.setValue('[NA]')
      }
      let Obj: any
      if (localStorage.getItem('preferedLanguage')) {
        let data: any
        let lang: any
        data = localStorage.getItem('preferedLanguage')
        lang = JSON.parse(data)
        lang = lang !== 'en' ? lang : ''
        Obj = {
          preferences: {
            language: lang,
          },
        }
      }

      /* this changes for ebhyass*/
      if (this.userData.tcStatus === 'false') {
        const reqUpdate = {
          request: {
            userId: this.userId,
            profileDetails: Object.assign(this.userData.profileDetails, Obj),
            tcStatus: 'true',
          },
        }
        this.updateUser(reqUpdate)

      } else {
        const profileRequest = this.constructReq(this.createUserForm)
        const reqUpdate = {
          request: {
            userId: this.userId,
            profileDetails: Object.assign(profileRequest, Obj),
          },
        }
        this.updateUser(reqUpdate)
      }

    } else {
      this.errorInAccepting = false
    }
  }
  updateUser(reqUpdate: any) {
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      if (data) {
        this.configSvc.profileDetailsStatus = true
        this.configSvc.hasAcceptedTnc = true
        if (this.result.tncStatus) {
          if (this.configSvc.unMappedUser) {
            this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(100), mergeMap((userData: any) => {
              return of(userData)
            })).subscribe((userDetails: any) => {
              if (userDetails.profileDetails.profileReq.personalDetails.dob === undefined) {

                if (localStorage.getItem('url_before_login')) {
                  const courseUrl = localStorage.getItem('url_before_login')
                  this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
                } else {
                  location.href = '/page/home'
                }
              } else {
                if (userDetails.profileDetails.profileReq.personalDetails.dob) {
                  location.href = '/page/home'
                }
                location.href = localStorage.getItem('url_before_login') || ''
              }
            })
          }
        } else {
          location.href = '/page/home'
        }
        // location.href = '/page/home'
        // this.router.navigate(['/page/home'])
        //   .then(() => {
        //     window.location.reload()
        //   })
      }
    },
      (err: any) => {
        this.loggerSvc.error('ERROR ACCEPTING TNC:', err)
        // TO DO: Telemetry event for failure
        this.errorInAccepting = true
        this.isAcceptInProgress = false
      },
    )
  }

}
