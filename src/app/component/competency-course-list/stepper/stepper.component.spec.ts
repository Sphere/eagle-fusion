import { StepperComponent } from './stepper.component'

describe('StepperComponent', () => {
  let comp: StepperComponent

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    comp = new StepperComponent()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create with empty defaults', () => {
    expect(comp).toBeTruthy()
    expect(comp.levels).toEqual([])
    expect(comp.completedLevels).toEqual([])
    expect(comp.failedLevels).toEqual([])
  })

  it('ngOnInit logs the received stepper inputs', () => {
    comp.levels = [1, 2, 3]
    comp.completedLevels = [1]
    comp.failedLevels = [2]
    comp.currentLevel = 2
    comp.ngOnInit()
    // eslint-disable-next-line no-console
    expect(console.log).toHaveBeenCalledWith('stepper data', [1, 2, 3], [1], [2], 2)
  })
})
