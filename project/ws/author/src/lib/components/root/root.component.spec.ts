import { Subject } from 'rxjs'
import { SafeResourceUrlService, ConfigurationsService } from '@ws-widget/utils'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthRootComponent } from './root.component'

// ngOnInit wraps its body in a fire-and-forget IIFE, so it no longer returns a
// promise. Call it, then flush microtask ticks for the internal awaits to settle.
const runNgOnInit = async (component: AuthRootComponent) => {
  component.ngOnInit()
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
  }
}

describe('AuthRootComponent', () => {
  let component: AuthRootComponent
  let mockSafeResourceUrlSvc: Partial<SafeResourceUrlService>
  let mockConfigSvc: Partial<ConfigurationsService>
  let mockLoader: Partial<LoaderService> & { changeLoad: Subject<boolean> }
  let mockChangeDetector: any
  let mockSnackBar: Partial<MatSnackBar>

  const createComponent = () => new AuthRootComponent(
    mockSafeResourceUrlSvc as SafeResourceUrlService,
    mockConfigSvc as ConfigurationsService,
    mockLoader as LoaderService,
    mockChangeDetector,
    mockSnackBar as MatSnackBar,
  )

  beforeEach(() => {
    localStorage.clear()
    mockSafeResourceUrlSvc = { trust: jest.fn().mockReturnValue('trusted-icon') }
    mockConfigSvc = { instanceConfig: { logos: { app: 'app-icon.svg' } } as any }
    mockLoader = { changeLoad: new Subject<boolean>() }
    mockChangeDetector = { detectChanges: jest.fn(), detach: jest.fn() }
    mockSnackBar = { openFromComponent: jest.fn() }
  })

  it('should create', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  it('should not navigate when orgValue is not nhsrc', () => {
    localStorage.setItem('orgValue', 'other')
    component = createComponent()
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should navigate to /organisations/home when orgValue is nhsrc', async () => {
    localStorage.setItem('orgValue', 'nhsrc')
    component = createComponent()
    component.router = { navigateByUrl: jest.fn() }
    await runNgOnInit(component)
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/organisations/home')
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      component = createComponent()
    })

    it('should show width message when window is narrow', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true })
      await runNgOnInit(component)
      expect(component.isWidthMessageShown).toBe(true)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
    })

    it('should not show width message when window is wide', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      await runNgOnInit(component)
      expect(component.isWidthMessageShown).toBe(false)
      expect(mockSnackBar.openFromComponent).not.toHaveBeenCalled()
    })

    it('should subscribe to loader changeLoad and update isLoading', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      await runNgOnInit(component)
      mockLoader.changeLoad.next(true)
      expect(component.isLoading).toBe(true)
      expect(mockChangeDetector.detectChanges).toHaveBeenCalled()
    })

    it('should set appIcon when instanceConfig is present', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      await runNgOnInit(component)
      expect(mockSafeResourceUrlSvc.trust).toHaveBeenCalledWith('app-icon.svg')
      expect(component.appIcon).toBe('trusted-icon')
    })

    it('should not set appIcon when instanceConfig is falsy', async () => {
      mockConfigSvc.instanceConfig = undefined as any
      component = createComponent()
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      await runNgOnInit(component)
      expect(mockSafeResourceUrlSvc.trust).not.toHaveBeenCalled()
      expect(component.appIcon).toBeNull()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe loaderSubscription and detach changeDetector', async () => {
      component = createComponent()
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })
      await runNgOnInit(component)
      const unsubscribeSpy = jest.spyOn(component.loaderSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubscribeSpy).toHaveBeenCalled()
      expect(mockChangeDetector.detach).toHaveBeenCalled()
    })

    it('should only detach when loaderSubscription is not set', () => {
      component = createComponent()
      component.ngOnDestroy()
      expect(mockChangeDetector.detach).toHaveBeenCalled()
    })
  })

  describe('onResize', () => {
    beforeEach(() => {
      component = createComponent()
    })

    it('should show width message when resized narrow and not already shown', () => {
      component.onResize({ target: { innerWidth: 1000 } })
      expect(component.isWidthMessageShown).toBe(true)
      expect(mockSnackBar.openFromComponent).toHaveBeenCalled()
    })

    it('should not show width message again if already shown', () => {
      component.isWidthMessageShown = true
      component.onResize({ target: { innerWidth: 1000 } })
      expect(mockSnackBar.openFromComponent).not.toHaveBeenCalled()
    })

    it('should not show width message when resized wide', () => {
      component.onResize({ target: { innerWidth: 1400 } })
      expect(component.isWidthMessageShown).toBe(false)
      expect(mockSnackBar.openFromComponent).not.toHaveBeenCalled()
    })
  })
})
