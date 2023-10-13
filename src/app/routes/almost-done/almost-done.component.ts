import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { IGovtOrgMeta, IProfileAcademics } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { HttpClient } from '@angular/common/http'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'
import { SignupService } from 'src/app/routes/signup/signup.service'
@Component({
  selector: 'ws-almost-done',
  templateUrl: './almost-done.component.html',
  styleUrls: ['./almost-done.component.scss'],
})
export class AlmostDoneComponent implements OnInit {

  @Input() yourBackground: any
  @Input() backgroundSelect: any
  @Output() redirectToParent = new EventEmitter()
  createUserForm!: FormGroup
  almostDoneForm!: FormGroup
  professionOthersField = false
  orgOthersField = false
  rnFieldDisabled = true
  userId = ''
  firstName = ''
  middleName = ''
  lastName = ''
  email = ''
  govtOrgMeta!: IGovtOrgMeta
  masterNationalities: any = []
  public degrees!: FormArray
  profession = ''
  studentInstitute = ''
  studentCourse = ''
  selectedAddress = ''
  enableSubmit = false
  errorMsg = 'Invalid.Please correct and try again'
  healthWorkerProfessions = ['Midwives', 'ANM', 'GNM', 'BSC Nurse', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Teachers', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  districtUrl = '../../../fusion-assets/files/district.json'
  disticts: any
  selectedBg = ''
  blockEntered = false
  subcentreEntered = false
  hideAsha = false
  result: any
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private http: HttpClient,
    private UserAgentResolverService: UserAgentResolverService,
    private signupService: SignupService,
  ) {
  }

  async ngOnInit() {
    this.almostDoneForm = this.almostDoneFormFields()
    this.createUserForm = this.createUserFormFields()
    this.result = await this.signupService.fetchStartUpDetails()
    console.log(this.result)
    if (this.yourBackground.value.country !== 'India') {
      this.hideAsha = true
    } else {
      this.hideAsha = false
    }
    if (this.backgroundSelect === 'ASHA') {
      this.enableSubmit = true
      this.almostDoneForm.controls.locationselect.setValue(this.yourBackground.value.distict)
      this.http.get(this.districtUrl).subscribe((statesdata: any) => {
        statesdata.states.map((item: any) => {
          if (item.state === this.yourBackground.value.state) {
            this.disticts = item.districts
          }
        })
      })
    }
  }
  redirectToYourBackground() {
    this.redirectToParent.emit('true')
  }
  chooseBackground(data: any) {
    this.selectedBg = data
    if (this.selectedBg === 'Mother/Family Members') {
      this.enableSubmit = false
    }
    if (this.selectedBg === 'Asha Facilitator' || this.selectedBg === 'Asha Trainer') {
      this.enableSubmit = true
      this.almostDoneForm.controls.locationselect.setValue(this.yourBackground.value.distict)
      this.http.get(this.districtUrl).subscribe((statesdata: any) => {
        statesdata.states.map((item: any) => {
          if (item.state === this.yourBackground.value.state) {
            this.disticts = item.districts
          }
        })
      })
    }
  }

  almostDoneFormFields() {
    return new FormGroup({
      selectBackground: new FormControl(),
      professSelected: new FormControl(),
      block: new FormControl(),
      subcentre: new FormControl(),
      locationselect: new FormControl(),
      profession: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      rnNumber: new FormControl('', [Validators.pattern(/[^\s]/)]),
      orgType: new FormControl(),
      orgName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      professionOtherSpecify: new FormControl(),
      designationName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      orgOtherSpecify: new FormControl(),
      instituteName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new FormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      othersProfession: new FormControl(),
    })
  }

  createUserFormFields() {
    return new FormGroup({
      firstname: new FormControl('', []),
      middlename: new FormControl('', []),
      surname: new FormControl('', []),
      about: new FormControl(''),
      countryCode: new FormControl('', []),
      mobile: new FormControl('', []),
      telephone: new FormControl('', []),
      primaryEmail: new FormControl('', []),
      primaryEmailType: new FormControl('', []),
      secondaryEmail: new FormControl('', []),
      nationality: new FormControl('', []),
      dob: new FormControl('', []),
      domicileMedium: new FormControl('', []),
      regNurseRegMidwifeNumber: new FormControl('', []),
      knownLanguages: new FormControl([], []),
      residenceAddress: new FormControl('', []),
      schoolName10: new FormControl('', []),
      yop10: new FormControl('', []),
      schoolName12: new FormControl('', []),
      yop12: new FormControl('', []),
      degrees: this.fb.array([this.createDegree()]),
      postDegrees: this.fb.array([this.createDegree()]),
      certificationDesc: new FormControl('', []),
      interests: new FormControl([], []),
      hobbies: new FormControl([], []),
      skillAquiredDesc: new FormControl('', []),
      isGovtOrg: new FormControl(false, []),
      orgName: new FormControl('', []),
      orgNameOther: new FormControl('', []),
      industry: new FormControl('', []),
      industryOther: new FormControl('', []),
      designation: new FormControl('', []),
      profession: new FormControl('', []),
      location: new FormControl('', []),
      locationOther: new FormControl('', []),
      doj: new FormControl('', []),
      orgDesc: new FormControl('', []),
      payType: new FormControl('', []),
      service: new FormControl('', []),
      cadre: new FormControl('', []),
      allotmentYear: new FormControl('', []),
      otherDetailsDoj: new FormControl('', []),
      civilListNo: new FormControl('', []),
      employeeCode: new FormControl('', []),
      otherDetailsOfficeAddress: new FormControl('', []),
      otherDetailsOfficePinCode: new FormControl('', []),
      residenceState: new FormControl('', []),
      residenceDistrict: new FormControl('', []),
      orgType: new FormControl('', []),
    })
  }

