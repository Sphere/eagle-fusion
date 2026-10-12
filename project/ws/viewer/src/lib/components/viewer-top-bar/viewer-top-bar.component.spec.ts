jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  SafeResourceUrlService: class {},
  ValueService: class {},
}))

import { of, Subject, BehaviorSubject } from 'rxjs'
import { ViewerTopBarComponent } from './viewer-top-bar.component'

describe('ViewerTopBarComponent', () => {
  let component: ViewerTopBarComponent
  let mockActivatedRoute: any
  let mockSafeResourceUrlSvc: any
  let mockConfigSvc: any
  let mockViewerDataSvc: any
  let mockPlayerStateSvc: any
  let mockValueSvc: any
  let mockContentSvc: any
  let mockViewerSvc: any

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: { queryParams: {} },
      queryParamMap: new Subject<any>(),
    }
    mockSafeResourceUrlSvc = { trust: jest.fn().mockReturnValue('trusted-url') }
    mockConfigSvc = { pageNavBar: {}, instanceConfig: { logos: { appBottomNav: 'icon.png' } } }
    mockViewerDataSvc = {
      resourceId: 'res-1',
      resource: { name: 'Resource 1' },
      changedSubject: new Subject<any>(),
    }
    mockPlayerStateSvc = { playerState: new Subject<any>() }
    mockValueSvc = { isXSmall$: new BehaviorSubject<boolean>(false) }
    mockContentSvc = { fetchContent: jest.fn().mockReturnValue(of({ result: { content: { identifier: 'course-1' } } })) }
    mockViewerSvc = { castResource: new Subject<any>() }

    component = new ViewerTopBarComponent(
      mockActivatedRoute,
      mockSafeResourceUrlSvc,
      mockConfigSvc,
      mockViewerDataSvc,
      mockPlayerStateSvc,
      mockValueSvc,
      mockContentSvc,
      mockViewerSvc,
    )
  })

  it('should create and pick up the initial isXSmall value', () => {
    expect(component).toBeTruthy()
    expect(component.isSmall).toBe(false)
  })

  it('tracks isSmall as isXSmall$ emits', () => {
    component.ngOnInit()
    mockValueSvc.isXSmall$.next(true)
    expect(component.isSmall).toBe(true)
  })

  describe('ngOnChanges', () => {
    it('assigns obj from screenContent when not null', () => {
      component.screenContent = { identifier: 'r1' } as any
      component.ngOnChanges()
      expect(component.obj).toEqual({ identifier: 'r1' })
    })

    it('leaves obj untouched when screenContent is null', () => {
      component.obj = null
      component.screenContent = null
      component.ngOnChanges()
      expect(component.obj).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    it('sets isAuthor true when the URL includes /author/', () => {
      const original = window.location.href
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/author/xyz' },
        writable: true,
      })
      component.ngOnInit()
      expect(component.isAuthor).toBe(true)
      Object.defineProperty(window, 'location', { value: { href: original }, writable: true })
    })

    it('does nothing collection-related when collectionId/collectionType are absent', () => {
      mockActivatedRoute.snapshot.queryParams = {}
      component.ngOnInit()
      expect(mockContentSvc.fetchContent).not.toHaveBeenCalled()
    })

    it('fetches collection content and wires up subscriptions when collectionId+collectionType are present', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'course-1', collectionType: 'Course' }
      component.ngOnInit()
      expect(mockContentSvc.fetchContent).toHaveBeenCalledWith('course-1')
      expect(component.collection).toEqual({ identifier: 'course-1' })
      expect(component.appIcon).toBe('trusted-url')
    })

    it('updates prevResourceUrl/nextResourceUrl from playerState emissions', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'course-1', collectionType: 'Course' }
      component.ngOnInit()
      mockPlayerStateSvc.playerState.next({ prevResource: '/viewer/pdf/p1', nextResource: '/viewer/pdf/n1' })
      expect(component.prevResourceUrl).toBe('/viewer/pdf/p1')
      expect(component.nextResourceUrl).toBe('/viewer/pdf/n1')
    })

    it('updates resourceId/resourceName when changedSubject emits', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'course-1', collectionType: 'Course' }
      component.ngOnInit()
      mockViewerDataSvc.resourceId = 'res-2'
      mockViewerDataSvc.resource = { name: 'Resource 2' }
      mockViewerDataSvc.changedSubject.next(undefined)
      expect(component.resourceId).toBe('res-2')
      expect(component.resourceName).toBe('Resource 2')
    })

    it('swallows errors thrown while wiring up the collection fetch', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'course-1', collectionType: 'Course' }
      mockContentSvc.fetchContent.mockImplementation(() => { throw new Error('boom') })
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('fullScreenState', () => {
    it('sets isInFullScreen and emits fsState', () => {
      const spy = jest.spyOn(component.fsState, 'emit')
      component.fullScreenState(true)
      expect(component.isInFullScreen).toBe(true)
      expect(spy).toHaveBeenCalledWith(true)
    })
  })

  describe('toggleSideBar', () => {
    it('emits the toggle output', () => {
      const spy = jest.spyOn(component.toggle, 'emit')
      component.toggleSideBar()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('back', () => {
    it('calls window.history.back when not embedded in an iframe', () => {
      const spy = jest.spyOn(window.history, 'back').mockImplementation(() => { })
      component.back()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes all active subscriptions without throwing', () => {
      mockActivatedRoute.snapshot.queryParams = { collectionId: 'course-1', collectionType: 'Course' }
      component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('is safe to call when no subscriptions were established', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
