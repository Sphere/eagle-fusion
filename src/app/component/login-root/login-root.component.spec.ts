import { LoginRootComponent } from './login-root.component'
import { LoginRootDirective } from './login-root.directive'
import { LoginRootService } from './login-root.service'
import { ViewContainerRef, ComponentRef } from '@angular/core'

describe('LoginRootComponent', () => {
  let component: LoginRootComponent
  let mockLoginRootSvc: jest.Mocked<LoginRootService>
  let mockViewContainerRef: jest.Mocked<ViewContainerRef>
  let mockWsLoginRoot: { viewContainerRef: jest.Mocked<ViewContainerRef> }
  let mockComponentFactory: any

  beforeEach(() => {
    mockViewContainerRef = {
      clear: jest.fn(),
      createComponent: jest.fn(),
    } as any

    mockWsLoginRoot = {
      viewContainerRef: mockViewContainerRef,
    }

    mockComponentFactory = class MockComponent {}

    mockLoginRootSvc = {
      getComponent: jest.fn().mockReturnValue(mockComponentFactory),
    } as any

    component = new LoginRootComponent(mockLoginRootSvc)
    component.wsLoginRoot = mockWsLoginRoot as any
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have wsLoginRoot decorated with ViewChild', () => {
    expect(component.wsLoginRoot).toBeDefined()
  })

  it('should call loadComponent on ngOnInit', () => {
    const loadComponentSpy = jest.spyOn(component, 'loadComponent')

    component.ngOnInit()

    expect(loadComponentSpy).toHaveBeenCalledTimes(1)
  })

  it('should clear the viewContainerRef when loadComponent is called', () => {
    component.loadComponent()

    expect(mockViewContainerRef.clear).toHaveBeenCalledTimes(1)
  })

  it('should call getComponent on the loginRootSvc when loadComponent is called', () => {
    component.loadComponent()

    expect(mockLoginRootSvc.getComponent).toHaveBeenCalledTimes(1)
  })

  it('should call createComponent with the component returned by getComponent', () => {
    component.loadComponent()

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(mockComponentFactory)
  })

  it('should clear and recreate component on each loadComponent call', () => {
    component.loadComponent()
    component.loadComponent()

    expect(mockViewContainerRef.clear).toHaveBeenCalledTimes(2)
    expect(mockViewContainerRef.createComponent).toHaveBeenCalledTimes(2)
  })

  it('should use the viewContainerRef from wsLoginRoot', () => {
    const alternativeViewContainerRef: jest.Mocked<ViewContainerRef> = {
      clear: jest.fn(),
      createComponent: jest.fn(),
    } as any

    component.wsLoginRoot = { viewContainerRef: alternativeViewContainerRef } as any

    component.loadComponent()

    expect(alternativeViewContainerRef.clear).toHaveBeenCalledTimes(1)
    expect(alternativeViewContainerRef.createComponent).toHaveBeenCalledWith(mockComponentFactory)
    expect(mockViewContainerRef.clear).not.toHaveBeenCalled()
  })

  it('should call getComponent each time loadComponent is invoked', () => {
    component.loadComponent()
    component.loadComponent()
    component.loadComponent()

    expect(mockLoginRootSvc.getComponent).toHaveBeenCalledTimes(3)
  })

  it('should pass the result of getComponent directly to createComponent', () => {
    const anotherMockComponent = class AnotherMockComponent {}
    mockLoginRootSvc.getComponent.mockReturnValue(anotherMockComponent)

    component.loadComponent()

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(anotherMockComponent)
  })
})
