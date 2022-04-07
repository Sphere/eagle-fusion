import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AllDiscussionWidgetComponent } from './all-discussion-widget.component'

describe('CategoryWidgetComponent', () => {
  let component: AllDiscussionWidgetComponent
  let fixture: ComponentFixture<AllDiscussionWidgetComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllDiscussionWidgetComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AllDiscussionWidgetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