  createDegree(): FormGroup {
    return this.fb.group({
      degree: new FormControl('', []),
      instituteName: new FormControl('', []),
      yop: new FormControl('', []),
    })
  }

  professionSelect(option: any) {
    if (option !== 'null') {
      this.createUserForm.controls.designation.setValue(option)
      this.almostDoneForm.controls.profession.setValue(option)
    } else {
      this.almostDoneForm.controls.profession.setValue(null)
    }

    if (option === 'Others') {
      this.professionOthersField = true
      this.almostDoneForm.controls.professionOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.professionOthersField = false
      this.almostDoneForm.controls.professionOtherSpecify.clearValidators()
      this.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    }

    if (option === 'Midwives' || option === 'ANM' || option === 'GNM' || option === 'BSC Nurse') {
      this.rnFieldDisabled = false
    } else {
      this.almostDoneForm.controls.rnNumber.setValue(null)
      this.rnFieldDisabled = true
    }
  }
  orgTypeSelect(option: any) {
    if (option !== 'null') {
      this.almostDoneForm.controls.orgType.setValue(option)
    } else {
      this.almostDoneForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      // this.createUserForm.controls.orgOtherSpecify.setValue(null)
      this.almostDoneForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.almostDoneForm.controls.orgOtherSpecify.clearValidators()
      this.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    }
  }
  onsubmit() {
    this.selectedAddress = this.yourBackground.value.country
    if (this.yourBackground.value.state) {
      this.selectedAddress += ', ' + `${this.yourBackground.value.state}`
    }
    if (this.yourBackground.value.distict) {
      this.selectedAddress += ', ' + `${this.yourBackground.value.distict}`
    }

    this.updateProfile()
  }

