import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsTnc } from '../../models/tnc.model'
import { LoggerService, ConfigurationsService } from '@ws-widget/utils'
// import { MatSnackBar } from '@angular/material'
// import { HttpClient } from '@angular/common/http'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ROOT_WIDGET_CONFIG, NsError } from '@ws-widget/collection'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient } from '@angular/common/http'
// import { Location } from '@angular/common'

@Component({
  selector: 'ws-new-tnc',
  templateUrl: './new-tnc.component.html',
  styleUrls: ['./new-tnc.component.scss'],
})
export class NewTncComponent implements OnInit, OnDestroy {
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  // errorFetchingTnc = false
  tncFlag = false
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  userId = ''
  createUserForm!: FormGroup
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    // private http: HttpClient,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private tncProtectedSvc: TncAppResolverService,
    private tncPublicSvc: TncPublicResolverService,
    private userProfileSvc: UserProfileService,
    private http: HttpClient,
    // location: Location
    // private snackBar: MatSnackBar,
  ) {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data && data.profileDetails.profileReq) {
            const userData = data.profileDetails.profileReq.personalDetails
            this.tncFlag = userData.dob || ''
          } else {
            const userData = data.profileDetails.personalDetails.dob
            this.tncFlag = userData.dob || ''
          }
        })
    }
  }

  ngOnInit() {
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

  gotoLogin() {
    this.http.get('/apis/proxies/v8/logout/user').toPromise()
    this.configSvc.userProfile = null
    this.router.navigate(['/app/login'])
  }

  private constructReq(form: any) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    const profileReq = {
      id: this.userId,
      userId: this.userId,
      personalDetails: {
        tncAccepted: form.value.tncAccepted,
        firstname: form.value.firstname,
        middlename: form.value.middlename,
        surname: form.value.surname,
        dob: form.value.dob,
        mobile: form.value.mobile,
        telephone: form.value.telephone,
        primaryEmail: form.value.primaryEmail,
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
      }
      const profileRequest = this.constructReq(this.createUserForm)
      const reqUpdate = {
        request: {
          userId: this.userId,
          profileDetails: profileRequest,
        },
      }

      this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
        if (data) {
          this.configSvc.profileDetailsStatus = true
          this.configSvc.hasAcceptedTnc = true
          // location.href = '/page/home'
          this.router.navigate(['/page/home'])
            .then(() => {
              window.location.reload()
            })
        }
      },
        (err: any) => {
          this.loggerSvc.error('ERROR ACCEPTING TNC:', err)
          // TO DO: Telemetry event for failure
          this.errorInAccepting = true
          this.isAcceptInProgress = false
        },
      )
    } else {
      this.errorInAccepting = false
    }
  }
  // postProcess() {
  //   this.http.patch('/apis/protected/v8/user/tnc/postprocessing', {}).subscribe()
  // }
  //   private openSnackbar(primaryMsg: string, duration: number = 3000) {
  //   this.snackBar.open(primaryMsg, undefined, {
  //     duration,
  //   })
  // }
}
