import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocCohortsComponent } from './app-toc-cohorts.component'

describe('AppTocCohortsComponent', () => {
  let component: AppTocCohortsComponent
  let fixture: ComponentFixture<AppTocCohortsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocCohortsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocCohortsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
