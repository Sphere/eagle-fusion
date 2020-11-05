import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackThreadItemComponent } from './feedback-thread-item.component'

describe('FeedbackThreadItemComponent', () => {
  let component: FeedbackThreadItemComponent
  let fixture: ComponentFixture<FeedbackThreadItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackThreadItemComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThreadItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
