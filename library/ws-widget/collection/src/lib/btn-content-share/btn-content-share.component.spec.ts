import { TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { BtnContentShareComponent } from './btn-content-share.component'

describe('BtnContentShareComponent', () => {
  let component: BtnContentShareComponent
  let mockDialog: any
  let mockConfigSvc: any
  let mockThemeSvc: any

  beforeEach(() => {
    mockDialog = { open: jest.fn() }
    mockConfigSvc = { restrictedFeatures: null, rootOrg: 'RootOrg' }
    mockThemeSvc = { isDark: signal(false) }
    component = TestBed.runInInjectionContext(
      () => new BtnContentShareComponent(mockDialog, mockConfigSvc, mockThemeSvc),
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should update isDark reactively via the effect', () => {
    TestBed.flushEffects()
    expect(component.isDark).toBe(false)
    mockThemeSvc.isDark.set(true)
    TestBed.flushEffects()
    expect(component.isDark).toBe(true)
  })

  describe('ngOnInit', () => {
    it('should set isShareEnabled true when share is not restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['other'])
      component.ngOnInit()
      expect(component.isShareEnabled).toBe(true)
    })

    it('should set isShareEnabled false when share is restricted', () => {
      mockConfigSvc.restrictedFeatures = new Set(['share'])
      component.ngOnInit()
      expect(component.isShareEnabled).toBe(false)
    })

    it('should not touch isShareEnabled when restrictedFeatures is not set', () => {
      mockConfigSvc.restrictedFeatures = null
      component.ngOnInit()
      expect(component.isShareEnabled).toBe(false)
    })

    it('should set showBtn true when rootOrg is not RootOrg', () => {
      mockConfigSvc.rootOrg = 'SomeOrg'
      component.ngOnInit()
      expect(component.showBtn).toBe(true)
    })

    it('should set showBtn false when rootOrg is RootOrg', () => {
      mockConfigSvc.rootOrg = 'RootOrg'
      component.ngOnInit()
      expect(component.showBtn).toBe(false)
    })
  })

  describe('shareContent', () => {
    it('should open the dialog with widgetData when not forPreview', () => {
      component.forPreview = false
      component.widgetData = { identifier: 'c1' } as any
      component.shareContent()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: { content: component.widgetData },
          width: '90vw',
          maxWidth: '480px',
        }),
      )
    })

    it('should not open the dialog when forPreview is true', () => {
      component.forPreview = true
      component.shareContent()
      expect(mockDialog.open).not.toHaveBeenCalled()
    })
  })
})
