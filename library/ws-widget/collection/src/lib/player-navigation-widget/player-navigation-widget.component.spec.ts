import { Subject } from 'rxjs'
import { PlayerNavigationWidgetComponent } from './player-navigation-widget.component'

function createComponent(overrides: any = {}) {
  const playerState$ = new Subject<any>()
  const viewerDataSvcMock = { playerState: playerState$ }
  const viewerDataMock = { gatingEnabled: false }
  const routerMock = { navigate: jest.fn() }
  const eventsMock = { raiseInteractTelemetry: jest.fn() }
  const cdrMock = { detectChanges: jest.fn() }

  const component = new PlayerNavigationWidgetComponent(
    overrides.viewerDataSvc || viewerDataSvcMock as any,
    overrides.viewerData || viewerDataMock as any,
    overrides.router || routerMock as any,
    overrides.events || eventsMock as any,
    overrides.cdr || cdrMock as any,
  )
  return { component, playerState$, viewerDataSvcMock, viewerDataMock, routerMock, eventsMock, cdrMock }
}

describe('PlayerNavigationWidgetComponent', () => {
  it('should create', () => {
    const { component } = createComponent()
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should update navigation state fields when playerState emits data', () => {
      const { component, playerState$, cdrMock } = createComponent()
      component.ngOnInit()
      playerState$.next({
        prevResource: '/prev',
        nextResource: '/next',
        currentCompletionPercentage: 50,
        firstResource: '/first',
      })
      expect(component.prevResourceUrl).toBe('/prev')
      expect(component.nextResourceUrl).toBe('/next')
      expect(component.currentCompletionPercentage).toBe(50)
      expect(component.firstResourceUrl).toBe('/first')
      expect(cdrMock.detectChanges).toHaveBeenCalled()
    })

    it('should ignore falsy playerState emissions', () => {
      const { component, playerState$, cdrMock } = createComponent()
      component.ngOnInit()
      playerState$.next(null)
      expect(cdrMock.detectChanges).not.toHaveBeenCalled()
    })
  })

  describe('navigateToPreResource', () => {
    it('should navigate and raise telemetry when prevResourceUrl exists', () => {
      const { component, routerMock, eventsMock } = createComponent()
      component.prevResourceUrl = '/course/prev-item'
      component.navigateToPreResource()
      expect(component.isPlayBackBtnClicked).toBe(true)
      expect(eventsMock.raiseInteractTelemetry).toHaveBeenCalled()
      expect(routerMock.navigate).toHaveBeenCalledWith(['/course/prev-item'], { queryParamsHandling: 'preserve' })
    })

    it('should do nothing when prevResourceUrl is null', () => {
      const { component, routerMock } = createComponent()
      component.prevResourceUrl = null
      component.navigateToPreResource()
      expect(routerMock.navigate).not.toHaveBeenCalled()
    })
  })

  describe('navigateToNextResource', () => {
    it('should navigate to nextResourceUrl when progress check passes', () => {
      const { component, routerMock } = createComponent()
      component.nextResourceUrl = '/course/next-item'
      component.navigateToNextResource()
      expect(component.isPlayNextBtnClicked).toBe(true)
      expect(routerMock.navigate).toHaveBeenCalledWith(['/course/next-item'], { queryParamsHandling: 'preserve' })
    })

    it('should fall back to firstResourceUrl when nextResourceUrl is absent', () => {
      const { component, routerMock } = createComponent()
      component.nextResourceUrl = null
      component.firstResourceUrl = '/course/first-item'
      component.navigateToNextResource()
      expect(routerMock.navigate).toHaveBeenCalledWith(['/course/first-item'], { queryParamsHandling: 'preserve' })
    })

    it('should not navigate when progress check fails', () => {
      const { component, routerMock, viewerDataMock } = createComponent()
      viewerDataMock.gatingEnabled = true
      component.currentCompletionPercentage = 50
      component.navigateToNextResource()
      expect(routerMock.navigate).not.toHaveBeenCalled()
    })
  })

  describe('isProgressCheck', () => {
    it('should return true when gating is not enabled', () => {
      const { component, viewerDataMock } = createComponent()
      viewerDataMock.gatingEnabled = false
      expect(component.isProgressCheck).toBe(true)
    })

    it('should return false when gating enabled and completion is undefined', () => {
      const { component, viewerDataMock } = createComponent()
      viewerDataMock.gatingEnabled = true
      component.currentCompletionPercentage = undefined as any
      expect(component.isProgressCheck).toBe(false)
    })

    it('should return false when gating enabled and completion is not 100', () => {
      const { component, viewerDataMock } = createComponent()
      viewerDataMock.gatingEnabled = true
      component.currentCompletionPercentage = 40
      expect(component.isProgressCheck).toBe(false)
    })

    it('should return true when gating enabled and completion is 100', () => {
      const { component, viewerDataMock } = createComponent()
      viewerDataMock.gatingEnabled = true
      component.currentCompletionPercentage = 100
      expect(component.isProgressCheck).toBe(true)
    })
  })

  describe('stopPropagation', () => {
    it('should return undefined', () => {
      const { component } = createComponent()
      expect(component.stopPropagation()).toBeUndefined()
    })
  })

  describe('generateInteractTelemetry', () => {
    it('should raise interact telemetry with expected params', () => {
      const { component, eventsMock } = createComponent()
      component.generateInteractTelemetry('next', 'item-1')
      expect(eventsMock.raiseInteractTelemetry).toHaveBeenCalledWith(
        'select-content',
        'play-next-content',
        'player',
        expect.anything(),
        { values: [{ identifier: 'item-1' }] },
      )
    })
  })
})
