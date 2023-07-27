import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../request-util'
// import * as _ from 'lodash'
import { ActivatedRoute, Router } from '@angular/router'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

@Component({
  selector: 'ws-education-edit',
  templateUrl: './education-edit.component.html',
  styleUrls: ['./education-edit.component.scss'],
})
export class EducationEditComponent implements OnInit {
  educationForm: FormGroup
  academics: any = []
  userID = ''
  userProfileData!: any
  showbackButton = false
  showLogOutIcon = false
  cName = ''
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  yearPattern = /^(19[5-9]\d|20[0-2]\d|2030)$/
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private UserAgentResolverService: UserAgentResolverService,
  ) {
    this.educationForm = new FormGroup({
      courseDegree: new FormControl('', [Validators.required]),
      courseName: new FormControl('', [Validators.pattern(/^[a-z][a-z\s]*$/)]),
      institutionName: new FormControl('', [Validators.required, Validators.pattern(/^[a-z][a-z\s]*$/)]),
      yearPassing: new FormControl('', [Validators.required, Validators.pattern(this.yearPattern)]),
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
    this.educationForm.controls['courseName'].valueChanges.subscribe(
      (selectedValue) => {
        this.cName = selectedValue
      }
    )
  }


  ngOnInit() {
    this.getUserDetails()
    this.route.queryParams.subscribe(params => {
      if (params.nameOfInstitute) {
        this.updateForm(params)
      }
    })
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = true

      } else {
        this.showbackButton = true
        this.showLogOutIcon = false
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
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
          }
        })
    }
  }

  onSubmit(form: any) {
    console.log(form)
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    let userAgent = this.UserAgentResolverService.getUserAgent()
    let userCookie = this.UserAgentResolverService.generateCookie()

    let profileRequest = constructReq(form, this.userProfileData, userAgent, userCookie)
    const obj = {
      personalDetails: profileRequest.profileReq.personalDetails
    }
    profileRequest = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          form.reset()
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.userProfileSvc._updateuser.next('true')
          this.router.navigate(['/app/education-list'])
        }
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
