import { CompleteProfileComponent } from './complete-profile.component'

describe('CompleteProfileComponent', () => {
  let component: CompleteProfileComponent

  beforeEach(() => {
    component = new CompleteProfileComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
