import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingJitComponent } from './training-jit.component'

describe('TrainingJitComponent', () => {
  let component: TrainingJitComponent
  let fixture: ComponentFixture<TrainingJitComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingJitComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingJitComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
