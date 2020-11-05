import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackThreadHeaderComponent } from './feedback-thread-header.component'

describe('FeedbackThreadHeaderComponent', () => {
  let component: FeedbackThreadHeaderComponent
  let fixture: ComponentFixture<FeedbackThreadHeaderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackThreadHeaderComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThreadHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
