import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AssesmentOverviewComponent } from './assesment-overview.component'

describe('AssesmentOverviewComponent', () => {
  let component: AssesmentOverviewComponent
  let fixture: ComponentFixture<AssesmentOverviewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssesmentOverviewComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssesmentOverviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
