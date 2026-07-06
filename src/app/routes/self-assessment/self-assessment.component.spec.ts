import { SelfAssessmentComponent } from './self-assessment.component'

describe('SelfAssessmentComponent', () => {
  let component: SelfAssessmentComponent

  beforeEach(() => {
    component = new SelfAssessmentComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should complete ngOnInit without error', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })
})
