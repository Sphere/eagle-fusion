import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { INationality, IProfileAcademics } from '../../../user-profile/models/user-profile.model'
import { map, startWith } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import moment from 'moment'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material'
declare var $: any
@Component({
  selector: 'ws-app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {

  nextId: any
  _chatFormValue: any
  chatUrl = '/fusion-assets/files/Registation-chatbot-model.json'
  districtUrl = '/fusion-assets/files/district.json'
  chatObj: any = []
  chatArray: any = []
  inputMsgEnabled = false
  skipButton = false
  charReplyArray: any = []
  nextchatArray: any = []
  options: any = []
  currentData1: any = []
  order = 0
  createUserForm!: FormGroup
  createChatForm!: FormGroup
  @ViewChild('chatoutput', { static: false }) outputArea!: ElementRef
  errMsg = ''

  masterNationalities: any = []
  filteredOptions: Observable<string[]> | undefined
  filteredOptionsState: Observable<string[]> | undefined
  filteredOptionsDistrict: Observable<string[]> | undefined
  states: any = []
  statesArr: any = []
  dropdownStatus = ''
  district: any = []
  districtArr: any = []
  enableInputForDropdown = false
  disableLocation = true
  // @ViewChild('chatoutput', { static: false }) outputArea!: ElementRef
  @ViewChild('chatoutput', { static: false }) contEl: any
  showTypingIcon = true
  showOptionFields = true
  currentId: any
  orgTypeOtherOption = false
  showConfirmedProfile = false
  otherbtnactive = false

  constructor(private http: HttpClient,
              private userProfileSvc: UserProfileService,
              private router: Router,
              private snackBar: MatSnackBar,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.http.get(this.chatUrl).subscribe(data => {
      this.chatObj = data
      this.chatArray.push(this.chatObj.regOption.profiledetails[0])
    })

    this.http.get(this.districtUrl).subscribe((data: any) => {
      this.district = data.states
    })

    this.createChatForm = this.createChatFormFields()
    this.createUserForm = this.createUserFormFields()
    this.fetchMeta()

  }

  createChatFormFields() {
    return new FormGroup({
      replymsg: new FormControl('', [Validators.required]),
    })
  }

  // createUserFormFields() {
  //   return new FormGroup({
  //     firstname: new FormControl('', []),
  //     surname: new FormControl('', []),
  //     middlename: new FormControl('', []),
  //     // mobile: new FormControl('', [Validators.required, Validators.pattern(this.phoneNumberPattern)]),
  //     mobile: new FormControl('', []),
  //     dob: new FormControl('', []),
  //     residenceAddress: new FormControl('', []),
  //     orgName: new FormControl('', []),
  //     organisationType: new FormControl('', []),
  //     designation: new FormControl('', []),
  //     designationOther: new FormControl('', []),
  //     residenceState: new FormControl('', []),
  //     residenceDistrict: new FormControl('', []),
  //   })
  // }

  createUserFormFields() {
    return new FormGroup({
      firstname: new FormControl('', []),
      middlename: new FormControl('', []),
      surname: new FormControl('', []),
      about: new FormControl(''),
      // photo: new FormControl('', []),
      countryCode: new FormControl('', []),
      mobile: new FormControl('', []),
      telephone: new FormControl('', []),
      primaryEmail: new FormControl('', []),
      primaryEmailType: new FormControl('', []),
      secondaryEmail: new FormControl('', []),
      nationality: new FormControl('', []),
      dob: new FormControl('', []),
      // gender: new FormControl('', []),
      // maritalStatus: new FormControl('', []),
      domicileMedium: new FormControl('', []),
      // regNurseRegMidwifeNumber: new FormControl('', []),
      // nationalUniqueId: new FormControl('', []),
      // doctorRegNumber: new FormControl('', []),
      // instituteName: new FormControl('', []),
      // nursingCouncil: new FormControl('', []),
      knownLanguages: new FormControl([], []),
      residenceAddress: new FormControl('', []),
      // category: new FormControl('', []),
      // pincode: new FormControl('', []),
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

  fetchMeta() {
    this.userProfileSvc.getMasterNationlity().subscribe(
      data => {
        data.nationalities.map((item: INationality) => {
          this.masterNationalities.push(item.name)
        })
      },
      (_err: any) => {
      })

    this.userProfileSvc.getProfilePageMeta().subscribe(
      data => {
        this.states = data.states

        this.states.map((i: any) => {
          this.statesArr.push(i.name)
        })
      },
      (_err: any) => {
      })

    // tslint:disable-next-line: no-non-null-assertion
    this.filteredOptions = this.createUserForm.get('residenceAddress')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.councilFilter(value))
      )
    // tslint:disable-next-line: no-non-null-assertion
    this.filteredOptionsState = this.createUserForm.get('residenceState')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.councilFilter(value))
      )
    // tslint:disable-next-line: no-non-null-assertion
    this.filteredOptionsDistrict = this.createUserForm.get('residenceDistrict')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.councilFilter(value))
      )

  }

  private councilFilter(value: string): string[] {
    const key = this.dropdownStatus
    if (value || value === '') {
      const filterValue = value.toLowerCase()
      if (key === 'country') {
        return this.masterNationalities.filter((option: string) =>
          option.toLowerCase().includes(filterValue))
      } if (key === 'state') {
        return this.statesArr.filter((option: string) =>
          option.toLowerCase().includes(filterValue))
      } if (key === 'district') {
        return this.districtArr.filter((option: string) =>
          option.toLowerCase().includes(filterValue))
      }
    }
    return []
  }

  getSelectedData(data: any) {
    let preText = ''
    const content = `${this.createChatForm.value.replymsg}, `
    preText = this.createChatForm.value.replymsg
      ? content
      : this.createChatForm.value.replymsg

    const text = preText + data
    this.createChatForm.controls.replymsg.setValue(text)

    if (data.toLowerCase() === 'india') {
      this.dropdownStatus = 'state'
      const array: any = []
      const obsof1 = of(array)
      this.filteredOptions = obsof1
      this.councilFilter('')
    } else {
      this.dropdownStatus = ''
      this.enableInputForDropdown = false
      this.inputMsgEnabled = false
      this.disableLocation = true
    }

  }

  getSelectedDataState(data: any) {
    let preText = ''
    const content = `${this.createChatForm.value.replymsg}, `
    preText = this.createChatForm.value.replymsg
      ? content
      : this.createChatForm.value.replymsg

    const text = preText + data
    this.createChatForm.controls.replymsg.setValue(text)

    const disList = this.district.filter((dis: any) => {
      if (dis.state === data) {
        return dis
      }
    })

    if (disList.length > 0 && disList[0].districts.length > 0) {
      this.districtArr = disList[0].districts
      this.dropdownStatus = 'district'
      const array: any = []
      const obsof1 = of(array)
      this.filteredOptions = obsof1
      this.councilFilter('')
    } else {
      this.dropdownStatus = ''
      this.disableLocation = true
    }

  }

  getSelectedDataDistrict(data: any) {
    let preText = ''
    const content = `${this.createChatForm.value.replymsg}, `
    preText = this.createChatForm.value.replymsg
      ? content
      : this.createChatForm.value.replymsg

    const text = preText + data
    this.createChatForm.controls.replymsg.setValue(text)
    this.dropdownStatus = ''
    this.disableLocation = true
  }

  getChatResponseCategorization(_chatFormValue: any) {

    if (_chatFormValue.replymsg) {
      if (_chatFormValue.replymsg === 'Yes, I confirm') {
        this.updateProfile()
      } else if (_chatFormValue.replymsg === 'Retry') {
        this.retryProfile()
      } else {
        this.getChatResponse(_chatFormValue)
      }
    }

  }

  retryProfile() {
    this.createChatForm.controls.replymsg.setValue('')
    this.order = 0
    this.chatArray.length = 1
    this.showOptionFields = false
    this.createUserForm.reset(this.createUserFormFields().value)
    this.createChatForm.reset()
    this.dropdownStatus = ''
    this.masterNationalities = []
    this.statesArr = []
    this.districtArr = []
    this.fetchMeta()
    this.showConfirmedProfile = false
    this.inputMsgEnabled = false

    const typeIcon = $('#chat-output')
    setTimeout(() => {
      typeIcon.empty()
      typeIcon.append(`
          <div class='user-message'>
            <div class='message'>
              ${this.chatArray[0].title}
            </div>
          </div>
        `)
    },         1000)
  }

  getOptionSelected(_chatFormValue: any) {
    const optionMsg = _chatFormValue.replymsg
    if (optionMsg === 'Others - Please Specify' || optionMsg === 'Others - Please Mention' || optionMsg === 'Others') {
      this.otherbtnactive = true
      this.inputMsgEnabled = false
    } else {
      this.otherbtnactive = false
      this.inputMsgEnabled = true
    }
  }

  getChatResponse(_chatFormValue: any) {
    const outputArea = $('#chat-output')
    this.otherbtnactive = false
    this.inputMsgEnabled = false
    const v = this.validateResponse(this.chatArray[this.order], _chatFormValue.replymsg)
    if (_chatFormValue.replymsg !== 'skip' && _chatFormValue.replymsg !== 'Mother/Family member') {
      this.assignFields(this.chatArray[this.order].id, _chatFormValue.replymsg)
    }

    if (v) {
      let message = _chatFormValue.replymsg

      this.nextId = this.chatArray[this.order].action['submit']
      this.currentId = this.chatArray[this.order].id
      this.order = this.order + 1

      if (this.nextId === 'proceed') {
        if (_chatFormValue.replymsg === 'Mother/Family member') {
          this.getConfirmation()
        }
        this.nextId = _chatFormValue.replymsg
        message = _chatFormValue.replymsg
        this.inputMsgEnabled = true
      }

      if (this.nextId === 'location') {
        this.enableInputForDropdown = true
        this.inputMsgEnabled = true
        this.createChatForm.value.replymsg = ''
        this.dropdownStatus = 'country'
        this.disableLocation = false
      }

      if (this.currentId === 'location') {
        this.enableInputForDropdown = false
      }

      if (_chatFormValue.replymsg === 'Others - Please Specify') {
        $('#user-input').val('')
        this.createChatForm.reset(this.createChatFormFields().value)
        if (this.nextId === 'end') {
          this.nextId = 'organizationName'
          this.skipButton = true
        } else {
          this.nextId = _chatFormValue.replymsg
        }
        this.nextQuestions()
        this.sendQuestion(this.currentData1)
        this.inputMsgEnabled = false
        this.otherbtnactive = true
        return this.nextId
      }

      if (_chatFormValue.replymsg === 'skip' && this.currentId === 'organizationName') {
        this.skipButton = false
        this.getConfirmation()
      } else {
        if (_chatFormValue.replymsg === 'skip') {
          this.skipButton = false
          this.nextQuestions()
          this.sendQuestion(this.currentData1)
          return this.nextId
        }

        this.showTypingIcon = false

        outputArea.append(`<div class="bot-message">
                <div class="message">
                  ${message}
                </div>
              </div>`)

        setTimeout(() => {
          this.showTypingIcon = true
        },         1000)

        if (this.nextId === 'end' && message !== 'skip') {
          message = _chatFormValue.replymsg
          this.order = this.order - 1
          this.inputMsgEnabled = true
          this.getConfirmation()
          return
        }

        this.nextQuestions()

        $('#user-input').val('')
        this.createChatForm.reset(this.createChatFormFields().value)
        if (this.nextId !== 'end') {
          this.sendQuestion(this.currentData1)
        }
        if (this.chatArray[this.order].required) {
          this.skipButton = false
        } else {
          this.skipButton = true
        }
        this.scrollToBottom()
      }
    }

  }

  nextQuestions() {
    this.currentData1 = this.chatObj.regOption.profiledetails.filter((data: { id: any }) => data.id === this.nextId)
    this.chatArray.push(this.currentData1[0])
  }

  sendQuestion(question: any) {
    const nxtquest = question[0].title
    const typeIcon = $('#chat-output')

    if (nxtquest !== '') {
      setTimeout(() => {
        typeIcon.append(`
          <div class='user-message'>
            <div class='message'>
              ${nxtquest}
            </div>
          </div>
        `)
      },         1000)
    }

    if (question[0]['type'] === 'options') {
      this.options = question[0].data.options
      this.inputMsgEnabled = true
      this.showOptionFields = true
    }
    setTimeout(() => {
      this.scrollToBottom()
    },         1000)
  }
  validateResponse(obj: any, msg: any) {
    if (this.errMsg) {
      this.errMsg = ''
    }
    switch (obj.data.type[0]) {
      case 'string': {
        if (obj.data.regex) {
          if (obj.id === 'dob') {
            const d1 = moment(new Date()).format('YYYY-MM-DD')
            const d2 = moment(msg, 'DD/MM/YYYY').format('YYYY-MM-DD')
            const dob = moment(msg, 'DD-MM-YYYY').isSameOrAfter('01-01-1950')
            if (!dob || !(moment(d2).isBefore(d1))) {
              this.errMsg = obj.action.error
              return false
            }
            return true
          }

          if (msg.match(obj.data.regexPattern) == null || msg.length >= obj.data.length) {
            this.errMsg = obj.action.error
            return false
          }
          return true

        }
        return true
      }
      case 'number': {
        if (msg.length !== obj.data.length) {
          this.errMsg = obj.action.error
          return false
        }
        if (obj.data.regex) {
          if (msg.match(obj.data.regexPattern) == null) {
            this.errMsg = obj.action.error
            return false
          }
          return true
        }
        if (this.errMsg) {
          this.errMsg = ''
          return true
        }
        return true
      }
      default: return true
    }
  }
  scrollToBottom() {
    const windowHeight = this.contEl.nativeElement.clientHeight
    this.contEl.nativeElement.scrollTop = this.contEl.nativeElement.scrollTop + windowHeight + 100
  }
  assignFields(qid: any, value: any) {
    switch (qid) {
      case 'fname':
        this.createUserForm.controls.firstname.setValue(value)
        break
      case 'lname':
        this.createUserForm.controls.surname.setValue(value)
        break
      case 'middlename':
        this.createUserForm.controls.middlename.setValue(value)
        break
      case 'dob':
        this.createUserForm.controls.dob.setValue(value)
        break
      case 'mobile':
        this.createUserForm.controls.mobile.setValue(parseInt(value, 10))
        break
      case 'location':
        this.createUserForm.controls.residenceAddress.setValue(value)
        break
      case 'profession':
      case 'others':
      case 'Others - Please Specify':
        this.createUserForm.controls.designation.setValue(value)
        break
      case 'Healthcare Worker':
      case 'Healthcare Volunteer':
        this.createUserForm.controls.designationOther.setValue(value)
        break
      case 'organizationType':
        this.createUserForm.controls.organisationType.setValue(value)
        break
      case 'organizationName':
        this.createUserForm.controls.orgName.setValue(value)
        break
      default:
        break

    }
  }

  // private constructReq(form: any) {
  //   const profileReq = {
  //     personalDetails: {
  //       firstname: form.value.firstname,
  //       surname: form.value.surname,
  //       middlename: form.value.middlename,
  //       dob: form.value.dob,
  //       mobile: form.value.mobile,
  //       postalAddress: form.value.residenceAddress,
  //     },
  //     professionalDetails: [
  //       ...this.getOrganisationsHistory(form),
  //     ],
  //   }
  //   return profileReq
  // }

  // private getOrganisationsHistory(form: any) {
  //   const organisations: any = []
  //   const org = {
  //     organisationType: form.value.organisationType,
  //     name: form.value.orgName,
  //     designation: form.value.designation,
  //     designationOther: form.value.designationOther,
  //   }
  //   organisations.push(org)
  //   return organisations
  // }

  private constructReq(form: any) {
    const profileReq = {
      // photo: form.value.photo,
      personalDetails: {
        firstname: form.value.firstname,
        middlename: form.value.middlename,
        surname: form.value.surname,
        about: form.value.about,
        dob: form.value.dob,
        nationality: form.value.nationality,
        domicileMedium: form.value.domicileMedium,
        // regNurseRegMidwifeNumber: form.value.regNurseRegMidwifeNumber,
        // nationalUniqueId: form.value.nationalUniqueId,
        // doctorRegNumber: form.value.doctorRegNumber,
        // instituteName: form.value.instituteName,
        // nursingCouncil: form.value.nursingCouncil,
        // gender: form.value.gender,
        // maritalStatus: form.value.maritalStatus,
        // category: form.value.category,
        knownLanguages: form.value.knownLanguages,
        countryCode: form.value.countryCode,
        mobile: form.value.mobile,
        telephone: form.value.telephone,
        primaryEmail: form.value.primaryEmail,
        officialEmail: '',
        personalEmail: '',
        postalAddress: form.value.residenceAddress,
        // pincode: form.value.pincode,
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

    return profileReq
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

  private getAcademics(form: any) {
    const academics = []
    academics.push(this.getClass10(form))
    academics.push(this.getClass12(form))
    academics.push(...this.getDegree(form, 'GRADUATE'))
    academics.push(...this.getPostDegree(form, 'POSTGRADUATE'))
    return academics
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

  formattedConfirmationInfo() {
    const firstname = this.createUserForm.value.middlename ?
      `${this.createUserForm.value.firstname} ${this.createUserForm.value.middlename}` :
      this.createUserForm.value.firstname

    let t1 = `<h4><b>Hi,</b></h4>
              <h4><b>This is what we got:</b></h4>
              <br>
              <p>Name : ${firstname} ${this.createUserForm.value.surname}</p>
              <p>Date of birth : ${this.createUserForm.value.dob}</p>
              <p>Mobile Number : ${this.createUserForm.value.mobile}</p>
              <p>Address : ${this.createUserForm.value.residenceAddress}</p>`

    if (this.createUserForm.value.designation) {
      t1 += `<p>Profession : ${this.createUserForm.value.designation}</p>`
    }
    if (this.createUserForm.value.designationOther) {
      t1 += `<p>Profession category : ${this.createUserForm.value.designationOther}</p>`
    }
    if (this.createUserForm.value.organisationType) {
      t1 += `<p>Type of organization : ${this.createUserForm.value.organisationType}</p>`
    }
    if (this.createUserForm.value.orgName) {
      t1 += `<p>Name of organization : ${this.createUserForm.value.orgName}</p>`
    }

    const str = '<b>You can edit your profile anytime</b>'

    const tn = `<br>
              <p><b>Did we get it right?</b><p>
              <p>${str}<p>
              <br>`
    const total = t1 + tn

    return total

  }

  getConfirmation() {
    this.createChatForm.controls.replymsg.setValue('')
    this.showConfirmedProfile = true
    this.inputMsgEnabled = true
    const typeIcon = $('#chat-output')

    const total = this.formattedConfirmationInfo()

    setTimeout(() => {
      typeIcon.append(`
      <div class='user-message'>
        <div class="message">
             ${total}
            </div>
      </div>
    `)
    },         1000)

    this.skipButton = false
    this.options = ['Yes, I confirm', 'Retry']

    setTimeout(() => {
      this.scrollToBottom()
    },         1000)

  }

  updateProfile() {
    const profileRequest = this.constructReq(this.createUserForm)
    this.userProfileSvc.updateProfileDetails(profileRequest).subscribe(data => {
      if (data) {
        // on Success
        const res = data.toString()
        this.openSnackbar(res)
        setTimeout(() => {
          if (localStorage.getItem('selectedCourse')) {
            let baseUrl = document.baseURI
            baseUrl = document.baseURI + localStorage.getItem('selectedCourse')
            this.router.navigate([baseUrl])
          } else {
            this.router.navigate(['/app/profile/dashboard'])
          }
        },         3000)
      }
    })
  }

  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
}
