jest.mock('../../../../library/ws-widget/utils/src/lib/services/configurations.service', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1', email: 'test@test.com', firstName: 'Jane', middleName: '', lastName: 'Doe' }
    unMappedUser = { profileDetails: { userSource: null } }
  },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    updateProfileDetails = jest.fn()
  },
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' })
    generateCookie = jest.fn().mockReturnValue('test-cookie')
  },
}))

jest.mock('@ngx-translate/core', () => ({
  TranslateService: class { instant = jest.fn().mockImplementation((k: string) => k) },
}))

import { FormGroup, FormControl } from '@angular/forms'
import { of } from 'rxjs'
import { YourBackgroundComponent } from './your-background.component'

describe('YourBackgroundComponent', () => {
  let component: YourBackgroundComponent
  let mockHttp: any
  let mockCdr: any
  let mockRoute: any
  let mockRouter: any
  let mockSnackBar: any
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockAboutYou: FormGroup

  beforeEach(() => {
    mockHttp = { get: jest.fn().mockReturnValue(of({ professions: [{ name: 'ASHA' }, { name: 'Nurse' }] })) }
    mockCdr = { detectChanges: jest.fn() }
    mockRoute = { queryParams: { subscribe: jest.fn((cb: any) => cb({})) } }
    mockRouter = { navigate: jest.fn() }
    mockSnackBar = { open: jest.fn() }
    mockConfigSvc = {
      userProfile: { userId: 'user-1', email: 'test@test.com', firstName: 'Jane', middleName: '', lastName: 'Doe' },
      unMappedUser: { profileDetails: { userSource: null } },
    }
    mockUserProfileSvc = { updateProfileDetails: jest.fn().mockReturnValue(of({})) }

    mockAboutYou = new FormGroup({
      country: new FormControl('India'),
      state: new FormControl('UP'),
      distict: new FormControl('Agra'),
      dob: new FormControl('1990-01-01'),
    })

    component = new YourBackgroundComponent(
      mockHttp,
      mockCdr,
      mockRoute,
      mockRouter,
      mockSnackBar,
      mockConfigSvc,
      mockUserProfileSvc,
      { getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }), generateCookie: jest.fn().mockReturnValue('cookie') } as any,
      { instant: jest.fn().mockImplementation((k: string) => k) } as any,
    )
    component.aboutYou = mockAboutYou
  })

  afterEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default almostDone to false', () => {
    expect(component.almostDone).toBe(false)
  })

  it('should default nextBtnDisable to true', () => {
    expect(component.nextBtnDisable).toBe(true)
  })

  it('should fetch professions on ngOnInit', () => {
    component.ngOnInit()
    expect(mockHttp.get).toHaveBeenCalledWith(component.professionUrl)
  })

  it('should filter out ASHA for non-India countries', () => {
    mockAboutYou.patchValue({ country: 'USA' })
    component.ngOnInit()
    expect(component.professions.some((p: any) => p.name === 'ASHA')).toBe(false)
  })

  it('should include ASHA for India', () => {
    mockAboutYou.patchValue({ country: 'India' })
    component.ngOnInit()
    expect(component.professions.some((p: any) => p.name === 'ASHA')).toBe(true)
  })

  describe('changeBackgroung', () => {
    it('should set almostDone to false', () => {
      component.almostDone = true
      component.changeBackgroung()
      expect(component.almostDone).toBe(false)
    })
  })

  describe('imgSelect', () => {
    it('should set bgImgSelect from img.name', () => {
      component.imgSelect({ name: 'Nurse' })
      expect(component.bgImgSelect).toBe('Nurse')
    })

    it('should set nextBtnDisable false when img is truthy', () => {
      component.nextBtnDisable = true
      component.imgSelect({ name: 'Doctor' })
      expect(component.nextBtnDisable).toBe(false)
    })

    it('should set almostDone true for non-Mother selections', () => {
      component.imgSelect({ name: 'Student' })
      expect(component.almostDone).toBe(true)
    })

    it('should call updateProfile for "Mother/Family Member"', () => {
      jest.spyOn(component, 'updateProfile')
      component.imgSelect({ name: 'Mother/Family Member' })
      expect(component.updateProfile).toHaveBeenCalled()
    })
  })

  describe('onsubmit redirect branches', () => {
    it('should navigate to redirect url and clear url_before_login when redirect param present', () => {
      jest.spyOn(component, 'updateProfile').mockImplementation(() => {})
      localStorage.setItem('url_before_login', '/somewhere')
      mockRoute.queryParams = { subscribe: jest.fn((cb: any) => cb({ redirect: '/dashboard' })) }
      component.imgSelect({ name: 'Mother/Family Member' })
      expect(localStorage.getItem('url_before_login')).toBeNull()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard'])
    })

    it('should navigate to page/home when no redirect param', () => {
      jest.spyOn(component, 'updateProfile').mockImplementation(() => {})
      mockRoute.queryParams = { subscribe: jest.fn((cb: any) => cb({})) }
      component.imgSelect({ name: 'Mother/Family Member' })
      expect(mockRouter.navigate).toHaveBeenCalledWith(['page', 'home'])
    })

    it('should do nothing in onsubmit when bgImgSelect is unset', () => {
      component.bgImgSelect = undefined
      component.onsubmit()
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('updateProfile branches', () => {
    it('should skip user field mapping when userProfile is null and build address without state/distict', () => {
      mockConfigSvc.userProfile = null
      mockAboutYou.patchValue({ country: 'India', state: '', distict: '' })
      component.updateProfile()
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.profileDetails.profileReq.personalDetails.postalAddress).toBe('India')
      expect(component.userId).toBe('')
    })

    it('should append state and district to address when present', () => {
      mockAboutYou.patchValue({ country: 'India', state: 'UP', distict: 'Agra' })
      component.updateProfile()
      const req = mockUserProfileSvc.updateProfileDetails.mock.calls[0][0]
      expect(req.request.profileDetails.profileReq.personalDetails.postalAddress).toBe('India, UP, Agra')
    })

    it('should not open snackbar when update response is falsy', () => {
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of(null))
      component.updateProfile()
      expect(mockSnackBar.open).not.toHaveBeenCalled()
    })

    it('should open snackbar on successful update', () => {
      mockUserProfileSvc.updateProfileDetails.mockReturnValue(of({ ok: true }))
      component.updateProfile()
      expect(mockSnackBar.open).toHaveBeenCalled()
    })
  })
})
