import { AssesmentOverviewComponent } from './assesment-overview.component'

describe('AssesmentOverviewComponent', () => {
  let component: AssesmentOverviewComponent
  let mockDialogRef: any
  let mockRoute: any
  let mockEvents: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockRoute = { snapshot: { queryParams: {} } }
    mockEvents = { raiseInteractTelemetry: jest.fn() }
    component = new AssesmentOverviewComponent(mockDialogRef, {}, mockRoute, mockEvents)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should set isCompetency and isAshaHome from route params', () => {
    mockRoute.snapshot.queryParams = { competency: true, isAsha: true }
    component.ngOnInit()
    expect(component.isCompetency).toBe(true)
    expect(component.isAshaHome).toBe(true)
  })

  it('closePopup should close with close-overview when not competency', () => {
    component.isCompetency = false
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'close-overview' })
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
  })

  it('closePopup should close with asha info when competency and asha', () => {
    component.isCompetency = true
    component.isAshaHome = true
    mockRoute.snapshot.queryParams = { isAsha: true }
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'close-overview', asha: true })
  })

  it('closePopup should close with competency info when competency and not asha', () => {
    component.isCompetency = true
    component.isAshaHome = false
    mockRoute.snapshot.queryParams = { competency: true }
    component.closePopup()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'close-overview', competency: true })
  })

  it('generateInteractTelemetry should raise telemetry with expected args', () => {
    component.generateInteractTelemetry('close-assessment-popup')
    expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
      'TOUCH',
      'close-assessment-popup',
      'assessment-overview',
      expect.any(Map)
    )
  })
})
