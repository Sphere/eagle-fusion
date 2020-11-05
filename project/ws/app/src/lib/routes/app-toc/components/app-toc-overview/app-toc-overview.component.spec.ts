import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocOverviewComponent } from './app-toc-overview.component'

describe('AppTocOverviewComponent', () => {
  let component: AppTocOverviewComponent
  let fixture: ComponentFixture<AppTocOverviewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocOverviewComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocOverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
