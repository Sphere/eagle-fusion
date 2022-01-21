import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { IGovtOrgMeta, IProfileAcademics } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'

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
  healthWorkerProfessions = ['Midwives', 'ANM', 'GNM', 'BSC Nurse', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Others']
  healthVolunteerProfessions = ["ASHA's", "Anganwadi Workers", "Teachers", "Others"]
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']

  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.almostDoneForm = this.almostDoneFormFields()
    this.createUserForm = this.createUserFormFields()
  }
  redirectToYourBackground() {
    this.redirectToParent.emit('true')
  }

  almostDoneFormFields() {
    return new FormGroup({
      profession: new FormControl(),
      rnNumber: new FormControl(),
      orgType: new FormControl(),
      orgName: new FormControl(),
      professionOtherSpecify: new FormControl(),
      designationName: new FormControl(),
      orgOtherSpecify: new FormControl(),
      instituteName: new FormControl(),
      courseName: new FormControl(),
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
      designationOther: new FormControl('', []),
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
      organisationType: new FormControl('', []),
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
    console.log("Profession:", option)
    this.createUserForm.controls.designation.setValue(option)
    if (option === 'Others') {
      this.professionOthersField = true
    }
    else {
      this.professionOthersField = false
    }
    if (option == 'Midwives' || option == 'ANM' || option == 'GNM' || option == 'BSC Nurse') {
      this.rnFieldDisabled = false
    }
    else {
      this.rnFieldDisabled = true
    }
  }
  orgTypeSelect(option: any) {
    console.log("Org:", option)
    if (option === 'Others') {
      this.orgOthersField = true
    }
    else {
      this.orgOthersField = false
    }
  }
  onsubmit() {
    console.log("yourBackground:", this.yourBackground)

    this.selectedAddress = this.yourBackground.value.country
    if (this.yourBackground.value.state)
      this.selectedAddress += ',' + this.yourBackground.value.state
    if (this.yourBackground.value.distict)
      this.selectedAddress += ',' + this.yourBackground.value.distict

    console.log("BackgroundSelected:", this.backgroundSelect)
    this.updateProfile()
  }

  assignFields(qid: any, value: any) {

    switch (qid) {
      case 'profession':
      case 'others':
      case 'Others - Please Specify':
        this.createUserForm.controls.designation.setValue(value)
        break
      case 'organizationType':
        this.createUserForm.controls.organisationType.setValue(value)
        break
      case 'organizationName':
        this.createUserForm.controls.orgName.setValue(value)
        break
      case 'designation':
        this.createUserForm.controls.designation.setValue(value)
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
      organisationType: this.almostDoneForm.value.orgType,
      name: this.almostDoneForm.value.orgName,
      nameOther: '',
      industry: '',
      industryOther: '',
      designation: this.almostDoneForm.value.profession,
      designationOther: this.backgroundSelect,
      location: '',
      responsibilities: '',
      doj: '',
      description: '',
      completePostalAddress: '',
      additionalAttributes: {},
    }
    organisations.push(org)
    return organisations
  }

  getDegree(degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    formatedDegrees.push({
      nameOfQualification: this.almostDoneForm.value.courseName,
      type: degreeType,
      nameOfInstitute: this.almostDoneForm.value.instituteName,
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
    const profileReq = {
      id: this.userId,
      userId: this.userId,
      personalDetails: {
        firstname: this.firstName,
        middlename: this.middleName,
        surname: this.lastName,
        about: '',
        dob: this.yourBackground.value.dob,
        regNurseRegMidwifeNumber: this.almostDoneForm.value.rnNumber,
        countryCode: this.yourBackground.value.countryCode,
        mobile: '',
        primaryEmail: this.email,
        postalAddress: this.selectedAddress,
      },
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

        setTimeout(() => {
          const selectedCourse = localStorage.getItem('selectedCourse')
          if (selectedCourse) {
            this.router.navigateByUrl(selectedCourse)
          } else {
            this.router.navigate(['page', 'home'])
          }
        }, 3000)
      }
    })
  }

  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
