jest.mock('@ws-widget/utils/src/public-api', () => ({
  ValueService: class {
    isXSmall$ = { subscribe: jest.fn() }
  },
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service', () => ({
  AppTocService: class {
    showComponent$ = { pipe: jest.fn() }
  },
}))

import { Subject } from 'rxjs'
import { PublicLicenseComponent } from './public-license.component'

describe('PublicLicenseComponent', () => {
  let component: PublicLicenseComponent
  let mockValueSvc: any
  let mockTocSvc: any
  let showComponentSubject: Subject<any>

  beforeEach(() => {
    showComponentSubject = new Subject()
    mockValueSvc = {
      isXSmall$: { subscribe: jest.fn((cb: any) => cb(false)) },
    }
    mockTocSvc = {
      showComponent$: showComponentSubject.asObservable(),
    }
    component = new PublicLicenseComponent(mockValueSvc, mockTocSvc)
  })

  afterEach(() => {
    jest.clearAllMocks()
    component.unsubscribe.next()
    component.unsubscribe.complete()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default isXSmall to false', () => {
    expect(component.isXSmall).toBe(false)
  })

  it('should default loadLicense to true', () => {
    expect(component.loadLicense).toBe(true)
  })

  it('should set isXSmall from valueSvc subscription in ngOnInit', () => {
    mockValueSvc.isXSmall$.subscribe = jest.fn((cb: any) => cb(true))
    component = new PublicLicenseComponent(mockValueSvc, mockTocSvc)
    component.ngOnInit()
    expect(component.isXSmall).toBe(true)
  })

  it('should set loadLicense false when showComponent emits { showComponent: false }', () => {
    component.ngOnInit()
    showComponentSubject.next({ showComponent: false })
    expect(component.loadLicense).toBe(false)
  })

  it('should set loadLicense true when showComponent emits truthy item', () => {
    component.ngOnInit()
    showComponentSubject.next({ showComponent: true })
    expect(component.loadLicense).toBe(true)
  })

  it('should set loadLicense true when showComponent emits null', () => {
    component.ngOnInit()
    showComponentSubject.next(null)
    expect(component.loadLicense).toBe(true)
  })
})
