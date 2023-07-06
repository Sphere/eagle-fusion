import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebFeaturedCourseComponent } from './web-featured-course.component'

describe('MobileHowDoesWorkComponent', () => {
  let component: WebFeaturedCourseComponent
  let fixture: ComponentFixture<WebFeaturedCourseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebFeaturedCourseComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebFeaturedCourseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
