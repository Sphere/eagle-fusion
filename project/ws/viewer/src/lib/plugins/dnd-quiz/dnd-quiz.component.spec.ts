import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DndQuizComponent } from './dnd-quiz.component'

describe('DndQuizComponent', () => {
  let component: DndQuizComponent
  let fixture: ComponentFixture<DndQuizComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DndQuizComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DndQuizComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
