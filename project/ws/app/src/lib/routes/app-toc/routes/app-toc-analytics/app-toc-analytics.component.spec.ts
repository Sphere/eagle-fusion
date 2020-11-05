import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocAnalyticsComponent } from './app-toc-analytics.component'

describe('AppTocAnalyticsComponent', () => {
  let component: AppTocAnalyticsComponent
  let fixture: ComponentFixture<AppTocAnalyticsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocAnalyticsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocAnalyticsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
