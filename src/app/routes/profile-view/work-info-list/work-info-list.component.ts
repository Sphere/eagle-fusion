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
import { HttpClient } from '@angular/common/http'
@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})

export class WorkInfoListComponent implements OnInit {
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Teachers', 'Others']
  healthWorkerProfessions = ['Midwives', 'ANM', 'GNM', 'BSC Nurse', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Others']
  districtUrl = '../../../fusion-assets/files/district.json'
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  personalDetailForm: FormGroup
  orgTypeField = false
  orgOthersField = false
  HealthcareWorker = false
  HealthcareVolunteer = false
  professionOtherField = false
  Student = false
  Faculty = false
  showDesignation = false
  showAshaField = false
  professionOthersField = false
  userID = ''
  ePrimaryEmailType = NsUserProfileDetails.EPrimaryEmailType
  rnFieldDisabled = true
  disticts: any
  selectedBg: any
  enableSubmit = false

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    // private router: Router,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private UserAgentResolverService: UserAgentResolverService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {
    this.personalDetailForm = new FormGroup({
      profession: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      designation: new FormControl(),
      professionOtherSpecify: new FormControl(),
      regNurseRegMidwifeNumber: new FormControl('', [Validators.pattern(/[^\s]/)]),
      orgType: new FormControl(),
      orgOtherSpecify: new FormControl(),
      organizationName: new FormControl(),
      block: new FormControl(),
      subcentre: new FormControl(),
      professSelected: new FormControl(),
      orgName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      locationselect: new FormControl(),
      selectBackground: new FormControl(),
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

  chooseBackground(data: any) {
    console.log(data)
    this.selectedBg = data
    if (this.selectedBg === 'Mother/Family Members') {
      this.enableSubmit = false
    }
    if (this.selectedBg === 'Asha Facilitator' || this.selectedBg === 'Asha Trainer') {
      this.enableSubmit = true
      this.personalDetailForm.controls.block.setValue(null)
      this.personalDetailForm.controls.subcentre.setValue(null)
      let cName = this.userProfileData.personalDetails.postalAddress
      console.log(cName)
      let csplit = cName.split(',')
      let state = csplit[1].trim()
      let dist = csplit[2].trim()
      let location = this.userProfileData.professionalDetails[0].locationselect !== undefined ? this.userProfileData.professionalDetails[0].locationselect : dist
      this.personalDetailForm.controls.locationselect.setValue(location)
      this.http.get(this.districtUrl).subscribe((statesdata: any) => {
        statesdata.states.map((item: any) => {
          if (item.state === state) {
            this.disticts = item.districts
          }
        })
      })
    }
    if (this.selectedBg === 'Other') {
      this.personalDetailForm.controls.profession.setValue(null)
    }
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
              (newData.professionalDetails[0].profession === 'Others' && newData.professionalDetails[0].professionOtherSpecify) ? this.professionOthersField = true : this.professionOthersField = false;
              (newData.professionalDetails[0].designation) ? this.showDesignation = true : this.showDesignation = false
              newData.professionalDetails[0].profession === 'Healthcare Worker' ? this.HealthcareWorker = true : this.HealthcareWorker = false
              newData.professionalDetails[0].profession === 'ASHA' ? this.showAshaField = true : this.showAshaField = false
              newData.professionalDetails[0].profession === 'Healthcare Volunteer' ? this.HealthcareVolunteer = true : this.HealthcareVolunteer = false
              newData.professionalDetails[0].profession === 'Student' ? this.Student = true : this.Student = false

              newData.professionalDetails[0].profession === 'Faculty' ? this.Faculty = true : this.Faculty = false


              newData.professionalDetails[0].designation === 'Others' ? this.professionOthersField = true : this.professionOthersField = false

              this.personalDetailForm.patchValue({
                profession: newData.professionalDetails[0].profession,
                professionOtherSpecify: newData.professionalDetails[0].professionOtherSpecify,
                orgType: newData.professionalDetails[0].orgType,
                orgOtherSpecify: newData.professionalDetails[0].orgOtherSpecify,
                organizationName: newData.professionalDetails[0].name,
                block: newData.professionalDetails[0].block,
                subcentre: newData.professionalDetails[0].subcentre,
                designation: newData.professionalDetails[0].designation,
                orgName: newData.professionalDetails[0].name,
                courseName: newData.professionalDetails[0].qualification,
                selectBackground: newData.professionalDetails[0].selectBackground,

                instituteName: newData.professionalDetails[0].instituteName,
                regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,

              })
              if (newData.professionalDetails[0].profession === 'Healthcare Worker') {
                this.personalDetailForm.patchValue({
                  regNurseRegMidwifeNumber: newData.personalDetails.regNurseRegMidwifeNumber,
                })
              }
              console.log(newData.professionalDetails[0], 'a')
              if (newData.professionalDetails[0].profession === "ASHA") {
                this.selectedBg = newData.professionalDetails[0].selectBackground
                this.personalDetailForm.controls.locationselect.setValue(newData.professionalDetails[0].locationselect)
                let cName = newData.personalDetails.postalAddress
                let csplit = cName.split(',')
                let state = csplit[1].trim()
                //let district = csplit[2].trim()
                this.http.get(this.districtUrl).subscribe((statesdata: any) => {
                  statesdata.states.map((item: any) => {
                    if (item.state === state) {
                      this.disticts = item.districts
                    }
                  })
                })
              }
              if (newData.professionalDetails[0].profession === "Others") {
                this.professionOtherField = true
                //if (newData.professionalDetails[0].selectBackground === "Other") {
                this.selectedBg = newData.professionalDetails[0].selectBackground
                if (this.selectedBg === "Asha Facilitator" || this.selectedBg === 'Asha Trainer') {
                  this.personalDetailForm.controls.locationselect.setValue(newData.professionalDetails[0].locationselect)
                  let cName = newData.personalDetails.postalAddress
                  let csplit = cName.split(',')
                  let state = csplit[1].trim()
                  //let district = csplit[2].trim()
                  this.http.get(this.districtUrl).subscribe((statesdata: any) => {
                    statesdata.states.map((item: any) => {
                      if (item.state === state) {
                        this.disticts = item.districts
                      }
                    })
                  })
                }
                // }
              }
            }
          }
        })
    }
  }
  professionSelect(option: any) {
    // if (option !== 'null') {
    //   this.personalDetailForm.controls.profession.setValue(option)
    // } else {
    //   this.personalDetailForm.controls.profession.setValue(null)
    // }

    if (option === 'Others') {
      this.professionOthersField = true
      this.personalDetailForm.controls.professionOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.professionOthersField = false
      this.personalDetailForm.controls.professionOtherSpecify.clearValidators()
      this.personalDetailForm.controls.professionOtherSpecify.setValue(null)
    }

    if (option === 'Midwives' || option === 'ANM' || option === 'GNM' || option === 'BSC Nurse') {
      this.rnFieldDisabled = false
    } else {
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.rnFieldDisabled = true
    }
  }
  professionalChange(value: any) {
    console.log("degree", value, this.userProfileData)
    // this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.showDesignation = true
      this.orgTypeField = false
      this.professionOtherField = false
      this.personalDetailForm.controls.designation.setValue(null)
      this.showAshaField = false
      this.HealthcareWorker = true
      this.HealthcareVolunteer = false
      this.Student = false
      this.Faculty = false

    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.showAshaField = false
      this.personalDetailForm.controls.designation.setValue(null)
      this.HealthcareWorker = false
      this.HealthcareVolunteer = true
      this.Student = false
      this.Faculty = false

    } else if (value === 'ASHA') {
      this.showAshaField = true
      this.HealthcareWorker = false
      this.personalDetailForm.controls.block.setValue(null)
      this.personalDetailForm.controls.subcentre.setValue(null)
      let cName = this.userProfileData.personalDetails.postalAddress
      console.log(cName)
      let csplit = cName.split(',')
      let state = csplit[1].trim()
      let dist = csplit[2].trim()
      let location = this.userProfileData.professionalDetails[0].locationselect !== undefined ? this.userProfileData.professionalDetails[0].locationselect : dist
      this.personalDetailForm.controls.locationselect.setValue(location)
      this.http.get(this.districtUrl).subscribe((statesdata: any) => {
        statesdata.states.map((item: any) => {
          if (item.state === state) {
            this.disticts = item.districts
          }
        })
      })
    } else if (value === 'Faculty') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.showAshaField = false
      this.HealthcareWorker = false
      this.HealthcareVolunteer = false
      this.Student = false
      this.Faculty = true

    } else if (value === 'Others') {
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
      this.showAshaField = false
      this.HealthcareWorker = false
      this.HealthcareVolunteer = false
      this.Student = false
      this.Faculty = false

    } else if (value === 'Student') {
      this.orgOthersField = false
      this.orgTypeField = false
      this.showAshaField = false
      this.HealthcareVolunteer = false
      this.HealthcareWorker = false
      this.Student = true
      this.Faculty = false


    } else {
      this.orgTypeField = true
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
    console.log('form submission', form.value, this.userProfileData, this.personalDetailForm)
    // console.log("degree", value, this.userProfileData)
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }

    let local = (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') === true ? 'hi' : 'en'

    let profileRequest = this.constructReq(form)
    if (form.value.locationselect) {
      let cName
      if (this.userProfileData.personalDetails!.postalAddress) {
        cName = this.userProfileData.personalDetails!.postalAddress!.includes('India')
      }

      console.log(cName)
      if (cName) {
        let cName1 = this.userProfileData.personalDetails.postalAddress
        let csplit = cName1.split(',')
        let country = csplit[0].trim()
        let state = csplit[1].trim()
        profileRequest.profileReq.personalDetails.postalAddress = country + ',' + state + ',' + form.value.locationselect
      }
    }
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
    console.log("feorm0", form.regNurseRegMidwifeNumber, form.value.regNurseRegMidwifeNumber)
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
        postalAddress: this.userProfileData.personalDetails.postalAddress,
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
    console.log(form.value)
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
      professionOtherSpecify: get(form.value, 'professionOtherSpecify') ? form.value.professionOtherSpecify : this.userProfileData.professionalDetails[0].professionOtherSpecify,
      locationselect: form.value.locationselect,
      qualification: get(form.value, 'courseName') ? form.value.courseName : this.userProfileData.professionalDetails[0].qualification,
      instituteName: get(form.value, 'instituteName') ? form.value.instituteName : this.userProfileData.professionalDetails[0].instituteName,
      selectBackground: form.value.selectBackground,
      organizationName: form.value.organizationName,
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
