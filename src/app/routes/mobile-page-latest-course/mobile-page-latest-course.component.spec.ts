import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobilePageLatestCourseComponent } from './mobile-page-latest-course.component'

describe('MobilePageLatestCourseComponent', () => {
  let component: MobilePageLatestCourseComponent
  let fixture: ComponentFixture<MobilePageLatestCourseComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobilePageLatestCourseComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobilePageLatestCourseComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
