import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeatureUsageComponent } from './feature-usage.component'

describe('FeatureUsageComponent', () => {
  let component: FeatureUsageComponent
  let fixture: ComponentFixture<FeatureUsageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureUsageComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureUsageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
