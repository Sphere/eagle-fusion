import { CompleteCoursesModalComponent } from './complete-courses-modal.component'

describe('CompleteCoursesModalComponent', () => {
  let component: CompleteCoursesModalComponent
  let mockDialogRef: any
  let mockData: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = {
      navigateNextCourse: true,
      competencyLevel: '2',
      competencyId: 'comp-1',
      nextLevelId: 'level-3',
    }
    component = new CompleteCoursesModalComponent(mockDialogRef, mockData)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set navigateNextCourse and nextLevel from data on init', () => {
    component.ngOnInit()
    expect(component.navigateNextCourse).toBe(true)
    expect(component.nextLevel).toBe(3)
  })

  it('should close the dialog with CLOSE event on goToAshaHome', () => {
    component.goToAshaHome()
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'CLOSE' })
  })

  it('should close the dialog with STARTNEXTCOURSE event and competency data on startNextCourse', () => {
    component.startNextCourse()
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      event: 'STARTNEXTCOURSE',
      competencyId: 'comp-1',
      competencyLevel: '2',
      nextLevelId: 'level-3',
    })
  })
})
