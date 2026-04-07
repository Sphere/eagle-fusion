import { Component, ElementRef, OnInit, ViewChild, OnDestroy, effect } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, LoggerService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'
import { constructReq } from '../request-util'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../../../../project/ws/app/src/public-api'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { LanguageService } from '../../../services/language.service'
import { TranslateService } from '@ngx-translate/core'
@Component({
    selector: 'ws-work-info-edit',
    templateUrl: './work-info-edit.component.html',
    styleUrls: ['./work-info-edit.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    ],
    
})
export class WorkInfoEditComponent implements OnInit, OnDestroy {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  workInfoForm: UntypedFormGroup
  userProfileData!: any
  userID = ''
  showbackButton = false
  showLogOutIcon = false
  workLog: any
  change: any
  userlang: any

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private UserAgentResolverService: UserAgentResolverService,
    private contentSvc: WidgetContentService,
    private languageSvc: LanguageService,
    private logger: LoggerService,
    private translate: TranslateService
  ) {
    this.workInfoForm = new UntypedFormGroup({
      organizationName: new UntypedFormControl('', [Validators.required]),
      designation: new UntypedFormControl('', [Validators.required]),
    })
    this.change = this.contentSvc.workMessage.subscribe(async (data: any) => {
      this.logger.log(data, 'here')
      this.workLog = await data
      const check = sessionStorage.getItem('work')
      this.logger.log(check)
      if (this.workLog) {
        this.getUserDetails()
      }
      this.logger.log(this.workLog.edit)
    })
    effect(() => {
      if (this.valueSvc.isMobile()) {
        this.showbackButton = true
        this.showLogOutIcon = false
      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
  }

  ngOnInit() {
    this.workLog = sessionStorage.getItem('work') || null
    this.getUserDetails()
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.professionalDetails && this.userProfileData.professionalDetails.length > 0) {
      const organisation = this.userProfileData.professionalDetails[0]
      this.workInfoForm.patchValue({
        organizationName: organisation.name,
        designation: organisation.designation,
      })
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.logger.log(data.profileDetails.profileReq)
            this.userProfileData = data.profileDetails.profileReq
            this.userlang = data
            if (this.workLog === 'true' || this.workLog.edit === true) {
              this.logger.log('true')
              this.updateForm()
            } else {
              this.workInfoForm.reset()
            }
            this.route.queryParams.subscribe(isEdit => {
              if (isEdit.isEdit) {
                this.updateForm()
              }
            })
          }
        })
    }
  }

  onSubmit(form: any) {
    this.logger.log(form, form.value)
    if (form.doj) {
      form.doj = changeformat(new Date(`${form.doj}`))
    }
    // ✅ Use LanguageService instead of checking location.href
    const local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : this.languageSvc.getCurrentLanguage() || 'en'
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    let profileRequest = constructReq(form, this.userProfileData, userAgent, userCookie)
    profileRequest.profileReq.personalDetails["profileLocation"] = 'sphere-web/work-info-edit'
    const obj = {

      preferences: {
        language: local === 'en' ? 'en' : 'hi',
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
      // personalDetails: profileRequest.profileReq.personalDetails,
    }
    profileRequest = Object.assign(profileRequest, obj)

    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: { ...profileRequest, profileLocation: 'sphere-web/work-info-edit' },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.workInfoForm.reset()
          this.openSnackbar(this.translate.instant("USER_UPDATE_SUCCESS"))
          this.router.navigate(['/app/workinfo-list'])
        }
      })
  }

  private openSnackbar(primaryMsg: string, duration = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  ngOnDestroy() {
    if (this.change) {
      this.change.unsubscribe()
    }
  }

}
