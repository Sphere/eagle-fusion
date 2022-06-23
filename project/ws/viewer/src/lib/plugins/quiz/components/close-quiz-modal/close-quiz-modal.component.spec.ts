import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CloseQuizModalComponent } from './close-quiz-modal.component'

describe('CloseQuizModalComponent', () => {
  let component: CloseQuizModalComponent
  let fixture: ComponentFixture<CloseQuizModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseQuizModalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseQuizModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
