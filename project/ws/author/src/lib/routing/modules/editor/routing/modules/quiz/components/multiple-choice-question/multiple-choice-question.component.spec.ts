import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MultipleChoiceQuestionComponent } from './multiple-choice-question.component'

describe('MultipleChoiceQuestionComponent', () => {
  let component: MultipleChoiceQuestionComponent
  let fixture: ComponentFixture<MultipleChoiceQuestionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultipleChoiceQuestionComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleChoiceQuestionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
