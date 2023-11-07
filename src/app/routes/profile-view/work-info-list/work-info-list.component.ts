import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
// import { Router } from '@angular/router'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { IUserProfileDetailsFromRegistry } from '../../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { WidgetContentService } from '@ws-widget/collection'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
// import { constructReq } from '../request-util'
import { MatSnackBar } from '@angular/material'
import get from 'lodash/get'
import { NsUserProfileDetails } from '@ws/app/src/lib/routes/user-profile/models/NsUserProfile'
import * as _ from 'lodash'

@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})

export class WorkInfoListComponent implements OnInit {
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  personalDetailForm: FormGroup
  orgTypeField = false
  orgOthersField = false
  rnShow = false
  professionOtherField = false
  showDesignation = false
  showAshaField = false
  userID = ''
  ePrimaryEmailType = NsUserProfileDetails.EPrimaryEmailType
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    // private router: Router,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private UserAgentResolverService: UserAgentResolverService,
    private snackBar: MatSnackBar,
  ) {
    this.personalDetailForm = new FormGroup({
      profession: new FormControl(),
      designation: new FormControl(),
      professionOtherSpecify: new FormControl(),
      regNurseRegMidwifeNumber: new FormControl(),
      orgType: new FormControl(),
      orgOtherSpecify: new FormControl(),
      organizationName: new FormControl(),
      block: new FormControl(),
      subcentre: new FormControl(),
    })
  }

  ngOnInit() {
    this.getUserDetails()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = false

      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {

            const newData = data.profileDetails.profileReq
            this.userProfileData = data.profileDetails.profileReq
            if (newData && newData.professionalDetails) {
              (newData.professionalDetails[0].orgType === 'Others' && newData.professionalDetails[0].orgOtherSpecify) ? this.orgOthersField = true : this.orgOthersField = false;
              (newData.professionalDetails[0].profession === 'Others' && newData.professionalDetails[0].professionOtherSpecify) ? this.professionOtherField = true : this.professionOtherField = false;
              (newData.professionalDetails[0].designation) ? this.showDesignation = true : this.showDesignation = false
              newData.professionalDetails[0].profession === 'Healthcare Worker' ? this.rnShow = true : this.rnShow = false
              newData.professionalDetails[0].profession === 'ASHA' ? this.showAshaField = true : this.showAshaField = false

              this.personalDetailForm.patchValue({
                profession: newData.professionalDetails[0].profession,
                professionOtherSpecify: newData.professionalDetails[0].professionOtherSpecify,
                orgType: newData.professionalDetails[0].orgType,
                orgOtherSpecify: newData.professionalDetails[0].orgOtherSpecify,
                organizationName: newData.professionalDetails[0].name,
                block: newData.professionalDetails[0].block,
                subcentre: newData.professionalDetails[0].subcentre,
                designation: newData.professionalDetails[0].designation,
              })
              if (newData.professionalDetails[0].profession === 'Healthcare Worker') {
                this.personalDetailForm.patchValue({
                  regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,
                })
              }
            }
          }
        })
    }
  }
  professionalChange(value: any) {
    console.log("degree", value, this.userProfileData)
    // this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.rnShow = true
      this.showDesignation = true
      this.orgTypeField = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.showAshaField = false
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.showAshaField = false
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'ASHA') {
      this.showAshaField = true
    } else if (value === 'Faculty') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
      this.showAshaField = false
    } else if (value === 'Others') {
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
      this.showAshaField = false
    } else if (value === 'Student') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.rnShow = false
      this.showAshaField = false
    } else {
      this.orgTypeField = true
      this.rnShow = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.personalDetailForm.controls.orgType.setValue(null)
    }
  }

  orgTypeSelect(option: any) {
    // this.savebtnDisable = false
    if (option !== 'null') {
      this.personalDetailForm.controls.orgType.setValue(option)
    } else {
      this.personalDetailForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      this.personalDetailForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.personalDetailForm.controls.orgOtherSpecify.clearValidators()
      this.personalDetailForm.controls.orgOtherSpecify.setValue('')
    }
  }

  onSubmit(form: any) {
    console.log('form submission', form.value, this.userProfileData)
    // console.log("degree", value, this.userProfileData)
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }

    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    let profileRequest = this.constructReq(form)
    const obj = {
      preferences: {
        language: local === 'en' ? 'en' : 'hi',
      },
      personalDetails: profileRequest.profileReq.personalDetails,
    }
    profileRequest = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: profileRequest,
      },
    }
    console.log('request update', reqUpdate, get(form.value, 'profession'))
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          // form.reset()
          console.log(res, 'res')
          if (local === 'en') {
            this.openSnackbar(this.toastSuccess.nativeElement.value)
          } else {
            this.openSnackbar('उपयोगकर्ता प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किया गया!')
          }

          // this.userProfileSvc._updateuser.next('true')
          const ob = {
            type: 'work',
            edit: 'save',

          }
          this.contentSvc.changeWork(ob)
          // this.router.navigate(['/app/education-list'])
        }
      })
  }



  private constructReq(form: any) {
    const userid = this.userProfileData.userId || this.userProfileData.id || ''
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()
    const profileReq = {
      id: userid,
      userId: userid,
      photo: form.value.photo,
      personalDetails: {
        firstname: this.userProfileData.personalDetails.firstname,
        middlename: this.userProfileData.personalDetails.middlename,
        surname: this.userProfileData.personalDetails.surname,
        about: this.userProfileData.personalDetails.about,
        dob: this.userProfileData.personalDetails.dob,
        nationality: this.userProfileData.personalDetails.nationality,
        domicileMedium: this.userProfileData.personalDetails.domicileMedium,
        regNurseRegMidwifeNumber: form.value.regNurseRegMidwifeNumber,
        nationalUniqueId: this.userProfileData.personalDetails.nationalUniqueId,
        doctorRegNumber: this.userProfileData.personalDetails.doctorRegNumber,
        instituteName: this.userProfileData.personalDetails.instituteName,
        nursingCouncil: this.userProfileData.personalDetails.nursingCouncil,
        gender: this.userProfileData.personalDetails.gender,
        maritalStatus: this.userProfileData.personalDetails.maritalStatus,
        category: this.userProfileData.personalDetails.category,
        knownLanguages: this.userProfileData.personalDetails.knownLanguages,
        countryCode: this.userProfileData.personalDetails.countryCode,
        mobile: this.userProfileData.personalDetails.mobile,
        telephone: this.userProfileData.personalDetails.telephone,
        primaryEmail: this.userProfileData.personalDetails.primaryEmail,
        officialEmail: '',
        personalEmail: '',
        postalAddress: this.userProfileData.personalDetails.residenceAddress,
        pincode: this.userProfileData.personalDetails.pincode,
        osName: this.userProfileData.personalDetails.osName ? this.userProfileData.personalDetails.osName : userAgent.OS,
        browserName: this.userProfileData.personalDetails.browserName ? this.userProfileData.personalDetails.browserName : userAgent.browserName,
        userCookie: this.userProfileData.personalDetails.userCookie ? this.userProfileData.personalDetails.userCookie : userCookie,
      },
      academics: this.userProfileData.academics,
      employmentDetails: {
        service: this.userProfileData.personalDetails.service,
        cadre: this.userProfileData.personalDetails.cadre,
        allotmentYearOfService: this.userProfileData.personalDetails.allotmentYear,
        dojOfService: this.userProfileData.personalDetails.otherDetailsDoj,
        payType: this.userProfileData.personalDetails.payType,
        civilListNo: this.userProfileData.personalDetails.civilListNo,
        employeeCode: this.userProfileData.personalDetails.employeeCode,
        officialPostalAddress: this.userProfileData.personalDetails.otherDetailsOfficeAddress,
        pinCode: this.userProfileData.personalDetails.otherDetailsOfficePinCode,
      },
      professionalDetails: [
        ...this.getOrganisationsHistory(form),
      ],
      skills: {
        additionalSkills: this.userProfileData.personalDetails.skillAquiredDesc,
        certificateDetails: this.userProfileData.personalDetails.certificationDesc,
      },
      interests: {
        professional: this.userProfileData.personalDetails.interests,
        hobbies: this.userProfileData.personalDetails.hobbies,
      },
    }
    if (this.userProfileData.personalDetails.primaryEmailType === this.ePrimaryEmailType.OFFICIAL) {
      profileReq.personalDetails.officialEmail = this.userProfileData.personalDetails.primaryEmail
    } else {
      profileReq.personalDetails.officialEmail = ''
    }
    profileReq.personalDetails.personalEmail = this.userProfileData.personalDetails.secondaryEmail

    // let approvalData
    // _.forOwn(this.approvalConfig, (v, k) => {
    //   if (!v.approvalRequired) {
    //     _.set(profileReq, k, this.getDataforK(k, form))
    //   } else {
    //     _.set(profileReq, k, this.getDataforKRemove(k, v.approvalFiels, form))
    //     approvalData = this.getDataforKAdd(k, v.approvalFiels, form)
    //   }
    // })
    return { profileReq }
  }

  private getOrganisationsHistory(form: any) {
    const organisations: any = []
    const org = {
      name: form.value.orgName,
      orgType: form.value.orgType,
      orgOtherSpecify: form.value.orgOtherSpecify,
      nameOther: form.value.orgNameOther,
      industry: form.value.industry,
      industryOther: form.value.industryOther,
      designation: form.value.designation,
      profession: form.value.profession,
      location: form.value.location,
      responsibilities: '',
      doj: form.value.doj,
      description: form.value.orgDesc,
      completePostalAddress: '',
      additionalAttributes: {},
      osid: _.get(this.userProfileData, 'professionalDetails[0].osid') || undefined,
      block: get(form.value, 'block') ? form.value.block : this.userProfileData.professionalDetails[0].block,
      subcentre: get(form.value, 'subcentre') ? form.value.subcentre : this.userProfileData.professionalDetails[0].subcentre,
    }
    organisations.push(org)
    return organisations
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  redirectToWorkInfo(isEdit: any) {

    const ob = {
      type: 'work',
      edit: isEdit,
    }
    console.log(ob)
    if (sessionStorage.getItem('work')) {
      sessionStorage.removeItem('work')
    }
    sessionStorage.setItem('work', isEdit)
    this.contentSvc.changeWork(ob)
    // this.contentSvc.changeBack('/app/workinfo-list')
    // if (isEdit) {
    //   this.router.navigate([`app/workinfo-edit`], {
    //     queryParams: { isEdit },
    //   })
    // } else {
    //   this.router.navigate([`app/workinfo-edit`])
    // }

  }
}
