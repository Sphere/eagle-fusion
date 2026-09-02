import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { RestrictedComponent } from './restricted/restricted.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'

describe('resolver fallback components', () => {
  const SIMPLE: [string, any][] = [
    ['RestrictedComponent', RestrictedComponent],
    ['InvalidPermissionComponent', InvalidPermissionComponent],
    ['InvalidRegistrationComponent', InvalidRegistrationComponent],
  ]

  SIMPLE.forEach(([name, Ctor]) => {
    describe(name, () => {
      it('should create with data display enabled', () => {
        const component = new Ctor()
        expect(component).toBeTruthy()
        expect(component.showData).toBe(true)
      })

      it('should inherit the widget base wiring', () => {
        const component = new Ctor()
        component.updateBaseComponent('card', 'cardContent', 'w1', 'cls')
        expect(component.widgetType).toBe('card')
        expect(component.widgetSubType).toBe('cardContent')
        expect(component.widgetInstanceId).toBe('w1')
      })
    })
  })

  describe('UnresolvedComponent', () => {
    let component: UnresolvedComponent
    const originalHref = window.location.href

    const setUrl = (url: string) => {
      window.history.pushState({}, '', url)
    }

    beforeEach(() => {
      component = new UnresolvedComponent()
    })

    afterEach(() => {
      window.history.pushState({}, '', originalHref)
    })

    it('should create with data display enabled and preview off', () => {
      expect(component).toBeTruthy()
      expect(component.showData).toBe(true)
      expect(component.previewMode).toBe(false)
      expect(component.searchArray).toEqual(['preview', 'channel'])
    })

    it('should enable preview mode on a preview url', () => {
      setUrl('/author/preview/c1')
      component.ngOnInit()
      expect(component.previewMode).toBe(true)
    })

    it('should enable preview mode on a channel url', () => {
      setUrl('/app/channel/c1')
      component.ngOnInit()
      expect(component.previewMode).toBe(true)
    })

    it('should leave preview mode off on any other url', () => {
      setUrl('/app/toc/c1/overview')
      component.ngOnInit()
      expect(component.previewMode).toBe(false)
    })
  })
})
