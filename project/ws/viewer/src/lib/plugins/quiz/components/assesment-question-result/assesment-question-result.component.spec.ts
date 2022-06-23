import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AssesmentQuestionResultComponent } from './assesment-question-result.component'

describe('AssesmentQuestionResultComponent', () => {
  let component: AssesmentQuestionResultComponent
  let fixture: ComponentFixture<AssesmentQuestionResultComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssesmentQuestionResultComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssesmentQuestionResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
