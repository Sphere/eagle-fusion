import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FormControl, FormGroup } from '@angular/forms'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { INationality } from '../../../user-profile/models/user-profile.model'
import { map, startWith } from 'rxjs/operators'
import { Observable, of } from 'rxjs'
import moment from 'moment'
import { Router } from '@angular/router'
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

  constructor(private http: HttpClient,
    private userProfileSvc: UserProfileService,
    private router: Router) { }

  ngOnInit() {
    this.http.get(this.chatUrl).subscribe(data => {
      this.chatObj = data
      this.chatArray.push(this.chatObj.regOption.profiledetails[0])
    })

    this.http.get(this.districtUrl).subscribe((data: any) => {
      this.district = data.states
    })

    this.createChatForm = new FormGroup({
      replymsg: new FormControl('', []),
    })

    this.createUserForm = new FormGroup({
      firstname: new FormControl('', []),
      surname: new FormControl('', []),
      // mobile: new FormControl('', [Validators.required, Validators.pattern(this.phoneNumberPattern)]),
      mobile: new FormControl('', []),
      dob: new FormControl('', []),
      residenceAddress: new FormControl('', []),
      orgName: new FormControl('', []),
      organisationType: new FormControl('', []),
      designation: new FormControl('', []),
      designationOther: new FormControl('', []),
      residenceState: new FormControl('', []),
      residenceDistrict: new FormControl('', []),
    })

    this.fetchMeta()

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
    this.createChatForm.patchValue({ replymsg: text })

    if (data.toLowerCase() === 'india') {
      this.dropdownStatus = 'state'
      const array: any = []
      const obsof1 = of(array)
      this.filteredOptions = obsof1
      this.councilFilter('')
    } else {
      this.dropdownStatus = ''
      this.enableInputForDropdown = false
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
    this.createChatForm.patchValue({ replymsg: text })

    const disList = this.district.filter((dis: any) => {
      if (dis.state === data) {
        return dis
      }
    })

    this.districtArr = disList[0].districts

    this.dropdownStatus = 'district'
    const array: any = []
    const obsof1 = of(array)
    this.filteredOptions = obsof1
    this.councilFilter('')

  }

  getSelectedDataDistrict(data: any) {
    let preText = ''
    const content = `${this.createChatForm.value.replymsg}, `
    preText = this.createChatForm.value.replymsg
      ? content
      : this.createChatForm.value.replymsg

    const text = preText + data
    this.createChatForm.patchValue({ replymsg: text })
    this.dropdownStatus = ''
    this.disableLocation = true

  }

  getChatResponse(_chatFormValue: any) {
    const outputArea = $('#chat-output')

    const v = this.validateResponse(this.chatArray[this.order], _chatFormValue.replymsg)

    this.assignFields(this.chatArray[this.order].id, _chatFormValue.replymsg)

    if (v) {
      let message = $('#user-input').val()
      this.nextId = this.chatArray[this.order].action['submit']
      this.order = this.order + 1

      if (this.nextId === 'end') {
        message = _chatFormValue.replymsg
        this.order = this.order - 1
        this.inputMsgEnabled = true
        this.updateProfile()
      }
      if (this.nextId === 'proceed') {
        this.nextId = _chatFormValue.replymsg
        message = _chatFormValue.replymsg
        this.inputMsgEnabled = true
      }
      if (this.nextId === 'organizationType') {
        message = _chatFormValue.replymsg
        this.inputMsgEnabled = true
      }

      if (this.nextId === 'location') {
        this.enableInputForDropdown = true
        this.createChatForm.value.replymsg = ''
        this.dropdownStatus = 'country'
        this.disableLocation = false
      }

      if (_chatFormValue.replymsg === 'Others - Please Specify') {

        $('#user-input').val('')
        if (this.nextId === 'end') {
          this.nextId = 'organizationName'
          this.skipButton = true
        } else {
          this.nextId = _chatFormValue.replymsg
        }
        this.nextQuestions()
        this.sendQuestion(this.currentData1)
        this.inputMsgEnabled = false
        return this.nextId
      }
      if (_chatFormValue.replymsg === 'skip') {
        if (this.nextId === 'organizationName') {
          this.inputMsgEnabled = true
          this.updateProfile()
        } else {
          this.nextQuestions()
          this.sendQuestion(this.currentData1)
          return this.nextId
        }
        this.skipButton = false
      }
      outputArea.append(`<div class="bot-message">
          <div class="message">
            ${message}
          </div>
        </div>`)
      this.nextQuestions()
      if (this.nextId !== 'end') {
        this.sendQuestion(this.currentData1)
      }
    }
    if (this.chatArray[this.order].required) {
      this.skipButton = false
    } else {
      this.skipButton = true
    }
    this.scrollToBottom()
    $('#user-input').val('')
  }

  nextQuestions() {
    this.currentData1 = this.chatObj.regOption.profiledetails.filter((data: { id: any }) => data.id === this.nextId)
    this.chatArray.push(this.currentData1[0])
  }

  sendQuestion(question: any) {
    const nxtquest = question[0].title
    const outputArea = $('#chat-output')
    setTimeout(() => {
      outputArea.append(`
      <div class='user-message'>
        <div class='message'>
          ${nxtquest}
        </div>
      </div>
    `)
    }, 500)
    if (question[0]['type'] === 'options') {
      this.options = question[0].data.options
      this.inputMsgEnabled = true
    }
  }
  validateResponse(obj: any, msg: any) {
    switch (obj.data.type[0]) {
      case 'string': {
        if (obj.data.regex) {
          const dob = moment(msg)
          if (!dob.isValid()) {
            this.errMsg = obj.action.error
            return false
          }
          return true
        }

        if (msg.length >= obj.data.length) {
          this.errMsg = obj.action.error
          return false
        }

        if (this.errMsg) {
          this.errMsg = ''
          return true
        }
        return true
      }
      case 'number': {
        if (msg.length < obj.data.length) {
          this.errMsg = obj.action.error
          return false
        }
        if (obj.data.regex) {
          if (obj.data.regexPattern.match(msg)) {
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
    this.contEl.nativeElement.scrollTop += 500
  }
  assignFields(qid: any, value: any) {
    switch (qid) {
      case 'fname':
        this.createUserForm.controls.firstname.setValue(value)
        break
      case 'lname':
        this.createUserForm.controls.surname.setValue(value)
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
        this.createUserForm.controls.designation.setValue(value)
        break
      case 'Healthcare Worker':
      case 'Healthcare Volunteer':
      case 'Others - Please Specify':
        this.createUserForm.controls.designationOther.setValue('designationOther other')
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
    // console.log('Form ')
    // console.log(this.createUserForm.value)
  }

  assignFields1() {
    // console.log(this.createUserForm.value)

    this.createUserForm.controls.firstname.setValue('Prabina')
    this.createUserForm.controls.surname.setValue('Parichha')
    this.createUserForm.controls.mobile.setValue(9776196179)
    this.createUserForm.controls.dob.setValue('26-03-2021')
    this.createUserForm.controls.residenceAddress.setValue('abvcd gfjhjfh')
    this.createUserForm.controls.orgName.setValue('abcdfdf')
    this.createUserForm.controls.organisationType.setValue('Private Sector')
    this.createUserForm.controls.designation.setValue('Healthcare Worker')
    this.createUserForm.controls.designationOther.setValue('ANM')
    // console.log('Form ')
    // console.log(this.createUserForm.value)
  }

  private constructReq(form: any) {
    // form.value.dob = changeformat(new Date(`${form.value.dob}`))
    const profileReq = {
      personalDetails: {
        firstname: form.value.firstname,
        surname: form.value.surname,
        dob: form.value.dob,
        mobile: form.value.mobile,
        postalAddress: form.value.residenceAddress,
      },
      professionalDetails: [
        ...this.getOrganisationsHistory(form),
      ],
    }
    return profileReq
  }

  private getOrganisationsHistory(form: any) {
    const organisations: any = []
    const org = {
      organisationType: form.value.organisationType,
      name: form.value.orgName,
      designation: form.value.designation,
      designationOther: form.value.designationOther,
    }
    organisations.push(org)
    return organisations
  }

  updateProfile() {
    const profileRequest = this.constructReq(this.createUserForm)

    // console.log('OBjeee ', profileRequest)

    this.userProfileSvc.updateProfileDetails(profileRequest).subscribe(data => {
      if (data) {
        // on Success
        if (localStorage.getItem('selectedCourse')) {
          let baseUrl = document.baseURI
          baseUrl = document.baseURI + localStorage.getItem('selectedCourse')
          this.router.navigate([baseUrl])
        } else {
          this.router.navigate(['/page/home'])
        }
      }

    })
  }
}
