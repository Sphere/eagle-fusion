import { LeadershipDashboardInfoComponent } from './leadership-dashboard-info.component'

describe('LeadershipDashboardInfoComponent', () => {
  let component: LeadershipDashboardInfoComponent
  let mockDialogRef: any
  let mockData: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn() }
    mockData = { title: 'Leaderboard Info', description: 'Top performers' }
    component = new LeadershipDashboardInfoComponent(mockData, mockDialogRef)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should expose injected data', () => {
    expect(component.data).toEqual(mockData)
  })

  it('should close dialog on close()', () => {
    component.close()
    expect(mockDialogRef.close).toHaveBeenCalled()
  })
})
