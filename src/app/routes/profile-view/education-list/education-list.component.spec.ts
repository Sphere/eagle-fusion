jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return { ...actual, effect: (fn: () => void) => { fn() } }
})

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-1' }
    unMappedUser = { id: 'unmapped-1' }
  },
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getUserdetailsFromRegistry = jest.fn()
  },
}))

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {
    changeWork = jest.fn()
  },
}))

import { of } from 'rxjs'
import { EducationListComponent } from './education-list.component'

describe('EducationListComponent', () => {
  let component: EducationListComponent
  let mockConfigSvc: any
  let mockUserProfileSvc: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockCdr: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: { userId: 'user-1' },
      unMappedUser: { id: 'unmapped-1' },
    }
    mockUserProfileSvc = {
      getUserdetailsFromRegistry: jest.fn().mockReturnValue(of({
        profileDetails: {
          profileReq: {
            academics: [
              { nameOfInstitute: 'AIIMS', degree: 'MBBS' },
              { nameOfInstitute: 'PGI', degree: 'MD' },
            ],
          },
        },
      })),
    }
    mockValueSvc = { isMobile: jest.fn().mockReturnValue(false) }
    mockContentSvc = { changeWork: jest.fn() }
    mockCdr = { detectChanges: jest.fn(), markForCheck: jest.fn() }

    component = new EducationListComponent(
      mockConfigSvc,
      mockUserProfileSvc,
      mockValueSvc,
      mockContentSvc,
      mockCdr,
    )
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set showbackButton true when isMobile is true', () => {
    mockValueSvc.isMobile.mockReturnValue(true)
    component = new EducationListComponent(mockConfigSvc, mockUserProfileSvc, mockValueSvc, mockContentSvc, mockCdr)
    expect(component.showbackButton).toBe(true)
  })

  it('should set showbackButton false when isMobile is false', () => {
    mockValueSvc.isMobile.mockReturnValue(false)
    component = new EducationListComponent(mockConfigSvc, mockUserProfileSvc, mockValueSvc, mockContentSvc, mockCdr)
    expect(component.showbackButton).toBe(false)
  })

  it('should fetch user details from registry on ngOnInit when userProfile is set', () => {
    component.ngOnInit()
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalledWith('unmapped-1')
  })

  it('should not fetch user details when userProfile is null', () => {
    mockConfigSvc.userProfile = null
    component.ngOnInit()
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).not.toHaveBeenCalled()
  })

  it('should set onListPage in sessionStorage on ngOnInit', () => {
    component.ngOnInit()
    expect(sessionStorage.getItem('onListPage')).toBe('true')
  })

  it('should remove existing academic from sessionStorage on ngOnInit', () => {
    sessionStorage.setItem('academic', JSON.stringify({ old: true }))
    component.ngOnInit()
    expect(sessionStorage.getItem('academic')).toBeNull()
  })

  it('should set academicsArray from registry data on ngOnInit', () => {
    component.ngOnInit()
    expect(component.academicsArray.length).toBe(2)
  })

  it('should set isEditableForSphere from data input when available', () => {
    component.data = { isEditable: true }
    component.ngOnInit()
    expect(component.isEditableForSphere).toBe(true)
  })

  it('should default isEditableForSphere to false when data is undefined', () => {
    component.data = undefined
    component.ngOnInit()
    expect(component.isEditableForSphere).toBe(false)
  })

  it('should not set academicsArray when registry data has no academics', () => {
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of({ profileDetails: {} }))
    component.ngOnInit()
    expect(component.academicsArray).toEqual([])
  })

  it('should not set academicsArray when registry returns null', () => {
    mockUserProfileSvc.getUserdetailsFromRegistry.mockReturnValue(of(null))
    component.ngOnInit()
    expect(component.academicsArray).toEqual([])
  })

  describe('hasValidAcademics getter', () => {
    it('should return true when any academic has nameOfInstitute', () => {
      component.academicsArray = [{ nameOfInstitute: 'AIIMS' }, { nameOfInstitute: '' }]
      expect(component.hasValidAcademics).toBe(true)
    })

    it('should return false when no academic has nameOfInstitute', () => {
      component.academicsArray = [{ nameOfInstitute: '' }, { nameOfInstitute: undefined }]
      expect(component.hasValidAcademics).toBe(false)
    })

    it('should return false for empty academicsArray', () => {
      component.academicsArray = []
      expect(component.hasValidAcademics).toBe(false)
    })
  })

  describe('redirectTo', () => {
    it('should call contentSvc.changeWork with academic object', () => {
      const academic = { nameOfInstitute: 'AIIMS' }
      component.redirectTo(true, academic)
      expect(mockContentSvc.changeWork).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'academic', edit: true, academic }),
      )
    })

    it('should set academic in sessionStorage on redirectTo', () => {
      const academic = { nameOfInstitute: 'PGI' }
      component.redirectTo(false, academic)
      const stored = JSON.parse(sessionStorage.getItem('academic') || '{}')
      expect(stored.type).toBe('academic')
    })

    it('should remove existing onListPage and academic before storing on redirectTo', () => {
      sessionStorage.setItem('onListPage', 'true')
      sessionStorage.setItem('academic', JSON.stringify({ old: true }))
      const academic = { nameOfInstitute: 'PGI' }
      component.redirectTo(true, academic)
      expect(sessionStorage.getItem('onListPage')).toBeNull()
      const stored = JSON.parse(sessionStorage.getItem('academic') || '{}')
      expect(stored.type).toBe('academic')
      expect(stored).not.toHaveProperty('old')
    })
  })
})
