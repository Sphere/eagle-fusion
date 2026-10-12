import { of } from 'rxjs'

jest.mock('../../../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  TelemetryService: class MockTelemetryService { },
}))

jest.mock('./app-toc-home.service', () => ({
  AppTocHomeService: class MockAppTocHomeService {},
}))

import { AppTocHomeComponent } from './app-toc-home.component'

describe('AppTocHomeComponent', () => {
  let component: AppTocHomeComponent
  let httpMock: any
  let routerMock: any
  let appTocHomeSvcMock: any
  let telemetrySvcMock: any
  let viewContainerRefMock: any

  beforeEach(() => {
    httpMock = { get: jest.fn() }
    routerMock = { url: '/app/toc/course123/overview' }
    appTocHomeSvcMock = { getComponent: jest.fn().mockReturnValue(class Foo { }) }
    telemetrySvcMock = { impression: jest.fn() }
    viewContainerRefMock = { clear: jest.fn(), createComponent: jest.fn() }

    component = new AppTocHomeComponent(httpMock, routerMock, appTocHomeSvcMock, telemetrySvcMock)
    component.wsAppAppTocHome = { viewContainerRef: viewContainerRefMock } as any
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load component into view container on loadComponent', () => {
    component.loadComponent()
    expect(viewContainerRefMock.clear).toHaveBeenCalled()
    expect(viewContainerRefMock.createComponent).toHaveBeenCalled()
    expect(appTocHomeSvcMock.getComponent).toHaveBeenCalled()
  })

  it('should load component directly for non-lex course ids on ngOnInit', () => {
    component.ngOnInit()
    expect(httpMock.get).not.toHaveBeenCalled()
    expect(viewContainerRefMock.createComponent).toHaveBeenCalled()
  })

  it('should redirect lex courses using mapping lookup', () => {
    routerMock.url = '/app/toc/lex_123/overview'
    httpMock.get.mockReturnValue(of([{ EagleID: 'lex_123', SunbirdID: 'sunbird1' }]))
    const originalLocation = window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' } as any
    component.ngOnInit()
    expect(httpMock.get).toHaveBeenCalledWith(component.mappingUrl)
    expect(telemetrySvcMock.impression).toHaveBeenCalled()
    expect(window.location.href).toBe('/app/toc/sunbird1/overview')
    window.location = originalLocation
  })
})
