import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import {
  Observable,
  Subscription,
  of,
} from 'rxjs'
import { NsTnc } from '../../models/tnc.model'
import { LoggerService, ConfigurationsService, ValueService } from '@ws-widget/utils'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ROOT_WIDGET_CONFIG, NsError } from '@ws-widget/collection'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
import { SignupService } from '../signup/signup.service'
import { delay, mergeMap } from 'rxjs/operators'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { get } from 'lodash'
import { MatDialog } from '@angular/material/dialog'
import { CreateAccountDialogComponent } from '../create-account-modal/create-account-dialog.component'
import { constructReq } from '../profile-view/request-util'

@Component({
  selector: 'ws-new-tnc',
  templateUrl: './new-tnc.component.html',
  styleUrls: ['./new-tnc.component.scss'],
})
export class NewTncComponent implements OnInit, OnDestroy {
  //@ViewChild('scrollContainer') scrollContainer: ElementRef
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  result: any
  userId = ''
  createUserForm!: UntypedFormGroup
  showAcceptbtn = true
  lang: any
  termsAccepted: any
  shouldScrollToBottom: boolean = false; // Set this to enable/disable scrolling
  tncAcceptedBtn: boolean = false
  showTnc: boolean = false
  showTerms: string = ''
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  userData: any
  isXSmall$: Observable<boolean>
  langDialog: any
  userProfileData!: any

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
    private UserAgentResolverService: UserAgentResolverService,
    private readonly valueSvc: ValueService,
    public dialog: MatDialog,
    private logger: LoggerService
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
  }

  ngOnInit(): void {
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.tnc.data) {
        this.tncData = response.tnc.data
        this.isPublic = response.isPublic || false
      } else {
        this.router.navigate(['error-service-unavailable'])
      }
    })
    this.logger.log("this.configSvc.unMappedUser", this.configSvc.unMappedUser)

    // Initialize form first
    this.signupService.fetchStartUpDetails().then(result => {
      this.result = result
      this.createUserForm = this.createTncFormFields()
      this.checkTncAcceptanceStatus()
    })
  }

  private checkTncAcceptanceStatus(): void {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (userDetails: any) => {
          this.userData = userDetails
          this.logger.log("this.userData", this.userData)
          // Check if tncAccepted is undefined (not accepted yet)
          const tncAccepted = userDetails.profileDetails?.profileReq?.personalDetails?.tncAccepted
          this.showAcceptbtn = tncAccepted === undefined || tncAccepted === null || tncAccepted === false
          this.logger.log("TNC Accepted:", tncAccepted, "Show Button:", this.showAcceptbtn)
        },
        (error: any) => {
          this.logger.error('Error fetching user details:', error)
          this.showAcceptbtn = true // Show button if there's an error fetching details
        }
      )
    } else {
      // If unMappedUser is not available, check result.userId
      if (this.result && this.result.userId) {
        this.showAcceptbtn = true
      }
    }
  }
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.help()
      event.preventDefault()
    }
  }
  help() {
    this.langDialog = this.dialog.open(CreateAccountDialogComponent, {
      panelClass: 'language-modal',
      width: '345px',
      height: '335px',
      data: {
        selected: "help",
      },
    })
  } tncChecked() {
    this.tncAcceptedBtn = !this.tncAcceptedBtn
  }
  handleScrollToBottom(isAtBottom: boolean): void {
    this.logger.log(isAtBottom)
    if (isAtBottom) {
      this.logger.log('Scrolled to the bottom of the page!')
      this.shouldScrollToBottom = true
    } else {
      this.shouldScrollToBottom = false
    }
  }
  showTncPage(name: string) {
    this.showTnc = true
    this.showTerms = name
  }
  backToTncHome() {
    this.showTnc = false
  }
  handleScroll(isScrolled: boolean): void {
    this.logger.log('User is scrolling within the div!', isScrolled)
    if (isScrolled) {
      this.logger.log('Scrolled to the bottom of the page!')
      this.shouldScrollToBottom = true
    } else {
      this.shouldScrollToBottom = false
    }
  }
  createTncFormFields() {
    return new UntypedFormGroup({
      tncAccepted: new UntypedFormControl(''),
      firstname: new UntypedFormControl('', []),
      middlename: new UntypedFormControl('', []),
      surname: new UntypedFormControl('', []),
      mobile: new UntypedFormControl('', []),
      telephone: new UntypedFormControl('', []),
      primaryEmail: new UntypedFormControl('', []),
      primaryEmailType: new UntypedFormControl('', []),
      dob: new UntypedFormControl('', []),
      regNurseRegMidwifeNumber: new UntypedFormControl('', []),
      osName: new UntypedFormControl('', []),
      browserName: new UntypedFormControl('', []),
      userCookie: new UntypedFormControl('', []),
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
        this.tncPublicSvc.getPublicTnc().subscribe(data => {
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
        this.tncPublicSvc.getPublicTnc().subscribe(data => {
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
      window.location.href = url
      await this.http.get('/apis/proxies/v8/logout/user').toPromise()
      //sessionStorage.clear()
      sessionStorage.removeItem('login-btn')
      //localStorage.removeItem('preferedLanguage')
      localStorage.removeItem('telemetrySessionId')
      localStorage.removeItem('loginbtn')
      localStorage.removeItem('url_before_login')
      localStorage.removeItem('tocData')
      localStorage.removeItem(`userUUID`)
    } catch (error) { }
  }

  // private constructReq(form: any) {
  //   debugger
  //   const userObject = form.value
  //   Object.keys(userObject).forEach(key => {
  //     if (userObject[key] === '') {
  //       delete userObject[key]
  //     }
  //   })

  //   if (this.configSvc.userProfile) {
  //     this.userId = this.configSvc.userProfile.userId
  //   }

  //   const profileReq = {
  //     profileReq: {
  //       //id: this.userId,
  //       //userId: this.userId,
  //       id: this.result.userId,
  //       userId: this.result.userId,
  //       personalDetails: userObject,
  //     },
  //   }
  //   profileReq.profileReq.personalDetails['postalAddress'] = 'India, Tamil nadu, Chennai'
  //   if (this.configSvc.orgSelectiveCourseConfig && this.configSvc.orgSelectiveCourseConfig.orgId === this.configSvc.userProfile?.rootOrgId) {
  //     let professionalDetails = this.configSvc.professionalDetails
  //     // let professionalDetails = [
  //     //   {
  //     //     designation: 'TNNMC-Student',
  //     //     name: 'Tamil nadu nurses and midwives council - pre service',
  //     //     orgType: 'Public/Government Sector',
  //     //     profession: 'Healthcare Worker',
  //     //   }
  //     // ]

  //     this.logger.log("professionalDetails", professionalDetails)
  //     if (professionalDetails && professionalDetails.length > 0) {
  //       profileReq.profileReq['professionalDetails'] = professionalDetails
  //     }
  //   }
  //   return profileReq
  // }
  homePage() {
    if (this.result.userId) {
      location.href = '/page/home'
    }
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
        this.termsAccepted = generalTnc.version
      }
      if (dataPrivacy) {
        termsAccepted.push({
          acceptedLanguage: dataPrivacy.language,
          docName: dataPrivacy.name,
          version: dataPrivacy.version,
        })
      }
      this.isAcceptInProgress = true
      const paramMap = this.activatedRoute.snapshot.queryParamMap
      const params: any = {}

      paramMap.keys.forEach((key: any) => {
        const paramValue = paramMap.get(key)
        params[key] = paramValue
      })

      // this.paramsJSON = JSON.stringify(params)

      this.createUserForm.controls.tncAccepted.setValue('true')
      const userAgent = this.UserAgentResolverService.getUserAgent()
      const userCookie = this.UserAgentResolverService.generateCookie()
      this.logger.log('userCookie: ', userCookie)
      if (this.configSvc.userProfile) {
        this.userId = this.configSvc.userProfile.userId
        this.createUserForm.controls.primaryEmail.setValue(this.configSvc.userProfile.email || '')
        this.createUserForm.controls.firstname.setValue(this.configSvc.userProfile.firstName || '')
        this.createUserForm.controls.surname.setValue(this.configSvc.userProfile.lastName || '')
        this.createUserForm.controls.regNurseRegMidwifeNumber.setValue('[NA]')
        this.createUserForm.controls.osName.setValue(userAgent.OS || '')
        this.createUserForm.controls.browserName.setValue(userAgent.browserName || '')
        this.createUserForm.controls.userCookie.setValue(userCookie || '')
      }
      //let Obj: any
      if (localStorage.getItem('preferedLanguage')) {
        let data: any
        data = localStorage.getItem('preferedLanguage')
        this.lang = JSON.parse(data)
        this.lang = this.lang.id !== 'en' ? this.lang.id : 'en'
        // Obj = {
        //   preferences: {
        //     language: this.lang,
        //   },
        // }
      } else {
        this.lang = 'en'
      }
      /* this changes for ebhyass*/
      //if (this.userData!.tcStatus === 'false') {
      // const reqUpdate = {
      //   request: {
      //     userId: this.userId,
      //     profileDetails: Object.assign(this.userData.profileDetails, Obj),
      //     tcStatus: 'true',
      //   },
      // }
      // this.updateUser(reqUpdate)

      //} else {
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
          async (data: any) => {
            if (data) {
              this.userProfileData = await data.profileDetails.profileReq
              // let profileRequest = this.constructReq(this.createUserForm)
              const source = this.UserAgentResolverService.getSource()
              const userSource = source ? JSON.parse(source) : null
              const obj = {
                preferences: {
                  language: this.lang,
                },
                ...(userSource ? { userSource } : {})
                // personalDetails: profileRequest.profileReq.personalDetails
              }
              this.logger.log("this.userProfileData", this.userProfileData)
              let profileRequest = constructReq(this.createUserForm, this.userProfileData, userAgent, userCookie)

              profileRequest = Object.assign(profileRequest, obj)
              profileRequest.profileReq.personalDetails["profileLocation"] = 'sphere-web/new-tnc'
              profileRequest.profileReq.personalDetails["tncAccepted"] = 'true'
              const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig
              const rootOrgId = this.configSvc.userProfile?.rootOrgId || this.configSvc.unMappedUser?.rootOrgId
              if (orgSelectiveConfig && orgSelectiveConfig.orgId) {
                if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
                  profileRequest.profileReq.personalDetails["dob"] = '01/01/2000'
                }
              }
              const reqUpdate = {
                request: {
                  userId: this.result.userId,
                  // profileDetails: Object.assign(profileRequest, Obj),
                  profileDetails: { ...profileRequest, profileLocation: 'sphere-web/new-tnc' },
                  tncAcceptedVersion: this.termsAccepted,
                  tncAcceptedOn: new Date().getTime()
                },
              }
              this.logger.log(reqUpdate, 'sss')
              this.logger.log(this.termsAccepted)
              this.updateUser(reqUpdate)
              //}
            }
          })
      }


    } else {
      this.errorInAccepting = false
    }
  }
  updateUser(reqUpdate: any) {
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(async data => {
      const res = await data
      this.logger.log(res.result.response)
      if (res.result.response === 'SUCCESS') {
        localStorage.removeItem('utm_source')
        this.configSvc.profileDetailsStatus = true
        this.configSvc.hasAcceptedTnc = true

        const rootOrgId = this.configSvc.userProfile?.rootOrgId || this.configSvc.unMappedUser?.rootOrgId
        const orgSelectiveConfig = this.configSvc.orgSelectiveCourseConfig

        if (this.result.tncStatus) {
          if (this.configSvc.unMappedUser) {
            this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(400), mergeMap((userData: any) => {
              return of(userData)
            })).subscribe((userDetails: any) => {
              if (!this.userProfileSvc.isBackgroundDetailsFilled(get(userDetails, 'profileDetails.profileReq'))) {
                if (localStorage.getItem('url_before_login')) {
                  const courseUrl = localStorage.getItem('url_before_login')
                  this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
                } else {
                  this.navigateToHome(rootOrgId, orgSelectiveConfig, 'background-incomplete')
                }
              } else {
                // Background details are filled - redirect to url_before_login if available
                const urlBeforeLogin = localStorage.getItem('url_before_login')
                if (urlBeforeLogin) {
                  this.logger.log('Redirecting to url_before_login:', urlBeforeLogin)
                  window.location.href = urlBeforeLogin
                } else {
                  // No url_before_login, redirect to home
                  this.navigateToHome(rootOrgId, orgSelectiveConfig, 'background-complete')
                }
              }
            })
          }
        } else {
          this.navigateToHome(rootOrgId, orgSelectiveConfig, 'tnc-not-accepted')
        }
      }
    },
      (err: any) => {
        this.loggerSvc.error('ERROR ACCEPTING TNC:', err)
        this.errorInAccepting = true
        this.isAcceptInProgress = false
      },
    )
  }

  private navigateToHome(rootOrgId: string, orgSelectiveConfig: any, scenario: string) {
    let homePath = '/page/home'
    let queryParams: any = {}

    // Check if user belongs to selective org config
    if (orgSelectiveConfig && orgSelectiveConfig.orgId === rootOrgId) {
      const redirectUrl = orgSelectiveConfig.redirectUrl || '/app/org-selective-course'
      this.logger.log(`Redirecting to selective org [${scenario}]:`, redirectUrl)

      const urlParts = redirectUrl.split('?')
      homePath = urlParts[0]

      if (urlParts[1]) {
        const params = new URLSearchParams(urlParts[1])
        params.forEach((value, key) => {
          queryParams[key] = value
        })
      }
    } else {
      this.logger.log(`Redirecting to home [${scenario}]`)
    }

    const cleanPath = homePath.startsWith('/') ? homePath.slice(1) : homePath
    const pathSegments = cleanPath.split('/').filter(Boolean)

    const finalPath = pathSegments.length ? `/${pathSegments.join('/')}` : homePath
    const queryString = Object.keys(queryParams).length
      ? '?' +
      Object.entries(queryParams)
        .map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`)
        .join('&')
      : ''

    this.logger.log('Reloading page for:', finalPath)
    window.location.assign(`${location.origin}${finalPath}${queryString}`)
  }



}
