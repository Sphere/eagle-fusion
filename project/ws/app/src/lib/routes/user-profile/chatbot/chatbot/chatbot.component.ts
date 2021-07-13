import { Component, OnInit, ViewChild } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FormControl, FormGroup } from '@angular/forms'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
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
  // @ViewChild('chatoutput', { static: false }) outputArea!: ElementRef
  @ViewChild('chatoutput', { static: false }) contEl: any

  constructor(private http: HttpClient,
              private userProfileSvc: UserProfileService) { }

  ngOnInit() {
    this.http.get(this.chatUrl).subscribe(data => {
      this.chatObj = data
      this.chatArray.push(this.chatObj.regOption.profiledetails[0])
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
    })
  }

  getChatResponse(_chatFormValue: any) {
    const outputArea = $('#chat-output')
    const v = this.validateResponse(_chatFormValue.replymsg)
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
    },         500)
    if (question[0]['type'] === 'options') {
      this.options = question[0].data.options
      this.inputMsgEnabled = true
    }
  }
  validateResponse(msg: any) {
    if (msg) {
      return true
    }
    return false
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
      name: form.value.orgName || 'ANM',
      designation: form.value.designation,
      designationOther: form.value.designationOther,
    }
    organisations.push(org)
    return organisations
  }

  updateProfile() {
    const profileRequest = this.constructReq(this.createUserForm)

    // console.log('OBjeee ', profileRequest)

    this.userProfileSvc.updateProfileDetails(profileRequest).subscribe(() => {
      // console.log('Result -----')
    })
  }
}
