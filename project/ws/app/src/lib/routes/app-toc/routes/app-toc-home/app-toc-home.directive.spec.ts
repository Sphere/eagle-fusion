import { AppTocHomeDirective } from './app-toc-home.directive'

describe('AppTocHomeDirective', () => {
  it('should create an instance and expose viewContainerRef', () => {
    const viewContainerRefMock: any = { clear: jest.fn(), createComponent: jest.fn() }
    const directive = new AppTocHomeDirective(viewContainerRefMock)
    expect(directive).toBeTruthy()
    expect(directive.viewContainerRef).toBe(viewContainerRefMock)
  })
})
