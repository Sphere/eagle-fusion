import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QuarterFiltersComponent } from './quarter-filters.component'

describe('QuarterFiltersComponent', () => {
  let component: QuarterFiltersComponent
  let fixture: ComponentFixture<QuarterFiltersComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuarterFiltersComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QuarterFiltersComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
