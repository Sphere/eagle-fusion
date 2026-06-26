jest.mock('../../../../library/ws-widget/utils/src/public-api', () => ({
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
}))

import { BnrcmodalComponent } from './bnrc-modal-component'

describe('BnrcmodalComponent', () => {
  let component: BnrcmodalComponent
  let mockDialogRef: any
  let mockSnackBar: any
  let mockLogger: any

  beforeEach(() => {
    mockDialogRef = { disableClose: false }
    mockSnackBar = { open: jest.fn() }
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() }

    component = new BnrcmodalComponent(
      mockSnackBar,
      mockDialogRef,
      { from: 'bnrc' },
      mockLogger,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('sets dialogRef.disableClose to true in constructor', () => {
    expect(mockDialogRef.disableClose).toBe(true)
  })

  it('isMobile defaults to false', () => {
    expect(component.isMobile).toBe(false)
  })

  it('data.from is accessible', () => {
    expect(component.data.from).toBe('bnrc')
  })

  describe('done', () => {
    let originalLocation: any

    beforeEach(() => {
      originalLocation = window.location.href
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '' },
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: originalLocation },
      })
    })

    it('navigates to ekshamata link when value is "download"', () => {
      component.done('download')
      expect(window.location.href).toBe('https://links-ekshamata.aastrika.org')
    })

    it('navigates to upsmf link when data.from is "Upsmf"', () => {
      component.data = { from: 'Upsmf' }
      component.done('close')
      expect(window.location.href).toBe('https://upsmf.aastrika.org/')
    })

    it('navigates to bnrc link when data.from is not "Upsmf"', () => {
      component.data = { from: 'bnrc' }
      component.done('close')
      expect(window.location.href).toBe('https://bnrc.aastrika.org/')
    })
  })
})
