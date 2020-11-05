import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocBannerComponent } from './app-toc-banner.component'

describe('AppTocBannerComponent', () => {
  let component: AppTocBannerComponent
  let fixture: ComponentFixture<AppTocBannerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocBannerComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocBannerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
