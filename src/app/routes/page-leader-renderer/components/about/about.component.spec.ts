import { AboutComponent } from './about.component'

describe('AboutComponent', () => {
  let component: AboutComponent

  beforeEach(() => {
    component = new AboutComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default about to empty string', () => {
    expect(component.about).toBe('')
  })

  it('should default profile to null', () => {
    expect(component.profile).toBeNull()
  })

  it('should accept about input', () => {
    component.about = 'A brief description'
    expect(component.about).toBe('A brief description')
  })

  it('should accept profile input', () => {
    const mockProfile: any = { name: 'Dr. Smith', designation: 'Director' }
    component.profile = mockProfile
    expect(component.profile).toEqual(mockProfile)
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
