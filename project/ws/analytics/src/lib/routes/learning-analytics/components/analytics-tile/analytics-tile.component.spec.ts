import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AnalyticsTileComponent } from './analytics-tile.component'

describe('AnalyticsTileComponent', () => {
  let component: AnalyticsTileComponent
  let fixture: ComponentFixture<AnalyticsTileComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticsTileComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsTileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
