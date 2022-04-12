import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import moment from 'moment'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '../../../../../project/ws/app/src/public-api'
import { DateAdapter, MatSnackBar, MAT_DATE_FORMATS } from '@angular/material'
import { constructReq } from '../request-util'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-personal-detail-edit',
  templateUrl: './personal-detail-edit.component.html',
  styleUrls: ['./personal-detail-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class PersonalDetailEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDob = false
  personalDetailForm: FormGroup
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  profileUserName: any
  userID = ''
  savebtnDisable = true
  orgTypeField = false

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'Mother/Family Member', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']

  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private matSnackBar: MatSnackBar
  ) {
    this.personalDetailForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      profession: new FormControl(),
      regNurseRegMidwifeNumber: new FormControl(),
      orgType: new FormControl(),
      organizationName: new FormControl(),
      nationality: new FormControl(),
      domicileMedium: new FormControl(),
      gender: new FormControl(),
      maritalStatus: new FormControl(),
      knownLanguages: new FormControl([], []),
      mobile: new FormControl(),
      postalAddress: new FormControl(),
      pincode: new FormControl(),
    })
  }

  ngOnInit() {
    this.getUserDetails()
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            this.updateForm()
          }
        })
    }
  }

  professionalChange(value: any) {
    this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.orgTypeField = false
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
    } else {
      this.orgTypeField = true
    }
  }

  fieldChange() {
    this.savebtnDisable = false
  }

  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDob = false
      this.savebtnDisable = false
    } else {
      this.invalidDob = true
      this.savebtnDisable = true
    }
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.personalDetails) {
      const data = this.userProfileData

      this.profileUserName = `${data.personalDetails.firstname} `
      if (data.personalDetails.middlename) {
        this.profileUserName += `${data.personalDetails.middlename} `
      }
      if (data.personalDetails.surname) {
        this.profileUserName += `${data.personalDetails.surname}`
      }

      this.personalDetailForm.patchValue({
        userName: this.profileUserName,
        dob: this.getDateFromText(data.personalDetails.dob),
        profession: data.professionalDetails[0].designationOther,
        regNurseRegMidwifeNumber: data.personalDetails.regNurseRegMidwifeNumber,
        orgType: data.professionalDetails[0].organisationType,
        organizationName: data.professionalDetails[0].name,
        nationality: data.personalDetails.nationality,
        domicileMedium: data.personalDetails.domicileMedium,
        gender: data.personalDetails.gender,
        maritalStatus: data.personalDetails.maritalStatus,
        knownLanguages: data.personalDetails.knownLanguages,
        mobile: data.personalDetails.mobile,
        postalAddress: data.personalDetails.postalAddress,
        pincode: data.personalDetails.pincode,
      })
    }
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

  onSubmit(form: any) {
    if (form.value.dob) {
      form.value.dob = changeformat(new Date(`${form.value.dob}`))
    }

    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.router.navigate(['/app/profile-view'])
        }
      })
  }

  private openSnackbar(message: string) {
    this.matSnackBar.open(message)
  }

}
