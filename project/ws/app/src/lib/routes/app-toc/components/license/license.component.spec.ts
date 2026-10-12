import { BehaviorSubject } from 'rxjs'
import { LicenseComponent } from './license.component'

describe('LicenseComponent', () => {
  let component: LicenseComponent
  let valueSvcMock: any
  let tocSvcMock: any
  let isXSmallSubject: BehaviorSubject<boolean>
  let showComponentSubject: BehaviorSubject<any>

  beforeEach(() => {
    isXSmallSubject = new BehaviorSubject<boolean>(false)
    showComponentSubject = new BehaviorSubject<any>(undefined)
    valueSvcMock = { isXSmall$: isXSmallSubject.asObservable() }
    tocSvcMock = { showComponent$: showComponentSubject.asObservable() }
    component = new LicenseComponent(valueSvcMock, tocSvcMock)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not update isXSmall/loadLicense before ngOnInit is called', () => {
    isXSmallSubject.next(true)
    showComponentSubject.next({ showComponent: false })
    expect(component.isXSmall).toBe(false)
    expect(component.loadLicense).toBe(true)
  })

  it('should subscribe to isXSmall$ in ngOnInit and reflect emitted values', () => {
    component.ngOnInit()
    expect(component.isXSmall).toBe(false)
    isXSmallSubject.next(true)
    expect(component.isXSmall).toBe(true)
  })

  it('should subscribe to showComponent$ in ngOnInit and set loadLicense false when showComponent is false', () => {
    component.ngOnInit()
    showComponentSubject.next({ showComponent: false })
    expect(component.loadLicense).toBe(false)
  })

  it('should set loadLicense true when showComponent item is falsy or showComponent true', () => {
    component.ngOnInit()
    showComponentSubject.next(undefined)
    expect(component.loadLicense).toBe(true)
    showComponentSubject.next({ showComponent: true })
    expect(component.loadLicense).toBe(true)
  })
})
