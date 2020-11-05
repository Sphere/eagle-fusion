import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { InteractiveExerciseComponent } from './interactive-exercise.component'

describe('InteractiveExerciseComponent', () => {
  let component: InteractiveExerciseComponent
  let fixture: ComponentFixture<InteractiveExerciseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InteractiveExerciseComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveExerciseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
