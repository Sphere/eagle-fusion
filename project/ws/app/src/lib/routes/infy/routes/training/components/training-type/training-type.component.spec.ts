import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingTypeComponent } from './training-type.component'

describe('TrainingTypeComponent', () => {
  let component: TrainingTypeComponent
  let fixture: ComponentFixture<TrainingTypeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingTypeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingTypeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
