jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
    warn = jest.fn()
  },
}))

import { CreateAccountDialogComponent } from './create-account-dialog.component'

describe('CreateAccountDialogComponent', () => {
  let component: CreateAccountDialogComponent
  let mockDialogRef: any
  let mockData: any
  let mockDocument: any
  let mockLogger: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = { selected: 'help', userNotExistEkshamta: false }
    mockDocument = { getElementById: jest.fn().mockReturnValue(null) }
    mockLogger = { log: jest.fn(), warn: jest.fn() }

    component = new CreateAccountDialogComponent(
      mockDialogRef,
      mockData,
      mockDocument,
      mockLogger,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default name to empty string', () => {
    expect(component.name).toBe('')
  })

  it('should set name from selectedData on ngOnInit', () => {
    component.ngOnInit()
    expect(component.name).toBe('help')
  })

  it('should set userNotExistEkshamta from selectedData on ngOnInit', () => {
    mockData.userNotExistEkshamta = true
    component.ngOnInit()
    expect(component.userNotExistEkshamta).toBe(true)
  })

  it('should set firstName and lastName when selected is "name"', () => {
    mockData.selected = 'name'
    mockData.details = { firstname: 'Jane', lastname: 'Doe' }
    component.ngOnInit()
    expect(component.firstName).toBe('Jane')
    expect(component.lastName).toBe('Doe')
  })

  it('should not set firstName when selected is not "name"', () => {
    component.ngOnInit()
    expect(component.firstName).toBe('')
    expect(component.lastName).toBe('')
  })

  describe('handleKeyDown', () => {
    it('should call preventDefault on Enter key', () => {
      const mockEvent = { key: 'Enter', preventDefault: jest.fn() }
      component.handleKeyDown(mockEvent as any)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should call preventDefault on Space key', () => {
      const mockEvent = { key: ' ', preventDefault: jest.fn() }
      component.handleKeyDown(mockEvent as any)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should not call preventDefault for other keys', () => {
      const mockEvent = { key: 'a', preventDefault: jest.fn() }
      component.handleKeyDown(mockEvent as any)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('showChat', () => {
    it('should not throw when widget element not found', () => {
      mockDocument.getElementById.mockReturnValue(null)
      expect(() => component.showChat()).not.toThrow()
    })

    it('should call btn.click and dialogRef.close when Open chat button is found', () => {
      jest.useFakeTimers()
      const mockBtn = { getAttribute: jest.fn().mockReturnValue('Open chat'), click: jest.fn() }
      const mockEl = { style: { display: '' }, querySelector: jest.fn().mockReturnValue(mockBtn) }
      mockDocument.getElementById.mockReturnValue(mockEl)
      component.showChat()
      jest.advanceTimersByTime(400)
      expect(mockBtn.click).toHaveBeenCalled()
      expect(mockDialogRef.close).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should warn when no button found inside widget', () => {
      jest.useFakeTimers()
      const mockEl = { style: { display: '' }, querySelector: jest.fn().mockReturnValue(null) }
      mockDocument.getElementById.mockReturnValue(mockEl)
      component.showChat()
      jest.advanceTimersByTime(400)
      expect(mockLogger.warn).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('should not click when button aria-label is not "Open chat"', () => {
      jest.useFakeTimers()
      const mockBtn = { getAttribute: jest.fn().mockReturnValue('Close chat'), click: jest.fn() }
      const mockEl = { style: { display: '' }, querySelector: jest.fn().mockReturnValue(mockBtn) }
      mockDocument.getElementById.mockReturnValue(mockEl)
      component.showChat()
      jest.advanceTimersByTime(400)
      expect(mockBtn.click).not.toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('confirm', () => {
    it('should call dialogRef.close with provided data', () => {
      component.confirm('confirm')
      expect(mockDialogRef.close).toHaveBeenCalledWith('confirm')
    })

    it('should log the data before closing', () => {
      component.confirm('login')
      expect(mockLogger.log).toHaveBeenCalledWith('login')
    })
  })
})
