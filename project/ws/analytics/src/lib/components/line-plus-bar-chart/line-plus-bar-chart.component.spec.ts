import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LinePlusBarChartComponent } from './line-plus-bar-chart.component'

describe('LinePlusBarChartComponent', () => {
  let component: LinePlusBarChartComponent
  let fixture: ComponentFixture<LinePlusBarChartComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LinePlusBarChartComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LinePlusBarChartComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
