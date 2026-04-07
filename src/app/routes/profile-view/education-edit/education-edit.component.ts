import { Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService, ValueService, LoggerService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../request-util'
import { ActivatedRoute } from '@angular/router'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { WidgetContentService } from '../../../../../library/ws-widget/collection/src/public-api'
import { LanguageService } from '../../../services/language.service'
import { TranslateService } from '@ngx-translate/core'
@Component({
    standalone: false,
    selector: 'ws-education-edit',
    templateUrl: './education-edit.component.html',
    styleUrls: ['./education-edit.component.scss'],
    
})
export class EducationEditComponent implements OnInit {
  educationForm: UntypedFormGroup
  academics: any = []
  userID = ''
  userProfileData!: any
  showbackButton = false
  showLogOutIcon = false
  cName = ''
  workLog: any
  change: any
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  yearPattern = /^(19[5-9]\d|20[0-2]\d|2030)$/
  isEditableForSphere = false
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private UserAgentResolverService: UserAgentResolverService,
    private contentSvc: WidgetContentService,
    private langSvc: LanguageService,
    private logger: LoggerService,
    private translate: TranslateService
  ) {
    this.educationForm = new UntypedFormGroup({
      courseDegree: new UntypedFormControl('', [Validators.required]),
      courseName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][a-zA-Z\s]*$/)]),
      institutionName: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z\s]*$/)]),
      yearPassing: new UntypedFormControl('', [Validators.required, Validators.pattern(this.yearPattern)]),
    })
    this.academics = [
      {
        type: 'X_STANDARD',
      },
      {
        type: 'XII_STANDARD',
      },
      {
        type: 'GRADUATE',
      },
      {
        type: 'POSTGRADUATE',

      },
    ]
    this.educationForm.controls['courseName'].valueChanges.subscribe(selectedValue => {
      this.cName = selectedValue
    }
    )
    this.change = this.contentSvc.workMessage.subscribe(async (data: any) => {
      this.logger.log(data, 'here')
      this.workLog = await data
      if (this.workLog) {
        this.getUserDetails()
      }
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
    const eduLog: any = sessionStorage.getItem('academic') || null
    this.workLog = JSON.parse(eduLog)

    if (this.workLog === 'true' || this.workLog.edit === true) {
      this.updateForm(this.workLog.academic)
    } else {
      this.educationForm.reset()
    }
    this.getUserDetails()
    this.route.queryParams.subscribe(params => {
      if (params.nameOfInstitute) {
        this.updateForm(params)
      }
    })
  }
  updateForm(data?: any) {
    this.educationForm.patchValue({
      courseDegree: data.type === 'X_STANDARD' ? this.academics[0] : data.type
        === 'XII_STANDARD' ? this.academics[1] : data.type === 'GRADUATE' ? this.academics[2] : this.academics[3],
      courseName: data.nameOfQualification,
      institutionName: data.nameOfInstitute,
      yearPassing: data.yearOfPassing,
    })
    if (data.nameOfQualification) {
      this.cName = data.nameOfQualification
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        async (data: any) => {
          if (data) {
            this.isEditableForSphere = await this.UserAgentResolverService.isEditableForSphere(data)
            if (this.isEditableForSphere) {
              this.educationForm.enable()
            } else {
              this.educationForm.disable()
            }
            this.userProfileData = data.profileDetails.profileReq
          }
        })
    }
  }

  onSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()

    let profileRequest = constructReq(form, this.userProfileData, userAgent, userCookie)
    const local = (this.configSvc?.unMappedUser?.profileDetails?.preferences?.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : this.langSvc.getCurrentLanguage()
    this.logger.log(local)
    profileRequest.profileReq.personalDetails["profileLocation"] = 'sphere-web/education-edit'

    const obj = {
      preferences: {
        language: local === 'en' ? 'en' : 'hi',
      },
      userSource: this.configSvc.unMappedUser?.profileDetails?.userSource || null,
      // personalDetails: profileRequest.profileReq.personalDetails
    }
    profileRequest = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          ...profileRequest, profileLocation: 'sphere-web/education-edit',
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          form.reset()
          this.openSnackbar(this.translate.instant("USER_UPDATE_SUCCESS"))
          this.userProfileSvc._updateuser.next('true')
          const ob = {
            "type": "academic",
            "edit": 'save',

          }
          this.contentSvc.changeWork(ob)
        }
      })
  }
  private openSnackbar(primaryMsg: string, duration = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
