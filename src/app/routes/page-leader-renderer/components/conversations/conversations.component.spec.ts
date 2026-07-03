import { ConversationsComponent } from './conversations.component'

describe('ConversationsComponent', () => {
  let component: ConversationsComponent

  beforeEach(() => {
    component = new ConversationsComponent()
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

  it('should set errorMessageCode to NO_DATA for "none"', () => {
    component.handleNoContent('none')
    expect(component.errorMessageCode).toBe('NO_DATA')
  })

  it('should set errorMessageCode to API_FAILURE for "error"', () => {
    component.handleNoContent('error')
    expect(component.errorMessageCode).toBe('API_FAILURE')
  })

  it('should clear errorMessageCode for other events', () => {
    component.errorMessageCode = 'API_FAILURE'
    component.handleNoContent('loaded')
    expect(component.errorMessageCode).toBe('')
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
