import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackTypeComponent } from './feedback-type.component'

describe('FeedbackTypeComponent', () => {
  let component: FeedbackTypeComponent
  let fixture: ComponentFixture<FeedbackTypeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackTypeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackTypeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
