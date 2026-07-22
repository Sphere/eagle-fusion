class MockAppTocHomePageComponent { }

jest.mock('../../components/app-toc-home-page/app-toc-home-page.component', () => ({
  AppTocHomePageComponent: MockAppTocHomePageComponent,
}))

jest.mock('../../components/app-toc-home-page/app-toc-home-page.component', () => ({
  AppTocHomePageComponent: class MockAppTocHomePageComponent {},
}))

import { AppTocHomeService } from './app-toc-home.service'
import { AppTocHomePageComponent } from '../../components/app-toc-home-page/app-toc-home-page.component'

describe('AppTocHomeService', () => {
  let service: AppTocHomeService

  beforeEach(() => {
    service = new AppTocHomeService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should return AppTocHomePageComponent from getComponent', () => {
    expect(service.getComponent()).toBe(AppTocHomePageComponent)
  })
})
