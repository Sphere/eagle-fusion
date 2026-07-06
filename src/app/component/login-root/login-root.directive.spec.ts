import { LoginRootDirective } from './login-root.directive'

describe('LoginRootDirective', () => {
  let directive: LoginRootDirective
  let mockVCR: any

  beforeEach(() => {
    mockVCR = { element: { nativeElement: document.createElement('div') } }
    directive = new LoginRootDirective(mockVCR)
  })

  it('should create', () => {
    expect(directive).toBeTruthy()
  })

  it('exposes viewContainerRef publicly', () => {
    expect(directive.viewContainerRef).toBe(mockVCR)
  })
})
