import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import moment from 'moment'
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
  userId = ''
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
    // this.almostDoneForm = new FormGroup({
    //   profession: new FormControl(),
    //   orgType: new FormControl(),
    //   orgName: new FormControl(),
    //   professionOtherSpecify: new FormControl(),
    //   orgOtherSpecify: new FormControl(),
    //   instituteName: new FormControl(),
    //   courseName: new FormControl(),
    //   othersProfession: new FormControl(),
    // })
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
      orgType: new FormControl(),
      orgName: new FormControl(),
      professionOtherSpecify: new FormControl(),
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
  onsubmit(form: any) {
    console.log(form)
    console.log("yourBackground:", this.yourBackground)

    this.createUserForm.controls.firstname.setValue('Ankita')
    this.createUserForm.controls.middlename.setValue('Kaushik')
    this.createUserForm.controls.surname.setValue('Kaushik')
    this.createUserForm.controls.dob.setValue(moment(this.yourBackground.value.dob).format('DD-MM-YYYY'))
    this.createUserForm.controls.mobile.setValue(parseInt('7389953936', 10))

    this.createUserForm.controls.countryCode.setValue(this.yourBackground.value.countryCode)
    this.selectedAddress = this.yourBackground.value.country
    if (this.yourBackground.value.state)
      this.selectedAddress += ',' + this.yourBackground.value.state
    if (this.yourBackground.value.distict)
      this.selectedAddress += ',' + this.yourBackground.value.distict

    this.createUserForm.controls.residenceAddress.setValue(this.selectedAddress)


    console.log("BackgroundSelected:", this.backgroundSelect)

    if (this.backgroundSelect === 'Healthcare Worker' || this.backgroundSelect === 'Healthcare Volunteer') {
      this.createUserForm.controls.designationOther.setValue(this.backgroundSelect)
    }
    this.updateProfile()
  }

  assignFields(qid: any, value: any) {

    switch (qid) {
      case 'profession':
      case 'others':
      case 'Others - Please Specify':
        this.createUserForm.controls.designation.setValue(value)
        break
      // case 'Healthcare Worker':
      // case 'Healthcare Volunteer':
      //   this.createUserForm.controls.designationOther.setValue(value)
      //   break
      case 'organizationType':
        this.createUserForm.controls.organisationType.setValue(value)
        break
      case 'organizationName':
        this.createUserForm.controls.orgName.setValue(value)
        break
      case 'RNNumber':
        this.createUserForm.controls.regNurseRegMidwifeNumber.setValue(value)
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
    }
    if (form.value.isGovtOrg) {
      org.organisationType = 'Government'
    } else {
      org.organisationType = 'Non-Government'
    }
    organisations.push(org)
    return organisations
  }

  getClass10(form: any): IProfileAcademics {
    return ({
      nameOfQualification: '',
      type: 'X_STANDARD',
      nameOfInstitute: form.value.schoolName10,
      yearOfPassing: `${form.value.yop10}`,
    })
  }

  getClass12(form: any): IProfileAcademics {
    return ({
      nameOfQualification: '',
      type: 'XII_STANDARD',
      nameOfInstitute: form.value.schoolName12,
      yearOfPassing: `${form.value.yop12}`,
    })
  }

  getDegree(form: any, degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    form.value.degrees.map((degree: any) => {
      formatedDegrees.push({
        nameOfQualification: degree.degree,
        type: degreeType,
        nameOfInstitute: degree.instituteName,
        yearOfPassing: `${degree.yop}`,
      })
    })
    return formatedDegrees
  }

  getPostDegree(form: any, degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    form.value.postDegrees.map((degree: any) => {
      formatedDegrees.push({
        nameOfQualification: degree.degree,
        type: degreeType,
        nameOfInstitute: degree.instituteName,
        yearOfPassing: `${degree.yop}`,
      })
    })
    return formatedDegrees
  }

  private getAcademics(form: any) {
    const academics = []
    academics.push(this.getClass10(form))
    academics.push(this.getClass12(form))
    academics.push(...this.getDegree(form, 'GRADUATE'))
    academics.push(...this.getPostDegree(form, 'POSTGRADUATE'))
    return academics
  }

  private constructReq(form: any) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    const profileReq = {
      id: this.userId,
      userId: this.userId,
      personalDetails: {
        firstname: form.value.firstname,
        middlename: form.value.middlename,
        surname: form.value.surname,
        about: form.value.about,
        dob: form.value.dob,
        nationality: form.value.nationality,
        domicileMedium: form.value.domicileMedium,
        regNurseRegMidwifeNumber: form.value.regNurseRegMidwifeNumber,
        knownLanguages: form.value.knownLanguages,
        countryCode: form.value.countryCode,
        mobile: form.value.mobile,
        telephone: form.value.telephone,
        primaryEmail: form.value.primaryEmail,
        officialEmail: '',
        personalEmail: '',
        postalAddress: form.value.residenceAddress,
      },
      academics: this.getAcademics(form),
      employmentDetails: {
        service: form.value.service,
        cadre: form.value.cadre,
        allotmentYearOfService: form.value.allotmentYear,
        dojOfService: form.value.otherDetailsDoj,
        payType: form.value.payType,
        civilListNo: form.value.civilListNo,
        employeeCode: form.value.employeeCode,
        officialPostalAddress: form.value.otherDetailsOfficeAddress,
        pinCode: form.value.otherDetailsOfficePinCode,
      },
      professionalDetails: [
        ...this.getOrganisationsHistory(form),
      ],
      skills: {
        additionalSkills: form.value.skillAquiredDesc,
        certificateDetails: form.value.certificationDesc,
      },
      interests: {
        professional: form.value.interests,
        hobbies: form.value.hobbies,
      },
    }

    return { profileReq }
  }

  updateProfile() {
    const profileRequest = this.constructReq(this.almostDoneForm)

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
