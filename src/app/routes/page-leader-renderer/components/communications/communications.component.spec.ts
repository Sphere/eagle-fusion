import { CommunicationsComponent } from './communications.component'

describe('CommunicationsComponent', () => {
  let component: CommunicationsComponent

  beforeEach(() => {
    component = new CommunicationsComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default widgetSearchRequest to null', () => {
    expect(component.widgetSearchRequest).toBeNull()
  })

  it('should default errorMessageCode to empty string', () => {
    expect(component.errorMessageCode).toBe('')
  })

  it('should set errorMessageCode to NO_DATA for "none" event', () => {
    component.handleNoContent('none')
    expect(component.errorMessageCode).toBe('NO_DATA')
  })

  it('should set errorMessageCode to API_FAILURE for "error" event', () => {
    component.handleNoContent('error')
    expect(component.errorMessageCode).toBe('API_FAILURE')
  })

  it('should clear errorMessageCode for other events', () => {
    component.errorMessageCode = 'NO_DATA'
    component.handleNoContent('some-other-event')
    expect(component.errorMessageCode).toBe('')
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
