jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  LogoutComponent: class {},
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
  LoggerService: class {
    log = jest.fn()
  },
}))

jest.mock('@ws-widget/utils', () => ({
  LogoutComponent: class {},
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
  LoggerService: class {
    log = jest.fn()
  },
}))

jest.mock('@ws-widget/collection', () => ({
  WidgetContentService: class {
    backMessage = { subscribe: jest.fn((cb: any) => cb(null)) }
    workMessage = { subscribe: jest.fn() }
    changeWork = jest.fn()
  },
}))

import { MobileProfileNavComponent } from './mobile-profile-nav.component'

describe('MobileProfileNavComponent', () => {
  let component: MobileProfileNavComponent
  let mockDialog: any
  let mockRouter: any
  let mockContentSvc: any
  let mockLogger: any
  let mockValueSvc: any

  beforeEach(() => {
    mockDialog = { open: jest.fn() }
    mockRouter = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    mockContentSvc = {
      backMessage: { subscribe: jest.fn((cb: any) => cb(null)) },
      workMessage: { subscribe: jest.fn() },
      changeWork: jest.fn(),
    }
    mockLogger = { log: jest.fn() }
    mockValueSvc = { isXSmall$: {} }

    component = new MobileProfileNavComponent(
      mockDialog,
      mockRouter,
      mockContentSvc,
      mockLogger,
      mockValueSvc,
    )
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should assign isXSmall$ from valueSvc on construction', () => {
    expect(component.isXSmall$).toBe(mockValueSvc.isXSmall$)
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should open dialog on logout()', () => {
    component.logout()
    expect(mockDialog.open).toHaveBeenCalled()
  })

  it('should store backMessage url in sessionStorage', () => {
    mockContentSvc.backMessage.subscribe = jest.fn((cb: any) => cb('/page/home'))
    component = new MobileProfileNavComponent(mockDialog, mockRouter, mockContentSvc, mockLogger, mockValueSvc)
    expect(sessionStorage.getItem('clickedUrl')).toBe('/page/home')
  })

  describe('backScreen', () => {
    it('should call changeWork with type=back when currentWindow is set', () => {
      sessionStorage.setItem('currentWindow', 'personal')
      component.backScreen()
      expect(mockContentSvc.changeWork).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'back', back: true }),
      )
    })

    it('should call changeWork with type=work when work in sessionStorage', () => {
      sessionStorage.setItem('work', 'someWork')
      component.backScreen()
      expect(mockContentSvc.changeWork).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'work', back: true }),
      )
    })

    it('should call changeWork with type=academic when academic is set and no onListPage', () => {
      sessionStorage.setItem('academic', '{"type":"academic"}')
      component.backScreen()
      expect(mockContentSvc.changeWork).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'academic', back: true }),
      )
    })

    it('should navigate to /app/profile-view when trigerrNavigation is true', () => {
      component.trigerrNavigation = true
      component.backScreen()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/profile-view'])
    })

    it('covers workMessage subscribe callback with data', () => {
      mockContentSvc.workMessage = { subscribe: jest.fn((cb: any) => cb(undefined)) }
      component['contentSvc'] = mockContentSvc
      component.backScreen()
      expect(mockLogger.log).toHaveBeenCalled()
    })
  })
})
