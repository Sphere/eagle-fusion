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
})
