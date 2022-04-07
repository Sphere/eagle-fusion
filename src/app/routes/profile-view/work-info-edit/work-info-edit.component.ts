import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import moment from 'moment'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
import { MatSnackBar } from '@angular/material'
@Component({
  selector: 'ws-work-info-edit',
  templateUrl: './work-info-edit.component.html',
  styleUrls: ['./work-info-edit.component.scss'],
})
export class WorkInfoEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDoj = false
  workInfoForm: FormGroup
  userProfileData!: any
  userID = ''
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute) {
    this.workInfoForm = new FormGroup({
      doj: new FormControl('', []),
      organizationName: new FormControl('', []),
      designation: new FormControl('', []),
      location: new FormControl('', []),
    })
  }

  ngOnInit() {
    this.getUserDetails()
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.professionalDetails && this.userProfileData.professionalDetails.length > 0) {
      const organisation = this.userProfileData.professionalDetails[0]
      this.workInfoForm.patchValue({
        doj: this.getDateFromText(organisation.doj),
        organizationName: organisation.name,
        designation: organisation.designation,
        location: organisation.location
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
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            this.route.queryParams.subscribe((isEdit) => {
              if (isEdit.isEdit) {
                this.updateForm()
              }
            })
          }
        })
    }
  }
  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDoj = false
    } else {
      this.invalidDoj = true
    }
  }
  onSubmit(form: any) {
    console.log(form)

    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = this.constructReq(form)
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
          this.router.navigate(['/app/workinfo-list'])
        }

      })
  }
  private constructReq(form: any) {
    const userid = this.userProfileData.userId || this.userProfileData.id || ''
    const profileReq = {
      id: userid,
      userId: userid,
      professionalDetails: [...this.getOrganisationsHistory(form)]
    }
    return { profileReq }
  }


  private getOrganisationsHistory(form: any) {
    const organisations: any = []
    const org = {
      organisationType: '',
      name: form.value.orgName,
      nameOther: form.value.orgNameOther,
      industry: form.value.industry,
      industryOther: form.value.industryOther,
      designation: form.value.designation,
      designationOther: form.value.designationOther,
      location: form.value.location,
      responsibilities: '',
      doj: form.value.doj,
      description: form.value.orgDesc,
      completePostalAddress: '',
      additionalAttributes: {},
      osid: _.get(this.userProfileData, 'professionalDetails[0].osid') || undefined,
    }
    if (form.value.isGovtOrg) {
      org.organisationType = 'Government'
    } else {
      org.organisationType = 'Non-Government'
    }
    organisations.push(org)
    return organisations
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
