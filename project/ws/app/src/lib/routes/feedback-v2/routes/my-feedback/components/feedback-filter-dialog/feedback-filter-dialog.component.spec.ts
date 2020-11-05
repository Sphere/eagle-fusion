import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FeedbackFilterDialogComponent } from './feedback-filter-dialog.component'

describe('FeedbackFilterDialogComponent', () => {
  let component: FeedbackFilterDialogComponent
  let fixture: ComponentFixture<FeedbackFilterDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackFilterDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackFilterDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
