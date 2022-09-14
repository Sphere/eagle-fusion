import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ViewAssesmentQuestionsComponent } from './view-assesment-questions.component'

describe('ViewAssesmentQuestionsComponent', () => {
  let component: ViewAssesmentQuestionsComponent
  let fixture: ComponentFixture<ViewAssesmentQuestionsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAssesmentQuestionsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssesmentQuestionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
