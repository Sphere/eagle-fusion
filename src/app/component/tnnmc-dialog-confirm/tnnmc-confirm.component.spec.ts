import { TnnmcConfirmComponent } from './tnnmc-confirm.component'

const mockData = { title: 'Test Title', body: 'Test Body' }

const mockDialogRef = {
  close: jest.fn(),
}

const mockRouter = {
  navigate: jest.fn(),
}

describe('TnnmcConfirmComponent', () => {
  let component: TnnmcConfirmComponent

  beforeEach(() => {
    jest.clearAllMocks()
    component = new TnnmcConfirmComponent(mockData, mockDialogRef as any, mockRouter as any)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have data injected correctly', () => {
    expect(component.data).toBe(mockData)
  })

  it('should have the correct title from injected data', () => {
    expect(component.data.title).toBe('Test Title')
  })

  it('should have the correct body from injected data', () => {
    expect(component.data.body).toBe('Test Body')
  })

  it('should navigate to public/login when confirmed() is called', () => {
    component.confirmed()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['public/login'])
  })

  it('should close the dialog with true when confirmed() is called', () => {
    component.confirmed()
    expect(mockDialogRef.close).toHaveBeenCalledWith(true)
  })

  it('should call navigate before closing the dialog in confirmed()', () => {
    const callOrder: string[] = []
    mockRouter.navigate.mockImplementation(() => callOrder.push('navigate'))
    mockDialogRef.close.mockImplementation(() => callOrder.push('close'))

    component.confirmed()

    expect(callOrder).toEqual(['navigate', 'close'])
  })

  it('should call router.navigate exactly once when confirmed() is called', () => {
    component.confirmed()
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1)
  })

  it('should call dialogRef.close exactly once when confirmed() is called', () => {
    component.confirmed()
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
  })

  it('should handle different data values correctly', () => {
    const customData = { title: 'Custom Title', body: 'Custom Body' }
    const customComponent = new TnnmcConfirmComponent(customData, mockDialogRef as any, mockRouter as any)
    expect(customComponent.data.title).toBe('Custom Title')
    expect(customComponent.data.body).toBe('Custom Body')
  })
})
