import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProgressRadialComponent } from './progress-radial.component'

describe('ProgressRadialComponent', () => {
  let component: ProgressRadialComponent
  let fixture: ComponentFixture<ProgressRadialComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressRadialComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressRadialComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
