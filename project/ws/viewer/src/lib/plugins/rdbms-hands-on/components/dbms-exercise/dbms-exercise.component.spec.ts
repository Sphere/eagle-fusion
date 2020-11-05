import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DbmsExerciseComponent } from './dbms-exercise.component'

describe('DbmsExerciseComponent', () => {
  let component: DbmsExerciseComponent
  let fixture: ComponentFixture<DbmsExerciseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsExerciseComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsExerciseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
