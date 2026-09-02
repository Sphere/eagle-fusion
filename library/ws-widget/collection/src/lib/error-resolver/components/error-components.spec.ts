import { ReplaySubject, Subject } from 'rxjs'
import { ErrorAccessForbiddenComponent } from './error-access-forbidden/error-access-forbidden.component'
import { ErrorContentUnavailableComponent } from './error-content-unavailable/error-content-unavailable.component'
import { ErrorFeatureDisabledComponent } from './error-feature-disabled/error-feature-disabled.component'
import { ErrorFeatureUnavailableComponent } from './error-feature-unavailable/error-feature-unavailable.component'
import { ErrorInternalServerComponent } from './error-internal-server/error-internal-server.component'
import { ErrorNotFoundComponent } from './error-not-found/error-not-found.component'
import { ErrorServiceUnavailableComponent } from './error-service-unavailable/error-service-unavailable.component'
import { ErrorSomethingWrongComponent } from './error-something-wrong/error-something-wrong.component'

/**
 * The eight error-resolver components share one shape: read errorData from the route unless
 * it was supplied as an @Input, and track dark mode off prefChangeNotifier. They differ only
 * in whether the preference subscription sits inside the "no errorData" guard.
 */
const COMPONENTS: [string, any, { prefSubIsGuarded: boolean }][] = [
  ['ErrorAccessForbiddenComponent', ErrorAccessForbiddenComponent, { prefSubIsGuarded: true }],
  ['ErrorContentUnavailableComponent', ErrorContentUnavailableComponent, { prefSubIsGuarded: false }],
  ['ErrorFeatureDisabledComponent', ErrorFeatureDisabledComponent, { prefSubIsGuarded: false }],
  ['ErrorFeatureUnavailableComponent', ErrorFeatureUnavailableComponent, { prefSubIsGuarded: false }],
  ['ErrorInternalServerComponent', ErrorInternalServerComponent, { prefSubIsGuarded: false }],
  ['ErrorNotFoundComponent', ErrorNotFoundComponent, { prefSubIsGuarded: false }],
  ['ErrorServiceUnavailableComponent', ErrorServiceUnavailableComponent, { prefSubIsGuarded: false }],
  ['ErrorSomethingWrongComponent', ErrorSomethingWrongComponent, { prefSubIsGuarded: false }],
]

describe('error-resolver components', () => {
  COMPONENTS.forEach(([name, Ctor, { prefSubIsGuarded }]) => {
    describe(name, () => {
      let component: any
      let routeData: Subject<any>
      let configSvc: any

      beforeEach(() => {
        jest.useFakeTimers()
        routeData = new Subject<any>()
        configSvc = {
          isDarkMode: false,
          prefChangeNotifier: new ReplaySubject<any>(1),
        }
        component = new Ctor({ data: routeData }, configSvc)
      })

      afterEach(() => {
        jest.useRealTimers()
      })

      it('should create with the config service dark-mode value', () => {
        expect(component).toBeTruthy()
        expect(component.errorData).toBeNull()
        expect(component.isDarkMode).toBe(false)
      })

      it('should read errorData from the resolved route data', () => {
        component.ngOnInit()
        routeData.next({ pageData: { data: { title: 'Oops' } } })
        expect(component.errorData).toEqual({ title: 'Oops' })
      })

      it('should null out errorData when the route resolves nothing', () => {
        component.ngOnInit()
        routeData.next({ pageData: { data: null } })
        expect(component.errorData).toBeNull()
      })

      it('should not subscribe to the route when errorData was supplied as an input', () => {
        component.errorData = { title: 'From input' }
        component.ngOnInit()
        routeData.next({ pageData: { data: { title: 'From route' } } })
        expect(component.errorData).toEqual({ title: 'From input' })
      })

      it('should track dark mode changes after the debounce', () => {
        component.ngOnInit()
        configSvc.isDarkMode = true
        configSvc.prefChangeNotifier.next({ isDarkMode: true })
        jest.advanceTimersByTime(500)
        expect(component.isDarkMode).toBe(true)
      })

      it('should not react before the debounce elapses', () => {
        component.ngOnInit()
        configSvc.isDarkMode = true
        configSvc.prefChangeNotifier.next({ isDarkMode: true })
        jest.advanceTimersByTime(499)
        expect(component.isDarkMode).toBe(false)
      })

      it(
        prefSubIsGuarded
          ? 'should skip the preference subscription when errorData came from an input'
          : 'should still track dark mode when errorData came from an input',
        () => {
          component.errorData = { title: 'From input' }
          component.ngOnInit()
          configSvc.isDarkMode = true
          configSvc.prefChangeNotifier.next({ isDarkMode: true })
          jest.advanceTimersByTime(500)
          expect(component.isDarkMode).toBe(prefSubIsGuarded ? false : true)
        },
      )

      it('should release both subscriptions on destroy', () => {
        component.ngOnInit()
        component.ngOnDestroy()

        configSvc.isDarkMode = true
        configSvc.prefChangeNotifier.next({ isDarkMode: true })
        jest.advanceTimersByTime(500)
        expect(component.isDarkMode).toBe(false)

        routeData.next({ pageData: { data: { title: 'Late' } } })
        expect(component.errorData).toBeNull()
      })

      it('should be safe to destroy before init', () => {
        expect(() => component.ngOnDestroy()).not.toThrow()
      })
    })
  })
})
