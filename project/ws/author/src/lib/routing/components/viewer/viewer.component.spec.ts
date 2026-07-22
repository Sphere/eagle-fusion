import { of, Subject } from 'rxjs'

jest.mock('@ws-widget/collection/src/public-api', () => ({
  VIEWER_ROUTE_FROM_MIME: jest.fn().mockReturnValue('pdf'),
}))

import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'
import { ValueService } from '@ws-widget/utils/src/public-api'
import { ActivatedRoute, Router } from '@angular/router'
import { ViewerComponent } from './viewer.component'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let mockValueSvc: Partial<ValueService> & { isXSmall$: Subject<boolean> }
  let mockActivatedRoute: Partial<ActivatedRoute> & { data: Subject<any> }
  let mockRouter: Partial<Router>

  const createComponent = () => new ViewerComponent(
    mockValueSvc as ValueService,
    mockActivatedRoute as ActivatedRoute,
    mockRouter as Router,
  )

  beforeEach(() => {
    jest.clearAllMocks()
    mockValueSvc = { isXSmall$: new Subject<boolean>() }
    mockActivatedRoute = { data: new Subject<any>() }
    mockRouter = { navigateByUrl: jest.fn() }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should subscribe to isXSmall$ and update isXSmall', () => {
      component.ngOnInit()
      mockValueSvc.isXSmall$.next(true)
      expect(component.isXSmall).toBe(true)
    })

    it('should set identifier, mimeTypeRoute and actionType when content data has Draft status', () => {
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { identifier: 'id-1', mimeType: 'application/pdf', status: 'Draft' } })
      expect(component.identifier).toBe('id-1')
      expect(component.mimeTypeRoute).toBe('pdf')
      expect(component.actionType).toBe('Edit Content')
      expect(VIEWER_ROUTE_FROM_MIME).toHaveBeenCalledWith('application/pdf')
    })

    it('should set actionType Edit Content for Live status', () => {
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { identifier: 'id-1', mimeType: 'application/pdf', status: 'Live' } })
      expect(component.actionType).toBe('Edit Content')
    })

    it('should set actionType Take Action for other statuses', () => {
      component.ngOnInit()
      mockActivatedRoute.data.next({ content: { identifier: 'id-1', mimeType: 'application/pdf', status: 'Review' } })
      expect(component.actionType).toBe('Take Action')
    })

    it('should not update identifier when data.content is absent', () => {
      component.ngOnInit()
      mockActivatedRoute.data.next({})
      expect(component.identifier).toBe('')
    })

    it('should call updateIframeUrl on init', () => {
      const spy = jest.spyOn(component, 'updateIframeUrl')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  it('ngOnChanges should call updateIframeUrl', () => {
    const spy = jest.spyOn(component, 'updateIframeUrl')
    component.ngOnChanges()
    expect(spy).toHaveBeenCalled()
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe routerSubscription when present', () => {
      component.ngOnInit()
      const unsubscribeSpy = jest.spyOn(component.routerSubscription, 'unsubscribe')
      component.ngOnDestroy()
      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('should not throw when routerSubscription is not set', () => {
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('ngAfterViewInit', () => {
    it('should build previewDevices with default viewValues when refs are null', () => {
      component.mobile = null
      component.tab = null
      component.desktop = null
      component.ngAfterViewInit()
      expect(component.previewDevices[0].viewValue).toBe('')
      expect(component.previewDevices[1].viewValue).toBe('')
      expect(component.previewDevices[2].viewValue).toBe('Desktop')
      expect(component.selected).toEqual(component.previewDevices[2])
    })

    it('should build previewDevices with nativeElement values when refs are present', () => {
      component.mobile = { nativeElement: { value: 'mobile-val' } } as any
      component.tab = { nativeElement: { value: 'tab-val' } } as any
      component.desktop = { nativeElement: { value: 'desktop-val' } } as any
      component.ngAfterViewInit()
      expect(component.previewDevices[0].viewValue).toBe('mobile-val')
      expect(component.previewDevices[1].viewValue).toBe('tab-val')
      expect(component.previewDevices[2].viewValue).toBe('desktop-val')
    })

    it('should default desktop viewValue to Desktop when nativeElement value is falsy', () => {
      component.desktop = { nativeElement: { value: '' } } as any
      component.ngAfterViewInit()
      expect(component.previewDevices[2].viewValue).toBe('Desktop')
    })
  })

  it('updateIframeUrl should build iframeUrl from mimeTypeRoute and identifier', () => {
    component.mimeTypeRoute = 'pdf'
    component.identifier = 'id-1'
    component.updateIframeUrl()
    expect(component.iframeUrl).toBe('/viewer/pdf/id-1?preview=true')
  })

  it('takeAction should navigate to editor route', () => {
    component.identifier = 'id-1'
    component.takeAction()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/author/editor/id-1')
  })
})
