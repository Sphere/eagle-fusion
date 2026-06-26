jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1', profileDetails: { userSource: null } }
  },
  ImageCropComponent: class {},
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
    updateProfileDetails = jest.fn()
    _updateuser = { next: jest.fn() }
  },
}))

jest.mock('../../../../../project/ws/author/src/public-api', () => ({
  LoaderService: class { changeLoad = { next: jest.fn() } },
}))

jest.mock('@ws/author/src/lib/constants/upload', () => ({
  IMAGE_MAX_SIZE: 5000000,
  IMAGE_SUPPORT_TYPES: ['.jpg', '.jpeg', '.png'],
}))

jest.mock('@ws-widget/utils/src/public-api', () => ({
  ImageCropComponent: class {},
}))

jest.mock('../request-util', () => ({
  constructReq: jest.fn().mockReturnValue({
    profileReq: { personalDetails: { profileLocation: '' } },
  }),
}))

jest.mock('src/app/services/user-agent.service', () => ({
  UserAgentResolverService: class {
    getUserAgent = jest.fn().mockReturnValue('agent')
    generateCookie = jest.fn().mockReturnValue('cookie')
  },
}))

import { of } from 'rxjs'
import { ProfileSelectComponent } from './profile-select.component'

describe('ProfileSelectComponent', () => {
  let component: ProfileSelectComponent
  let mockDialogRef: any
  let mockSnackBar: any
  let mockUserProfileSvc: any
  let mockConfigSvc: any
  let mockDialog: any
  let mockLoader: any
  let mockUserAgentSvc: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockSnackBar = { openFromComponent: jest.fn() }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: { profileReq: { personalDetails: { photo: '' } } },
      })),
      updateProfileDetails: jest.fn().mockReturnValue(of({ success: true })),
      _updateuser: { next: jest.fn() },
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1', profileDetails: { userSource: null } },
    }
    mockDialog = { open: jest.fn() }
    mockLoader = { changeLoad: { next: jest.fn() } }
    mockUserAgentSvc = {
      getUserAgent: jest.fn().mockReturnValue({ OS: 'Mac', browserName: 'Chrome' }),
      generateCookie: jest.fn().mockReturnValue('cookie'),
    }

    component = new ProfileSelectComponent(
      mockDialogRef,
      mockSnackBar,
      mockUserProfileSvc,
      mockConfigSvc,
      mockDialog,
      mockLoader,
      mockUserAgentSvc,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have 5 preset images in imgJson', () => {
    expect(component.imgJson).toHaveLength(5)
  })

  it('should initialize createUserForm with photo control', () => {
    expect(component.createUserForm.get('photo')).toBeTruthy()
  })

  it('should call dialogRef.close on closeDialog()', () => {
    component.closeDialog()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })

  it('should call getUserdetailsFromRegistry on ngOnInit when userProfile is set', () => {
    component.ngOnInit()
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
  })

  it('should not call getUserdetailsFromRegistry when userProfile is null', () => {
    mockConfigSvc.userProfile = null
    component.ngOnInit()
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
  })

  it('should set photo value on selectProfile()', () => {
    component.userProfileData = {
      profileReq: { personalDetails: { photo: '' } },
      preferences: {},
    }
    mockUserProfileSvc.updateProfileDetails.mockReturnValue(of({ res: true }))
    const imgUrl = '../../../../fusion-assets/images/Group 205.png'
    component.selectProfile(imgUrl)
    expect(component.createUserForm.get('photo')?.value).toBe(imgUrl)
  })
})
