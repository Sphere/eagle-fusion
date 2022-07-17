import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router'
import { IGovtOrgMeta, IProfileAcademics } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { HttpClient } from '@angular/common/http'

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
  healthVolunteerProfessions = ['ASHA\'s', 'Anganwadi Workers', 'Teachers', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  districtUrl = '../../../fusion-assets/files/district.json'
  disticts: any
  selectedBg = ''

  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private activateRoute: ActivatedRoute,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.almostDoneForm = this.almostDoneFormFields()
    this.createUserForm = this.createUserFormFields()
    //console.log(this.yourBackground)
    if(this.backgroundSelect === 'Asha Worker') {
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
  chooseBackground(data:any) {
    //console.log(data)
    this.selectedBg = data
    if(this.selectedBg === 'Mother/Family Members') {
      this.enableSubmit = false
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
      this.createUserForm.controls.orgOtherSpecify.setValue(null)
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

  assignFields(qid: any, data: any) {
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
      default:
        break
    }
    if (this.profession === 'student' && this.studentInstitute) {
      this.degrees = this.createUserForm.get('degrees') as FormArray
      this.degrees.removeAt(0)
      this.degrees.push(this.fb.group({
        degree: new FormControl(this.studentCourse, []),
        instituteName: new FormControl(this.studentInstitute, []),
        yop: new FormControl('', []),
      }))
    }
  }

  private getOrganisationsHistory() {
    const organisations: any = []
    const org = {
      orgType: this.almostDoneForm.value.orgType,
      name: this.almostDoneForm.value.orgName.trim(),
      nameOther: '',
      designation: this.almostDoneForm.value.profession.trim(),
      profession: this.backgroundSelect,
      location: '',
      doj: '',
      completePostalAddress: '',
    }
    //console.log(this.backgroundSelect)
    if(this.backgroundSelect === 'Asha Worker') {
      org["locationselect"] = this.almostDoneForm.value.locationselect
      org["block"] = this.almostDoneForm.value.block
      org["subcentre"] = this.almostDoneForm.value.subcentre
    }
    if(this.backgroundSelect === 'Others') {
      org["selectBackground"] = this.almostDoneForm.value.selectBackground
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
      this.userId = this.configSvc.userProfile.userId || ''
      this.email = this.configSvc.userProfile.email || ''
      this.firstName = this.configSvc.userProfile.firstName || ''
      this.middleName = this.configSvc.userProfile.middleName || ''
      this.lastName = this.configSvc.userProfile.lastName || ''
    }

    const userObject = {
      firstname: this.firstName,
      middlename: this.middleName,
      surname: this.lastName,
      dob: this.yourBackground.value.dob,
      regNurseRegMidwifeNumber: this.almostDoneForm.value.rnNumber ? this.almostDoneForm.value.rnNumber : '[NA]',
      countryCode: this.yourBackground.value.countryCode,
      primaryEmail: this.email,
      postalAddress: this.selectedAddress,
    }
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })

    const profileReq = {
      id: this.userId,
      userId: this.userId,
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

    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }

    const reqUpdate = {
      request: {
        userId: this.userId,
        profileDetails: profileRequest,
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(data => {
      if (data) {
        this.openSnackbar('User profile details updated successfully!')
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