  assignFields(qid: any, data: any, event: any) {
    const value = data.trim()
    switch (qid) {
      case 'profession':
      case 'designation':
      case 'others':
      case 'Others - Please Specify':
        this.createUserForm.controls.designation.setValue(value)
        break
      case 'organizationType':
        this.createUserForm.controls.orgType.setValue(value)
        break
      case 'organizationName':
        this.createUserForm.controls.orgName.setValue(value)
        break
      case 'institutionName':
        if (this.profession === 'faculty') {
          this.createUserForm.controls.orgName.setValue(value)
        } else {
          this.studentInstitute = value
        }
        break
      case 'coursename':
        this.studentCourse = value
        break
      case 'locationselect':
        this.almostDoneForm.controls.locationselect.setValue(value)
        break
      case 'block':
        if (value && value !== '') {
          this.blockEntered = true
        } else {
          this.blockEntered = false
        }
        break
      case 'subcentre':
        if (value && value !== '') {
          this.subcentreEntered = true
        } else {
          this.subcentreEntered = false
        }
        break
      default:
        break
    }
    if (this.blockEntered && this.subcentreEntered) {
      this.enableSubmit = false
    } else {
      this.enableSubmit = true
    }

    if (this.backgroundSelect === 'Healthcare Volunteer' || this.backgroundSelect === 'Healthcare Worker') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.professSelected || value.professionOtherSpecify || value.orgOtherSpecify && value.orgType && value.orgName) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
      // if (this.almostDoneForm.value.professSelected && this.almostDoneForm.value.orgType && this.almostDoneForm.value.orgName) {
      //   this.enableSubmit = false
      // }
    }
    if (this.backgroundSelect === 'ASHA') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.block && value.subcentre) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
      // if (this.almostDoneForm.value.block && this.almostDoneForm.value.subcentre) {
      //   this.enableSubmit = false
      // }
    }
    if (this.backgroundSelect === 'Student') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.instituteName) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
    }

    // if (this.backgroundSelect === 'Healthcare Worker') {
    //   this.almostDoneForm.valueChanges.subscribe(value => {
    //     if (value.professSelected || value.professionOtherSpecify && value.orgOtherSpecify && value.orgType && value.orgName) {
    //       this.enableSubmit = false
    //     } else {
    //       this.enableSubmit = true
    //     }
    //   })

    //   // if (this.almostDoneForm.value.orgType && this.almostDoneForm.value.orgName) {
    //   //   this.enableSubmit = false
    //   // }
    // }
    if (this.profession === 'student' && this.studentInstitute) {
      this.degrees = this.createUserForm.get('degrees') as FormArray
      this.degrees.removeAt(0)
      this.degrees.push(this.fb.group({
        degree: new FormControl(this.studentCourse, []),
        instituteName: new FormControl(this.studentInstitute, []),
        yop: new FormControl('', []),
      }))
    }

    if (Object.keys(event).length && this.almostDoneForm.dirty) {
      this.enableSubmit = false
    }
    console.log(this.backgroundSelect, this.selectedBg)
  }

  private getOrganisationsHistory() {
    const organisations: any = []
    console.log(this.almostDoneForm.value.orgOtherSpecify)
    const org = {
      orgType: this.almostDoneForm.value.orgType,
      name: this.almostDoneForm.value.orgName!.trim(),
      nameOther: this.almostDoneForm.value.orgOtherSpecify !== null ? this.almostDoneForm.value.orgOtherSpecify!.trim() : '',
      designation: this.almostDoneForm.value.profession.trim(),
      profession: this.backgroundSelect,
      location: '',
      doj: '',
      completePostalAddress: '',
      professionOtherSpecify: this.almostDoneForm.value.professionOtherSpecify !== null ? this.almostDoneForm.value.professionOtherSpecify!.trim() : '',
    }

    if (this.backgroundSelect === 'ASHA') {
      org['locationselect'] = this.almostDoneForm.value.locationselect
      org['block'] = this.almostDoneForm.value.block
      org['subcentre'] = this.almostDoneForm.value.subcentre
    }
    if (this.backgroundSelect === 'Others') {
      org['selectBackground'] = this.almostDoneForm.value.selectBackground
    }

    // tslint:disable-next-line:max-line-length
    if ((this.backgroundSelect === 'Others' && this.selectedBg === 'Asha Facilitator') || (this.backgroundSelect === 'Others' && this.selectedBg === 'Asha Trainer')) {
      org['selectBackground'] = this.almostDoneForm.value.selectBackground
      org['locationselect'] = this.almostDoneForm.value.locationselect
      org['block'] = this.almostDoneForm.value.block
      org['subcentre'] = this.almostDoneForm.value.subcentre
    }
    if (this.backgroundSelect === 'Student') {
      org['qualification'] = this.almostDoneForm.value.courseName
      org['instituteName'] = this.almostDoneForm.value.instituteName
    }

    organisations.push(org)
    return organisations
  }

  getDegree(degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    formatedDegrees.push({
      nameOfQualification: this.studentCourse,
      type: degreeType,
      nameOfInstitute: this.studentInstitute,
      yearOfPassing: '',
    })
    return formatedDegrees
  }
  private getAcademics() {
    const academics = []
    academics.push(...this.getDegree('GRADUATE'))
    return academics
  }

  private constructReq() {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.unMappedUser.id || this.result.userId,
        this.email = this.configSvc.userProfile.email || ''
      this.firstName = this.configSvc.userProfile.firstName || ''
      this.middleName = this.configSvc.userProfile.middleName || ''
      this.lastName = this.configSvc.userProfile.lastName || ''
    }
    const userAgent = this.UserAgentResolverService.getUserAgent()
    const userCookie = this.UserAgentResolverService.generateCookie()

    const userObject = {
      firstname: this.firstName,
      middlename: this.middleName,
      surname: this.lastName,
      dob: this.yourBackground.value.dob,
      regNurseRegMidwifeNumber: this.almostDoneForm.value.rnNumber ? this.almostDoneForm.value.rnNumber : '[NA]',
      countryCode: this.yourBackground.value.countryCode,
      primaryEmail: this.email,
      postalAddress: this.selectedAddress,
      osName: userAgent.OS,
      browserName: userAgent.browserName,
      userCookie,

    }
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })

    const profileReq = {
      id: this.result.userId,
      userId: this.result.userId,
      personalDetails: userObject,
      academics: this.getAcademics(),
      employmentDetails: {},
      professionalDetails: [
        ...this.getOrganisationsHistory(),
      ],
      skills: {
        additionalSkills: '',
        certificateDetails: '',
      },
      interests: {
        professional: '',
        hobbies: '',
      },
    }

    return { profileReq }
  }

  updateProfile() {
    const profileRequest = this.constructReq()
    if (this.configSvc.userProfile || this.configSvc.unMappedUser) {
      this.userId = this.configSvc.unMappedUser.id || this.result.userId
    }
    console.log(this.userId, this.result.userId)
    const reqObj = localStorage.getItem(`preferedLanguage`) || ''
    const obj1 = reqObj === '' ? reqObj : JSON.parse(reqObj)
    const obj = {
      preferences: {
        language: obj1.id !== undefined ? obj1.id : 'en',
      },
      personalDetails: profileRequest.profileReq.personalDetails
    }
    const userdata = Object.assign(profileRequest, obj)
    const reqUpdate = {
      request: {
        userId: this.result.userId,
        profileDetails: userdata,
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      if (data) {
        this.openSnackbar('User profile details updated successfully!')
        localStorage.removeItem('preferedLanguage')
        this.activateRoute.queryParams.subscribe(params => {
          const url = params.redirect
          if (url) {
            localStorage.removeItem('url_before_login')
            this.router.navigate([url])
          } else {
            this.router.navigate(['page', 'home'])
          }
        })
      }
    })
  }

  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
