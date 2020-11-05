import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackThreadComponent } from './feedback-thread.component'

describe('FeedbackThreadComponent', () => {
  let component: FeedbackThreadComponent
  let fixture: ComponentFixture<FeedbackThreadComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackThreadComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThreadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
