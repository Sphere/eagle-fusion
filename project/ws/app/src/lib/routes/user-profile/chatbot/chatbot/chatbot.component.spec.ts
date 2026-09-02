import { UntypedFormBuilder } from '@angular/forms'
import { of } from 'rxjs'

jest.mock('@ws-widget/collection/src/lib/btn-profile/btn-profile.service', () => ({
  BtnProfileService: class MockBtnProfileService {},
}), { virtual: true })

import { ChatbotComponent } from './chatbot.component'

describe('ChatbotComponent', () => {
  let component: ChatbotComponent
  let httpMock: any
  let userProfileSvcMock: any
  let routerMock: any
  let snackBarMock: any
  let configSvcMock: any
  let btnserviceMock: any
  let userAgentSvcMock: any
  let jqueryMock: any

  const chatJson = {
    regOption: {
      profiledetails: [
        { id: 'fname', title: 'What is your name?', data: { type: ['string'] }, action: { submit: 'lname' } },
        { id: 'lname', title: 'Surname?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'middlename', title: 'Middle name?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'RNNumber', title: 'RN number?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'coursename', title: 'Course name?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'designation', title: 'Designation?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'organizationName', title: 'Organization?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'dob', title: 'DOB?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'location', title: 'Location?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'proceed', title: 'Proceed?', data: { type: ['string'] }, action: { submit: 'end' } },
        { id: 'end', title: '', data: { type: ['string'] }, action: { submit: 'end' } },
      ],
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()

    jqueryMock = {
      append: jest.fn(),
      empty: jest.fn(),
      val: jest.fn(),
    };
    (global as any).$ = jest.fn().mockReturnValue(jqueryMock)

    httpMock = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('district')) {
          return of({ states: [{ state: 'Kerala', districts: ['Kollam', 'Kochi'] }] })
        }
        if (url.includes('state')) {
          return of({ states: [{ name: 'Kerala' }, { name: 'Delhi' }] })
        }
        return of(chatJson)
      }),
    }

    userProfileSvcMock = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: {
          profileReq: {
            personalDetails: { firstname: 'John', middlename: 'K', surname: 'Doe' },
          },
        },
      })),
      getMasterNationlity: jest.fn().mockReturnValue(of({
        nationalities: [{ name: 'India', countryCode: '+91' }, { name: 'USA', countryCode: '+1' }],
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ ok: true })),
    }

    routerMock = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    }

    snackBarMock = {
      open: jest.fn(),
    }

    configSvcMock = {
      unMappedUser: { id: 'u1' },
      userProfile: { email: 'john@test.com', userId: 'uid1' },
      profileDetailsStatus: false,
    }

    btnserviceMock = {
      changeName: jest.fn(),
    }

    userAgentSvcMock = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'Windows', browserName: 'Chrome' }),
      generateCookie: jest.fn().mockReturnValue('cookie123'),
    }

    component = new ChatbotComponent(
      httpMock,
      userProfileSvcMock,
      routerMock,
      snackBarMock,
      new UntypedFormBuilder(),
      configSvcMock,
      btnserviceMock,
      userAgentSvcMock,
    )
    component.contEl = { nativeElement: { clientHeight: 100, scrollTop: 0 } }
  })

  afterEach(() => {
    jest.useRealTimers()
    delete (global as any).$
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should build registered user name from registry data', () => {
      component.ngOnInit()
      expect(component.registeredUserName).toBe('John K Doe')
      expect(component.registeredEmail).toBe('john@test.com')
    })

    it('should build name without middlename/surname', () => {
      userProfileSvcMock.getUserdetailsFromRegistry.mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { firstname: 'Jane' } } },
      }))
      component.ngOnInit()
      expect(component.registeredUserName).toBe('Jane ')
    })

    it('should load chat, district and state config, and init forms', () => {
      component.ngOnInit()
      expect(component.chatObj).toEqual(chatJson)
      expect(component.chatArray.length).toBe(1)
      expect(component.district.length).toBe(1)
      expect(component.createChatForm).toBeTruthy()
      expect(component.createUserForm).toBeTruthy()
      expect(component.states.length).toBe(2)
      expect(component.statesArr).toEqual(['Kerala', 'Delhi'])
    })
  })

  it('createChatFormFields should build form with required replymsg', () => {
    const form = component.createChatFormFields()
    expect(form.get('replymsg')!.valid).toBe(false)
  })

  it('createUserFormFields should build full user form', () => {
    const form = component.createUserFormFields()
    expect(form.get('firstname')).toBeTruthy()
    expect(form.get('degrees')).toBeTruthy()
  })

  it('createDegree should build a degree group', () => {
    const degree = component.createDegree()
    expect(degree.get('degree')).toBeTruthy()
  })

  describe('councilFilter (via fetchMeta/getSelectedData flows)', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should filter country options', () => {
      component.dropdownStatus = 'country'
      const result = (component as any).councilFilter('ind')
      expect(result).toEqual(['India'])
    })

    it('should filter state options', () => {
      component.dropdownStatus = 'state'
      component.statesArr = ['Kerala', 'Delhi']
      const result = (component as any).councilFilter('del')
      expect(result).toEqual(['Delhi'])
    })

    it('should filter district options', () => {
      component.dropdownStatus = 'district'
      component.districtArr = ['Kollam', 'Kochi']
      const result = (component as any).councilFilter('koc')
      expect(result).toEqual(['Kochi'])
    })

    it('should return empty array for unrecognized dropdownStatus', () => {
      component.dropdownStatus = 'other'
      const result = (component as any).councilFilter('x')
      expect(result).toEqual([])
    })

    it('should return empty array when value falsy and not empty string', () => {
      component.dropdownStatus = 'country'
      const result = (component as any).councilFilter(undefined as any)
      expect(result).toEqual([])
    })
  })

  describe('setCountryCode', () => {
    it('should set country code control value', () => {
      component.ngOnInit()
      component.setCountryCode('India')
      expect(component.createUserForm.controls.countryCode.value).toBe('+91')
    })
  })

  describe('getSelectedData', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should handle india selection and switch to state dropdown', () => {
      component.getSelectedData('India')
      expect(component.dropdownStatus).toBe('state')
      expect(component.selectedAddress).toBe('India')
    })

    it('should append to existing replymsg text', () => {
      component.createChatForm.controls.replymsg.setValue('Existing')
      component.getSelectedData('India')
      expect(component.selectedAddress).toBe('Existing, India')
    })

    it('should handle non-india selection and call getChatResponse', () => {
      const spy = jest.spyOn(component, 'getChatResponse')
      component.getSelectedData('USA')
      expect(component.dropdownStatus).toBe('')
      expect(component.disableLocation).toBe(true)
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('getSelectedDataState', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.district = [{ state: 'Kerala', districts: ['Kollam', 'Kochi'] }]
    })

    it('should switch to district dropdown when districts found', () => {
      component.getSelectedDataState('Kerala')
      expect(component.dropdownStatus).toBe('district')
      expect(component.districtArr).toEqual(['Kollam', 'Kochi'])
    })

    it('should call getChatResponse when no districts found', () => {
      const spy = jest.spyOn(component, 'getChatResponse')
      component.getSelectedDataState('Unknown')
      expect(component.dropdownStatus).toBe('')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('getSelectedDataDistrict', () => {
    it('should set selectedAddress and call getChatResponse', () => {
      component.ngOnInit()
      const spy = jest.spyOn(component, 'getChatResponse')
      component.getSelectedDataDistrict('Kollam')
      expect(component.selectedAddress).toContain('Kollam')
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('getChatResponseCategorization', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should do nothing when replymsg empty', () => {
      component.getChatResponseCategorization({ replymsg: '' })
    })

    it('should call updateProfile on confirm', () => {
      const spy = jest.spyOn(component, 'updateProfile').mockImplementation(() => undefined)
      component.getChatResponseCategorization({ replymsg: 'Yes, I confirm' })
      expect(spy).toHaveBeenCalled()
    })

    it('should call retryProfile on Retry', () => {
      const spy = jest.spyOn(component, 'retryProfile').mockImplementation(() => undefined)
      component.getChatResponseCategorization({ replymsg: 'Retry' })
      expect(spy).toHaveBeenCalled()
    })

    it('should handle Yes branch appending message', () => {
      component.chatArray = [{ title: 'Question 1' }]
      component.getChatResponseCategorization({ replymsg: 'Yes' })
      expect(component.hideInputField).toBe(false)
      jest.runAllTimers()
    })

    it('should handle No branch with 3 name parts', () => {
      component.registeredUserName = 'John K Doe'
      component.getChatResponseCategorization({ replymsg: 'No' })
      expect(component.order).toBe(2)
    })

    it('should handle No branch with 2 name parts', () => {
      component.registeredUserName = 'John Doe'
      component.getChatResponseCategorization({ replymsg: 'No' })
      expect(component.order).toBe(2)
    })

    it('should handle default branch calling getChatResponse', () => {
      const spy = jest.spyOn(component, 'getChatResponse')
      component.getChatResponseCategorization({ replymsg: 'anything else' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('retryProfile', () => {
    it('should reset chat and forms', () => {
      component.ngOnInit()
      component.retryProfile()
      expect(component.order).toBe(0)
      expect(component.showConfirmedProfile).toBe(false)
      jest.runAllTimers()
      expect(component.showLoader).toBe(false)
    })
  })

  describe('getOptionSelected', () => {
    it('should activate other button for Others options', () => {
      component.getOptionSelected({ replymsg: 'Others' })
      expect(component.otherbtnactive).toBe(true)
      expect(component.inputMsgEnabled).toBe(false)
    })

    it('should activate confirmed profile otherwise', () => {
      component.getOptionSelected({ replymsg: 'Regular' })
      expect(component.otherbtnactive).toBe(false)
      expect(component.inputMsgEnabled).toBe(true)
    })
  })

  describe('validateResponse', () => {
    it('should return true for default type', () => {
      expect(component.validateResponse({ data: { type: ['other'] } }, 'x')).toBe(true)
    })

    it('should validate string type without regex', () => {
      expect(component.validateResponse({ data: { type: ['string'] } }, 'x')).toBe(true)
    })

    it('should validate string type with regex failing', () => {
      const obj = { id: 'name', data: { type: ['string'], regex: true, regexPattern: /^[0-9]+$/, length: 20 }, action: { error: 'invalid' } }
      expect(component.validateResponse(obj, 'abc')).toBe(false)
      expect(component.errMsg).toBe('invalid')
    })

    it('should validate string type with regex passing', () => {
      const obj = { id: 'name', data: { type: ['string'], regex: true, regexPattern: /^[0-9]+$/, length: 20 }, action: { error: 'invalid' } }
      expect(component.validateResponse(obj, '123')).toBe(true)
    })

    it('should validate dob when before today and pattern matches', () => {
      const obj = { id: 'dob', data: { type: ['string'], regex: true, regexPattern: /\d{2}\/\d{2}\/\d{4}/ }, action: { error: 'bad dob' } }
      expect(component.validateResponse(obj, '01/01/2000')).toBe(true)
    })

    it('should fail dob validation for future date', () => {
      const obj = { id: 'dob', data: { type: ['string'], regex: true, regexPattern: /\d{2}\/\d{2}\/\d{4}/ }, action: { error: 'bad dob' } }
      expect(component.validateResponse(obj, '01/01/2999')).toBe(false)
      expect(component.errMsg).toBe('bad dob')
    })

    it('should validate number type with correct length', () => {
      const obj = { data: { type: ['number'], length: 3 }, action: { error: 'bad number' } }
      expect(component.validateResponse(obj, '123')).toBe(true)
    })

    it('should fail number type with incorrect length', () => {
      const obj = { data: { type: ['number'], length: 3 }, action: { error: 'bad number' } }
      expect(component.validateResponse(obj, '12')).toBe(false)
    })

    it('should validate number type with regex', () => {
      const obj = { data: { type: ['number'], length: 3, regex: true, regexPattern: /^[0-9]+$/ }, action: { error: 'bad number' } }
      expect(component.validateResponse(obj, '123')).toBe(true)
    })

    it('should fail number type with regex mismatch', () => {
      const obj = { data: { type: ['number'], length: 3, regex: true, regexPattern: /^[a-z]+$/ }, action: { error: 'bad number' } }
      expect(component.validateResponse(obj, '123')).toBe(false)
    })
  })

  describe('scrollToBottom', () => {
    it('should update scrollTop based on clientHeight', () => {
      component.scrollToBottom()
      expect(component.contEl.nativeElement.scrollTop).toBe(200)
    })
  })

  describe('assignFields', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should assign fname', () => {
      component.assignFields('fname', 'Alice')
      expect(component.createUserForm.controls.firstname.value).toBe('Alice')
    })

    it('should assign lname', () => {
      component.assignFields('lname', 'Smith')
      expect(component.createUserForm.controls.surname.value).toBe('Smith')
    })

    it('should assign middlename', () => {
      component.assignFields('middlename', 'M')
      expect(component.createUserForm.controls.middlename.value).toBe('M')
    })

    it('should assign mobile as integer', () => {
      component.assignFields('mobile', '9876543210')
      expect(component.createUserForm.controls.mobile.value).toBe(9876543210)
    })

    it('should assign location to residenceAddress', () => {
      component.assignFields('location', 'Kochi')
      expect(component.createUserForm.controls.residenceAddress.value).toBe('Kochi')
    })

    it('should assign profession/others/others-specify to designation', () => {
      component.assignFields('profession', 'Nurse')
      expect(component.createUserForm.controls.designation.value).toBe('Nurse')
    })

    it('should assign healthcare worker/volunteer to designationOther', () => {
      component.assignFields('Healthcare Worker', 'Volunteer role')
      expect(component.createUserForm.controls.designationOther.value).toBe('Volunteer role')
    })

    it('should assign organizationType', () => {
      component.assignFields('organizationType', 'Government')
      expect(component.createUserForm.controls.organisationType.value).toBe('Government')
    })

    it('should assign organizationName', () => {
      component.assignFields('organizationName', 'Hospital')
      expect(component.createUserForm.controls.orgName.value).toBe('Hospital')
    })

    it('should assign RNNumber', () => {
      component.assignFields('RNNumber', 'RN123')
      expect(component.createUserForm.controls.regNurseRegMidwifeNumber.value).toBe('RN123')
    })

    it('should assign designation', () => {
      component.assignFields('designation', 'Doctor')
      expect(component.createUserForm.controls.designation.value).toBe('Doctor')
    })

    it('should assign institutionName to orgName when faculty', () => {
      component.profession = 'faculty'
      component.assignFields('institutionName', 'Uni A')
      expect(component.createUserForm.controls.orgName.value).toBe('Uni A')
    })

    it('should assign institutionName to studentInstitute when not faculty', () => {
      component.profession = 'student'
      component.studentCourse = 'CS'
      component.assignFields('institutionName', 'College A')
      expect(component.studentInstitute).toBe('College A')
    })

    it('should assign coursename to studentCourse', () => {
      component.assignFields('coursename', 'Nursing')
      expect(component.studentCourse).toBe('Nursing')
    })

    it('should hit default branch for unknown qid', () => {
      expect(() => component.assignFields('unknown', 'x')).not.toThrow()
    })
  })

  describe('getChatResponse', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.chatArray = [
        { id: 'fname', data: { type: ['string'] }, action: { submit: 'lname' }, required: true },
        { id: 'lname', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.chatObj = chatJson
      component.order = 0
    })

    it('should advance order and process a valid response', () => {
      component.getChatResponse({ replymsg: 'Alice' })
      expect(component.order).toBe(1)
    })

    it('should not advance when response invalid', () => {
      component.chatArray = [
        { id: 'num', data: { type: ['number'], length: 3 }, action: { error: 'bad', submit: 'end' }, required: true },
      ]
      component.order = 0
      component.getChatResponse({ replymsg: '12' })
      expect(component.order).toBe(0)
      expect(component.errMsg).toBe('bad')
    })

    it('should set RNNumber nextId for nurse type responses', () => {
      component.getChatResponse({ replymsg: 'ANM' })
      expect(component.nextId).toBe('RNNumber')
    })

    it('should set student profession and coursename nextId', () => {
      component.getChatResponse({ replymsg: 'Student' })
      expect(component.profession).toBe('student')
      expect(component.nextId).toBe('coursename')
    })

    it('should set faculty profession and designation nextId', () => {
      component.getChatResponse({ replymsg: 'Faculty' })
      expect(component.profession).toBe('faculty')
      expect(component.nextId).toBe('designation')
    })

    it('should handle "Others - Please Specify" branch', () => {
      component.chatArray[0].action.submit = 'end'
      component.getChatResponse({ replymsg: 'Others - Please Specify' })
      expect(component.otherbtnactive).toBe(true)
      expect(component.nextId).toBe('organizationName')
      expect(component.skipButton).toBe(true)
    })

    it('should handle skip at organizationName by calling confirmation', () => {
      component.chatArray = [
        { id: 'organizationName', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      const spy = jest.spyOn(component, 'getConfirmation').mockImplementation(() => undefined)
      component.getChatResponse({ replymsg: 'skip' })
      expect(spy).toHaveBeenCalled()
    })

    it('should handle skip elsewhere by resetting and moving to next question', () => {
      component.getChatResponse({ replymsg: 'skip' })
      expect(component.skipButton).toBe(false)
    })

    it('should handle end nextId by calling getConfirmation', () => {
      component.chatArray = [
        { id: 'lname', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      const spy = jest.spyOn(component, 'getConfirmation').mockImplementation(() => undefined)
      component.getChatResponse({ replymsg: 'Doe' })
      expect(spy).toHaveBeenCalled()
    })

    it('should populate mobile automatically from userProfile email when valid', () => {
      component.chatArray = [
        { id: 'fname', data: { type: ['string'] }, action: { submit: 'mobile' }, required: true },
        { id: 'mobile', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      configSvcMock.userProfile = { email: '9876543210@domain.com' }
      component.getChatResponse({ replymsg: 'Alice' })
      expect(component.mobileLogin).toBe(true)
    })

    it('should set skipButton true for optional next question', () => {
      component.chatArray = [
        { id: 'fname', data: { type: ['string'] }, action: { submit: 'lname' }, required: false },
        { id: 'lname', data: { type: ['string'] }, action: { submit: 'end' }, required: false },
      ]
      component.order = 0
      component.getChatResponse({ replymsg: 'Alice' })
      expect(component.skipButton).toBe(true)
    })

    it('should set nextId dob to show date picker', () => {
      component.chatArray = [
        { id: 'x', data: { type: ['string'] }, action: { submit: 'dob' }, required: true },
        { id: 'dob', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      component.getChatResponse({ replymsg: 'value' })
      expect(component.showDatePicker).toBe(true)
    })

    it('should handle location nextId enabling dropdown', () => {
      component.chatArray = [
        { id: 'x', data: { type: ['string'] }, action: { submit: 'location' }, required: true },
        { id: 'location', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      component.getChatResponse({ replymsg: 'value' })
      expect(component.enableInputForDropdown).toBe(true)
      expect(component.dropdownStatus).toBe('country')
    })

    it('should handle proceed nextId for Mother/Family member', () => {
      component.chatArray = [
        { id: 'x', data: { type: ['string'] }, action: { submit: 'proceed' }, required: true },
        { id: 'y', data: { type: ['string'] }, action: { submit: 'end' }, required: true },
      ]
      component.order = 0
      const spy = jest.spyOn(component, 'getConfirmation').mockImplementation(() => undefined)
      jest.spyOn(component, 'sendQuestion').mockImplementation(() => undefined)
      component.getChatResponse({ replymsg: 'Mother/Family member' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('nextQuestions / sendQuestion', () => {
    beforeEach(() => {
      component.chatObj = chatJson
    })

    it('nextQuestions should push matching question to chatArray', () => {
      component.nextId = 'lname'
      component.chatArray = []
      component.nextQuestions()
      expect(component.chatArray.length).toBe(1)
      expect(component.currentData1[0].id).toBe('lname')
    })

    it('sendQuestion should append question and schedule option enabling', () => {
      component.sendQuestion([{ title: 'Q1', type: 'options', data: { options: ['a', 'b'] } }])
      jest.runAllTimers()
      expect(component.options).toEqual(['a', 'b'])
      expect(component.inputMsgEnabled).toBe(true)
    })

    it('sendQuestion should skip appending when title empty', () => {
      component.sendQuestion([{ title: '', type: 'text', data: {} }])
      jest.runAllTimers()
    })
  })

  describe('formattedConfirmationInfo', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should include middlename when present', () => {
      component.createUserForm.controls.firstname.setValue('John')
      component.createUserForm.controls.middlename.setValue('K')
      component.createUserForm.controls.surname.setValue('Doe')
      const result = component.formattedConfirmationInfo()
      expect(result).toContain('John K Doe')
    })

    it('should include all optional fields when present', () => {
      component.createUserForm.controls.designation.setValue('Nurse')
      component.createUserForm.controls.designationOther.setValue('Category')
      component.createUserForm.controls.regNurseRegMidwifeNumber.setValue('RN1')
      component.createUserForm.controls.organisationType.setValue('Government')
      component.createUserForm.controls.orgName.setValue('Org A')
      component.profession = 'faculty';
      (component.createUserForm.get('degrees') as any).at(0).patchValue({ degree: 'BSc', instituteName: 'College A' })
      const result = component.formattedConfirmationInfo()
      expect(result).toContain('Profession : Nurse')
      expect(result).toContain('Name of Institution : Org A')
      expect(result).toContain('Course : BSc')
    })

    it('should show organization name label for non-faculty profession', () => {
      component.createUserForm.controls.orgName.setValue('Org B')
      component.profession = 'student'
      const result = component.formattedConfirmationInfo()
      expect(result).toContain('Name of organization : Org B')
    })
  })

  describe('getConfirmation', () => {
    it('should set options and schedule scroll', () => {
      component.ngOnInit()
      component.getConfirmation()
      expect(component.options).toEqual(['Yes, I confirm', 'Retry'])
      jest.runAllTimers()
    })
  })

  it('updateBtnProfileName should call btnservice.changeName', () => {
    component.updateBtnProfileName('Alice')
    expect(btnserviceMock.changeName).toHaveBeenCalledWith('Alice')
  })

  describe('updateProfile', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should update profile and reset chat on success', () => {
      component.registeredEmail = 'john@test.com'
      component.updateProfile()
      expect(userProfileSvcMock.updateProfileDetails).toHaveBeenCalled()
      expect(snackBarMock.open).toHaveBeenCalled()
      jest.runAllTimers()
      expect(routerMock.navigate).toHaveBeenCalled()
    })

    it('should navigate to selected course when present in localStorage', () => {
      localStorage.setItem('selectedCourse', '/course/1')
      component.updateProfile()
      jest.runAllTimers()
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course/1')
      localStorage.removeItem('selectedCourse')
    })

    it('should do nothing extra when update response is falsy', () => {
      userProfileSvcMock.updateProfileDetails.mockReturnValue(of(null))
      component.updateProfile()
      expect(snackBarMock.open).not.toHaveBeenCalled()
    })
  })
})
