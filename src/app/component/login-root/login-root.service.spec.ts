jest.mock('../login/login.component', () => ({
  LoginComponent: class {},
}))

import { LoginRootService } from './login-root.service'
import { LoginComponent } from '../login/login.component'

describe('LoginRootService', () => {
  let service: LoginRootService

  beforeEach(() => {
    service = new LoginRootService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('getComponent returns LoginComponent', () => {
    expect(service.getComponent()).toBe(LoginComponent)
  })
})
