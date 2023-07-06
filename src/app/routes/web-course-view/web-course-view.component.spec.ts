import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebCourseViewComponent } from './web-course-view.component'

describe('WebCourseViewComponent', () => {
  let component: WebCourseViewComponent
  let fixture: ComponentFixture<WebCourseViewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebCourseViewComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebCourseViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
