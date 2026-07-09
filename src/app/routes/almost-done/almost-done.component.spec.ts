jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    fetchStartUpDetails = jest.fn().mockResolvedValue({})
    keyClockLogin = jest.fn()
  },
}))
jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {},
}))
jest.mock('src/app/services/user-data-cache.service', () => ({
  UserDataCacheService: class {},
}))
jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
    error = jest.fn()
  },
}))

import { AlmostDoneComponent } from './almost-done.component'
import { FormBuilder } from '@angular/forms'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'

describe('AlmostDoneComponent', () => {
  let component: AlmostDoneComponent

  const mockConfigService = {} as ConfigurationsService
  const mockUserProfileService = {
    updateProfileDetails: jest.fn().mockReturnValue(of({ params: { status: 'SUCCESS' }, result: {} })),
  } as any
  const mockMatSnackBar = { open: jest.fn() } as unknown as MatSnackBar
  const mockActivatedRoute = { queryParams: of({}), data: of({}) } as any
  const mockHttpClient = { get: jest.fn().mockReturnValue(of({})) } as any
  const mockUserAgentService = { getUserAgent: jest.fn().mockReturnValue('Mozilla/5.0'), generateCookie: jest.fn().mockReturnValue('') } as any
  const mockSignupService = { fetchStartUpDetails: jest.fn().mockResolvedValue({}), keyClockLogin: jest.fn() } as any
  const mockLoggerService = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
  const mockTranslateService = { instant: jest.fn().mockReturnValue('') } as any

  const fb = new FormBuilder()

  beforeEach(() => {
    component = new AlmostDoneComponent(
      mockConfigService,
      mockUserProfileService,
      mockMatSnackBar,
      fb as any,
      mockActivatedRoute,
      mockHttpClient,
      mockUserAgentService,
      mockSignupService,
      mockLoggerService,
      mockTranslateService
    )
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist' } }
    component.backgroundSelect = ''
    component.ngOnInit()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize almostDoneForm and createUserForm', () => {
    expect(component.almostDoneForm).toBeDefined()
    expect(component.createUserForm).toBeDefined()
  })

  it('should set enableSubmit to false when selecting Mother/Family Members', () => {
    component.selectedBg = 'Mother/Family Members'
    component.chooseBackground('Mother/Family Members')
    expect(component.enableSubmit).toBeFalsy()
  })

  it('should set enableSubmit to true when selecting Asha Facilitator or Asha Trainer', () => {
    component.selectedBg = 'Asha Facilitator'
    component.chooseBackground('Asha Facilitator')
    expect(component.enableSubmit).toBeTruthy()

    component.selectedBg = 'Asha Trainer'
    component.chooseBackground('Asha Trainer')
    expect(component.enableSubmit).toBeTruthy()
  })

  it('should call redirectToParent.emit() on redirectToYourBackground()', () => {
    jest.spyOn(component.redirectToParent, 'emit')
    component.redirectToYourBackground()
    expect(component.redirectToParent.emit).toHaveBeenCalledWith('true')
  })

  it('should update profile and navigate to home page on submit', () => {
    component.yourBackground = { value: { country: 'India', state: 'State', distict: 'District', dob: 'DOB', countryCode: 'CountryCode' } }
    component.backgroundSelect = 'Background'
    component.almostDoneForm.controls.professSelected.setValue('ASHA')
    component.almostDoneForm.controls.locationselect.setValue('Location')
    jest.spyOn(component, 'updateProfile')

    component.onsubmit()

    expect(component.updateProfile).toHaveBeenCalled()
  })

  it('should update profession and enableSubmit on professionSelect()', () => {
    component.profession = 'Profession'
    component.createUserForm.controls.designation.setValue('Designation')
    component.almostDoneForm.controls.profession.setValue('Profession')
    jest.spyOn(component.almostDoneForm.controls.professionOtherSpecify, 'clearValidators')

    component.professionSelect('New Profession')

    expect(component.createUserForm.controls.designation.value).toEqual('New Profession')
    expect(component.almostDoneForm.controls.profession.value).toEqual('New Profession')
    expect(component.almostDoneForm.controls.professionOtherSpecify.clearValidators).toHaveBeenCalled()
    expect(component.professionOthersField).toBeFalsy()
    expect(component.rnFieldDisabled).toBeTruthy()
  })

  it('should update orgType and enableSubmit on orgTypeSelect()', () => {
    component.almostDoneForm.controls.orgType.setValue('OrgType')
    jest.spyOn(component.almostDoneForm.controls.orgOtherSpecify, 'clearValidators')

    component.orgTypeSelect('New OrgType')

    expect(component.almostDoneForm.controls.orgType.value).toEqual('New OrgType')
    expect(component.almostDoneForm.controls.orgOtherSpecify.clearValidators).toHaveBeenCalled()
    expect(component.orgOthersField).toBeFalsy()
  })

  it('should set professionOthersField true and add validators when Others selected', () => {
    component.professionSelect('Others')
    expect(component.professionOthersField).toBe(true)
    expect(component.rnFieldDisabled).toBe(true)
  })

  it('should set professionOthersField false and set null when null selected', () => {
    component.professionSelect('null')
    expect(component.professionOthersField).toBe(false)
    expect(component.almostDoneForm.controls.profession.value).toBeNull()
  })

  it('should enable rnField for Midwives', () => {
    component.professionSelect('Midwives')
    expect(component.rnFieldDisabled).toBe(false)
  })

  it('should enable rnField for ANM/MPW', () => {
    component.professionSelect('ANM/MPW')
    expect(component.rnFieldDisabled).toBe(false)
  })

  it('should set orgOthersField true when Others is selected in orgTypeSelect', () => {
    component.orgTypeSelect('Others')
    expect(component.orgOthersField).toBe(true)
  })

  it('should set orgType null when null is passed to orgTypeSelect', () => {
    component.orgTypeSelect('null')
    expect(component.almostDoneForm.controls.orgType.value).toBeNull()
  })

  it('should compute getDegree and getAcademics', () => {
    component.studentCourse = 'BSC Nursing'
    component.studentInstitute = 'AIIMS'
    const degrees = component.getDegree('GRADUATE')
    expect(degrees).toHaveLength(1)
    expect(degrees[0].nameOfQualification).toBe('BSC Nursing')
    expect(degrees[0].nameOfInstitute).toBe('AIIMS')

    const academics = component.getAcademics()
    expect(academics).toHaveLength(1)
  })

  it('should build org object in getOrganisationsHistory for normal backgroundSelect', () => {
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Public')
    component.almostDoneForm.controls.orgName.setValue('Apollo')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    const orgs = component.getOrganisationsHistory()
    expect(orgs).toHaveLength(1)
    expect(orgs[0].orgType).toBe('Public')
    expect(orgs[0].name).toBe('Apollo')
    expect(orgs[0].designation).toBe('Nurse')
  })

  it('should add ASHA-specific fields to org in getOrganisationsHistory', () => {
    component.backgroundSelect = 'ASHA'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('PHC')
    component.almostDoneForm.controls.profession.setValue('ASHA')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.locationselect.setValue('District1')
    component.almostDoneForm.controls.block.setValue('Block1')
    component.almostDoneForm.controls.professSelected.setValue('ASHA')
    const orgs = component.getOrganisationsHistory()
    expect(orgs[0].locationselect).toBe('District1')
    expect(orgs[0].block).toBe('Block1')
  })

  it('should build constructReq without userProfile', () => {
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist', dob: '1990-01-01', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    const req = component.constructReq()
    expect(req).toHaveProperty('profileReq')
    expect(req.profileReq.personalDetails.dob).toBe('1990-01-01')
  })

  it('should call updateProfileDetails on updateProfile', async () => {
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist', dob: '1990-01-01', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.updateProfile()
    expect(mockUserProfileService.updateProfileDetails).toHaveBeenCalled()
  })

  it('should set hideAsha true when country is not India', async () => {
    component.yourBackground = { value: { country: 'USA', state: '', distict: '' } }
    await component.ngOnInit()
    expect(component.hideAsha).toBe(true)
  })

  it('assignFields profession case should set designation', () => {
    component.assignFields('profession', 'Nurse', {})
    expect(component.createUserForm.controls.designation.value).toBe('Nurse')
  })

  it('assignFields block case should set blockEntered', () => {
    component.assignFields('block', 'Block A', {})
    expect(component.blockEntered).toBe(true)
    component.assignFields('block', '', {})
    expect(component.blockEntered).toBe(false)
  })

  it('assignFields subcentre case should set subcentreEntered', () => {
    component.assignFields('subcentre', 'Sub A', {})
    expect(component.subcentreEntered).toBe(true)
  })

  it('assignFields locationselect case should set form value', () => {
    component.assignFields('locationselect', 'Location A', {})
    expect(component.almostDoneForm.controls.locationselect.value).toBe('Location A')
  })

  it('openSnackbar should call snackBar.open', () => {
    component.openSnackbar('Test message')
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test message', undefined, { duration: 2000 })
  })

  it('ngOnInit with ASHA backgroundSelect triggers http.get subscribe and map callback', async () => {
    const statesData = { states: [{ state: 'UP', districts: ['Dist1', 'Dist2'] }] }
    mockHttpClient.get.mockReturnValue(of(statesData))
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist1' } }
    component.backgroundSelect = 'ASHA'
    await component.ngOnInit()
    expect(component.disticts).toEqual(['Dist1', 'Dist2'])
  })

  it('chooseBackground Asha Facilitator triggers http.get subscribe and map callback', () => {
    const statesData = { states: [{ state: 'UP', districts: ['D1', 'D2'] }] }
    mockHttpClient.get.mockReturnValue(of(statesData))
    component.yourBackground = { value: { state: 'UP', distict: 'D1' } }
    component.chooseBackground('Asha Facilitator')
    expect(component.disticts).toEqual(['D1', 'D2'])
  })

  it('chooseBackground Asha Trainer triggers http.get subscribe and map callback', () => {
    const statesData = { states: [{ state: 'MH', districts: ['Pune'] }] }
    mockHttpClient.get.mockReturnValue(of(statesData))
    component.yourBackground = { value: { state: 'MH', distict: 'Pune' } }
    component.chooseBackground('Asha Trainer')
    expect(component.disticts).toEqual(['Pune'])
  })

  it('assignFields with Healthcare Volunteer triggers valueChanges callback', () => {
    component.backgroundSelect = 'Healthcare Volunteer'
    component.assignFields('profession', 'Nurse', {})
    component.almostDoneForm.controls.professSelected.setValue('ASHA')
    expect(component.enableSubmit).toBe(false)
  })

  it('assignFields with Student triggers valueChanges callback on instituteName change', () => {
    component.backgroundSelect = 'Student'
    component.assignFields('institutionName', 'College', {})
    ;(component.almostDoneForm.controls as any).instituteName.setValue('AIIMS')
    expect(component.enableSubmit).toBe(false)
  })

  it('assignFields organizationType case sets orgType', () => {
    component.assignFields('organizationType', 'Private', {})
    expect(component.createUserForm.controls.orgType.value).toBe('Private')
  })

  it('assignFields organizationName case sets orgName', () => {
    component.assignFields('organizationName', 'Apollo Hospital', {})
    expect(component.createUserForm.controls.orgName.value).toBe('Apollo Hospital')
  })

  it('assignFields coursename case sets studentCourse', () => {
    component.assignFields('coursename', 'BSc Nursing', {})
    expect(component.studentCourse).toBe('BSc Nursing')
  })

  it('assignFields institutionName sets studentInstitute when not faculty', () => {
    component.profession = 'nurse'
    component.assignFields('institutionName', 'AIIMS', {})
    expect(component.studentInstitute).toBe('AIIMS')
  })

  it('assignFields institutionName sets orgName when profession is faculty', () => {
    component.profession = 'faculty'
    component.almostDoneForm.controls.orgName.setValue('')
    component.assignFields('institutionName', 'Delhi College', {})
    expect(component.createUserForm.controls.orgName.value).toBe('Delhi College')
  })

  it('getOrganisationsHistory adds Others selectBackground field', () => {
    component.backgroundSelect = 'Others'
    component.almostDoneForm.controls.orgType.setValue('Private')
    component.almostDoneForm.controls.orgName.setValue('Test Org')
    component.almostDoneForm.controls.profession.setValue('Doctor')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.selectBackground.setValue('Asha Facilitator')
    const orgs = component.getOrganisationsHistory()
    expect(orgs[0].selectBackground).toBe('Asha Facilitator')
  })

  it('getOrganisationsHistory Student adds qualification and instituteName', () => {
    component.backgroundSelect = 'Student'
    component.almostDoneForm.controls.orgType.setValue('Education')
    component.almostDoneForm.controls.orgName.setValue('University')
    component.almostDoneForm.controls.profession.setValue('Student')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.courseName.setValue('MBBS')
    ;(component.almostDoneForm.controls as any).instituteName.setValue('AIIMS')
    const orgs = component.getOrganisationsHistory()
    expect(orgs[0].qualification).toBe('MBBS')
    expect(orgs[0].instituteName).toBe('AIIMS')
  })

  it('assignFields subcentre empty sets subcentreEntered false', () => {
    component.backgroundSelect = 'Others'
    component.assignFields('subcentre', '', {})
    expect(component.subcentreEntered).toBe(false)
  })

  it('assignFields default case does not throw for unknown qid', () => {
    component.backgroundSelect = 'Others'
    expect(() => component.assignFields('unknownQid', 'value', {})).not.toThrow()
  })

  it('assignFields sets enableSubmit false when both block and subcentre entered', () => {
    component.backgroundSelect = 'Others'
    component.assignFields('block', 'Block A', {})
    component.assignFields('subcentre', 'Sub A', {})
    expect(component.blockEntered).toBe(true)
    expect(component.subcentreEntered).toBe(true)
    expect(component.enableSubmit).toBe(false)
  })

  it('assignFields Healthcare Worker valueChanges else branch sets enableSubmit true', () => {
    component.backgroundSelect = 'Healthcare Worker'
    component.assignFields('profession', 'Nurse', {})
    component.almostDoneForm.controls.professSelected.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.block.setValue('trigger')
    expect(component.enableSubmit).toBe(true)
  })

  it('assignFields ASHA sets enableSubmit false when block and locationselect present', () => {
    component.backgroundSelect = 'ASHA'
    component.almostDoneForm.controls.block.setValue('Block1')
    component.almostDoneForm.controls.locationselect.setValue('Loc1')
    component.assignFields('profession', 'ASHA', {})
    expect(component.enableSubmit).toBe(false)
  })

  it('assignFields Student valueChanges else branch sets enableSubmit true when no instituteName', () => {
    component.backgroundSelect = 'Student'
    component.assignFields('coursename', 'BSc', {})
    ;(component.almostDoneForm.controls as any).instituteName.setValue('')
    component.almostDoneForm.controls.block.setValue('trigger')
    expect(component.enableSubmit).toBe(true)
  })

  it('assignFields builds degrees when profession is student and studentInstitute set', () => {
    component.profession = 'student'
    component.studentInstitute = 'AIIMS'
    component.studentCourse = 'MBBS'
    component.backgroundSelect = 'Others'
    component.assignFields('coursename', 'MBBS', {})
    const degrees = component.createUserForm.get('degrees') as any
    expect(degrees.length).toBe(1)
    expect(degrees.at(0).value.instituteName).toBe('AIIMS')
  })

  it('assignFields sets enableSubmit false when event has keys, form dirty and not ASHA', () => {
    component.backgroundSelect = 'Others'
    component.almostDoneForm.markAsDirty()
    component.assignFields('profession', 'Nurse', { some: 'value' })
    expect(component.enableSubmit).toBe(false)
  })

  it('getOrganisationsHistory adds Asha Facilitator location fields for Others background', () => {
    component.backgroundSelect = 'Others'
    component.selectedBg = 'Asha Facilitator'
    component.almostDoneForm.controls.orgType.setValue('Public')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('ASHA')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.selectBackground.setValue('Asha Facilitator')
    component.almostDoneForm.controls.locationselect.setValue('Dist1')
    component.almostDoneForm.controls.block.setValue('Block1')
    const orgs = component.getOrganisationsHistory()
    expect(orgs[0].locationselect).toBe('Dist1')
    expect(orgs[0].designation).toBe('Asha Facilitator')
  })

  it('getOrganisationsHistory adds Asha Trainer location fields for Others background', () => {
    component.backgroundSelect = 'Others'
    component.selectedBg = 'Asha Trainer'
    component.almostDoneForm.controls.orgType.setValue('Public')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('ASHA')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.almostDoneForm.controls.selectBackground.setValue('Asha Trainer')
    component.almostDoneForm.controls.subcentre.setValue('Sub1')
    const orgs = component.getOrganisationsHistory()
    expect(orgs[0].subcentre).toBe('Sub1')
    expect(orgs[0].designation).toBe('Asha Trainer')
  })

  it('updateProfile sets userId from unMappedUser when present', () => {
    ;(mockConfigService as any).userProfile = null
    ;(mockConfigService as any).unMappedUser = { id: 'unmapped-99' }
    component.result = { userId: 'result-1' }
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist', dob: '1990', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    component.updateProfile()
    expect(component.userId).toBe('unmapped-99')
  })

  it('updateProfile redirect branch navigates to redirect url when valid', async () => {
    ;(mockConfigService as any).userProfile = null
    ;(mockConfigService as any).unMappedUser = { id: 'unmapped-99' }
    component.result = { userId: 'result-1' }
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist', dob: '1990', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    ;(component as any).activateRoute = { queryParams: of({ redirect: '/app/some/course' }) }
    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
    mockUserProfileService.updateProfileDetails.mockReturnValue(of({ params: { status: 'SUCCESS' }, result: {} }))
    component.updateProfile()
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve()
    expect(window.location.href).toContain('/app/some/course')
  })

  it('updateProfile redirect else branch navigates to home when redirect absent', async () => {
    ;(mockConfigService as any).userProfile = null
    ;(mockConfigService as any).unMappedUser = { id: 'unmapped-99' }
    component.result = { userId: 'result-1' }
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'Dist', dob: '1990', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Gov')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    ;(component as any).activateRoute = { queryParams: of({}) }
    Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
    mockUserProfileService.updateProfileDetails.mockReturnValue(of({ params: { status: 'SUCCESS' }, result: {} }))
    component.updateProfile()
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve()
    expect(window.location.href).toContain('/page/home')
  })

  it('constructReq uses configSvc.userProfile when present', () => {
    ;(mockConfigService as any).userProfile = { email: 'nurse@example.com', firstName: 'John', middleName: 'K', lastName: 'Doe' }
    ;(mockConfigService as any).unMappedUser = { id: 'u-123' }
    component.yourBackground = { value: { country: 'India', state: 'UP', distict: 'D1', dob: '1990-01-01', countryCode: '+91' } }
    component.backgroundSelect = 'Healthcare Worker'
    component.almostDoneForm.controls.orgType.setValue('Public')
    component.almostDoneForm.controls.orgName.setValue('Org')
    component.almostDoneForm.controls.profession.setValue('Nurse')
    component.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    component.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    const req = component.constructReq()
    expect(req.profileReq.personalDetails.primaryEmail).toBe('nurse@example.com')
  })
})
