import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
// import * as _ from 'lodash'
import { MatSnackBar, DateAdapter, MAT_DATE_FORMATS } from '@angular/material'
import { constructReq } from '../request-util'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../../../../project/ws/app/src/public-api'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

@Component({
  selector: 'ws-work-info-edit',
  templateUrl: './work-info-edit.component.html',
  styleUrls: ['./work-info-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class WorkInfoEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  workInfoForm: FormGroup
  userProfileData!: any
  userID = ''
  showbackButton = false
  showLogOutIcon = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
    private UserAgentResolverService: UserAgentResolverService,
  ) {
    this.workInfoForm = new FormGroup({
      doj: new FormControl('', [Validators.required]),
      organizationName: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit() {
    this.getUserDetails()
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

  updateForm() {
    if (this.userProfileData && this.userProfileData.professionalDetails && this.userProfileData.professionalDetails.length > 0) {
      const organisation = this.userProfileData.professionalDetails[0]
      this.workInfoForm.patchValue({
        doj: this.getDateFromText(organisation.doj),
        organizationName: organisation.name,
        designation: organisation.designation,
        location: organisation.location,
      })
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
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
    console.log(form, form.value)
    if (form.doj) {
      form.doj = changeformat(new Date(`${form.doj}`))
    }

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
          this.workInfoForm.reset()
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.router.navigate(['/app/workinfo-list'])
        }
      })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  private getDateFromText(dateString: string): any {
    if (dateString) {
      const splitValues: string[] = dateString.split('-')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = `${yyyy}-${mm}-${dd}`
      return new Date(dateToBeConverted)
    }
    return ''
  }
}
