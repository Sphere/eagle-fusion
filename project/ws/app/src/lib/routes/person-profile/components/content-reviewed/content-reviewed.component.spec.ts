import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentReviewedComponent } from './content-reviewed.component'

describe('ContentReviewedComponent', () => {
  let component: ContentReviewedComponent
  let fixture: ComponentFixture<ContentReviewedComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentReviewedComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentReviewedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
