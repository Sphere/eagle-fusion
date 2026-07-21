import { AssesmentQuestionResultComponent } from './assesment-question-result.component'

describe('AssesmentQuestionResultComponent', () => {
  let component: AssesmentQuestionResultComponent

  beforeEach(() => {
    component = new AssesmentQuestionResultComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('emitResult should emit true on resultEvent', () => {
    const spy = jest.fn()
    component.resultEvent.subscribe(spy)
    component.emitResult()
    expect(spy).toHaveBeenCalledWith('true')
  })
})
