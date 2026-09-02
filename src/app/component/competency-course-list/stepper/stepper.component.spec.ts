import { LoggerService } from '@ws-widget/utils'
import { StepperComponent } from './stepper.component'

describe('StepperComponent', () => {
  let comp: StepperComponent
  let mockLogger: any

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() }
    comp = new StepperComponent(mockLogger)
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
    expect(mockLogger.log).toHaveBeenCalledWith('stepper data', [1, 2, 3], [1], [2], 2)
  })
})
