import { NavigationStart } from '@angular/router'
import { Subject } from 'rxjs'
import { BtnPageBackService } from './btn-page-back.service'

describe('BtnPageBackService', () => {
  let service: BtnPageBackService
  let events$: Subject<any>
  let routerMock: any

  beforeEach(() => {
    events$ = new Subject<any>()
    routerMock = {
      events: events$,
      url: '/current',
    }
    service = new BtnPageBackService(routerMock)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should set widgetUrl via checkUrl', () => {
    service.checkUrl('/widget-url')
    expect(service.widgetUrl).toBe('/widget-url')
  })

  describe('initialize', () => {
    it('should subscribe to router events', () => {
      service.initialize()
      expect((service as any).routerSubscription).toBeTruthy()
    })

    it('should unsubscribe existing subscription on re-initialize', () => {
      service.initialize()
      const firstSub = (service as any).routerSubscription
      const unsubscribeSpy = jest.spyOn(firstSub, 'unsubscribe')
      service.initialize()
      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should ignore non-NavigationStart events', () => {
      service.initialize()
      events$.next({ foo: 'bar' })
      expect(service.previousRouteUrls).toEqual([])
    })

    it('should pop last url when NavigationStart url matches last stored url', () => {
      service.initialize()
      service.previousRouteUrls = ['/a', '/b']
      events$.next(new NavigationStart(1, '/b'))
      expect(service.previousRouteUrls).toEqual(['/a'])
    })

    it('should push current router url when navigating to a new url', () => {
      service.initialize()
      routerMock.url = '/current'
      service.previousRouteUrls = []
      events$.next(new NavigationStart(1, '/new'))
      expect(service.previousRouteUrls).toEqual(['/current'])
    })

    it('should not push a duplicate of the last stored url', () => {
      service.initialize()
      routerMock.url = '/current'
      service.previousRouteUrls = ['/current']
      events$.next(new NavigationStart(1, '/new'))
      expect(service.previousRouteUrls).toEqual(['/current'])
    })

    it('should pop when widgetUrl equals navigation event url', () => {
      service.initialize()
      service.checkUrl('/new')
      routerMock.url = '/current'
      service.previousRouteUrls = []
      events$.next(new NavigationStart(1, '/new'))
      expect(service.previousRouteUrls).toEqual([])
    })
  })

  describe('getLastUrl', () => {
    it('should default to / when no url stored', () => {
      const result = service.getLastUrl()
      expect(result.route).toBe('/')
      expect(service.previousRouteUrls).toContain('/')
    })

    it('should return stored url split into route and queryParams', () => {
      service.previousRouteUrls = ['/foo?a=1&b=2']
      const result = service.getLastUrl()
      expect(result.route).toBe('/foo')
      expect(result.queryParams).toEqual({ a: '1', b: '2' })
    })

    it('should extract fragment when url has #', () => {
      service.previousRouteUrls = ['/foo#section1']
      const result = service.getLastUrl()
      expect(result.route).toBe('/foo')
      expect(result.fragment).toBe('section1')
    })

    it('should encode child path when url includes >', () => {
      service.previousRouteUrls = ['/parent>child path']
      const result = service.getLastUrl()
      expect(result.route).toContain(encodeURIComponent('child path'))
    })

    it('should decode url-encoded urls', () => {
      service.previousRouteUrls = [encodeURIComponent('/foo?a=1')]
      const result = service.getLastUrl()
      expect(result.route).toBe('/foo')
    })

    it('should return undefined queryParams when no query string', () => {
      service.previousRouteUrls = ['/foo']
      const result = service.getLastUrl()
      expect(result.queryParams).toBeUndefined()
    })

    it('should return undefined queryParams when a param has no =', () => {
      service.previousRouteUrls = ['/foo?a']
      const result = service.getLastUrl()
      expect(result.queryParams).toBeUndefined()
    })

    it('should respect pageNumber argument', () => {
      service.previousRouteUrls = ['/first', '/second']
      const result = service.getLastUrl(2)
      expect(result.route).toBe('/first')
    })
  })
})
