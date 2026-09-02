jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class {
    log = jest.fn()
  },
}))

import { LanguageDialogComponent } from './language-dialog.component'

describe('LanguageDialogComponent', () => {
  let component: LanguageDialogComponent
  let mockDialogRef: any
  let mockLogger: any
  let mockDialogData: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockLogger = { log: jest.fn() }
    mockDialogData = { selected: 'en', checkbox: true }
    component = new LanguageDialogComponent(mockDialogRef, mockLogger, mockDialogData)
  })

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('default properties', () => {
    it('should have two languages in preferredLanguageList', () => {
      expect(component.preferredLanguageList).toHaveLength(2)
      expect(component.preferredLanguageList[0].id).toBe('en')
      expect(component.preferredLanguageList[1].id).toBe('hi')
    })

    it('should default languageCheckbox to false', () => {
      expect(component.languageCheckbox).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should set preferredLanguage from selectedData', () => {
      component.ngOnInit()
      expect(component.preferredLanguage).toBe('en')
    })

    it('should set languageCheckbox from selectedData', () => {
      component.ngOnInit()
      expect(component.languageCheckbox).toBe(true)
    })

    it('should handle different initial language', () => {
      mockDialogData.selected = 'hi'
      component = new LanguageDialogComponent(mockDialogRef, mockLogger, mockDialogData)
      component.ngOnInit()
      expect(component.preferredLanguage).toBe('hi')
    })
  })

  describe('chooseLanguage', () => {
    it('should log and close dialog with selected data', () => {
      const data = { id: 'hi', lang: 'हिंदी' }
      component.chooseLanguage(data)
      expect(mockLogger.log).toHaveBeenCalledWith(data)
      expect(mockDialogRef.close).toHaveBeenCalledWith(data)
    })
  })

  describe('multiLanguage', () => {
    it('should log and close dialog with data', () => {
      const data = ['en', 'hi']
      component.multiLanguage(data)
      expect(mockLogger.log).toHaveBeenCalledWith(data)
      expect(mockDialogRef.close).toHaveBeenCalledWith(data)
    })
  })

  describe('onNgModelChange', () => {
    it('should update preferredLanguage', () => {
      component.onNgModelChange('hi')
      expect(component.preferredLanguage).toBe('hi')
    })

    it('should log the event', () => {
      component.onNgModelChange('en')
      expect(mockLogger.log).toHaveBeenCalledWith('en')
    })
  })

  describe('constructor with different selectedData', () => {
    it('handles selectedData with null selected', () => {
      mockDialogData.selected = null
      const c = new LanguageDialogComponent(mockDialogRef, mockLogger, mockDialogData)
      c.ngOnInit()
      expect(c.preferredLanguage).toBeNull()
    })

    it('handles selectedData with false checkbox', () => {
      mockDialogData.checkbox = false
      const c = new LanguageDialogComponent(mockDialogRef, mockLogger, mockDialogData)
      c.ngOnInit()
      expect(c.languageCheckbox).toBe(false)
    })
  })
})
