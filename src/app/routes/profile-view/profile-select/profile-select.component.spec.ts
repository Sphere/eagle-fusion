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

  describe('uploadProfileImg', () => {
    it('should show snackbar for invalid file type', () => {
      const invalidFile = new File(['x'], 'test.txt', { type: 'text/plain' })
      component.uploadProfileImg(invalidFile)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
    })

    it('should show snackbar when file exceeds max size', () => {
      const bigFile = new File(['x'.repeat(6000000)], 'big.jpg', { type: 'image/jpeg' })
      Object.defineProperty(bigFile, 'size', { value: 6000000 })
      component.uploadProfileImg(bigFile)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
    })

    it('should open dialog for valid file', () => {
      const validFile = new File(['x'], 'test.jpg', { type: 'image/jpeg' })
      const { of: rxOf } = require('rxjs')
      mockDialog.open = jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(rxOf(null)) })
      component.uploadProfileImg(validFile)
      expect(mockDialog.open).toHaveBeenCalled()
    })

    it('should trigger reader.onload and call onSubmit when dialog returns a file', () => {
      component.userProfileData = { profileReq: { personalDetails: {} }, preferences: {} }
      const validFile = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
      const cropResult = new File(['cropped'], 'photo.jpg', { type: 'image/jpeg' })
      const { of: rxOf } = require('rxjs')

      const mockReader = { readAsDataURL: jest.fn(), result: 'data:image/jpeg;base64,abc', onload: null as any }
      const OrigFileReader = global.FileReader
      ;(global as any).FileReader = jest.fn().mockImplementation(() => mockReader)
      mockDialog.open = jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(rxOf(cropResult)) })
      mockUserProfileSvc.updateProfileDetails = jest.fn().mockReturnValue(rxOf({ success: true }))

      component.uploadProfileImg(validFile)
      // Manually trigger reader.onload (afterClosed callback already set it up)
      mockReader.onload({})

      expect(component.photoUrl).toBe('data:image/jpeg;base64,abc')
      ;(global as any).FileReader = OrigFileReader
    })
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
