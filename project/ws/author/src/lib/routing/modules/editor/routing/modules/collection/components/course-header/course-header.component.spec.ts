import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CourseHeaderComponent } from './course-header.component'

describe('CourseHeaderComponent', () => {
  let component: CourseHeaderComponent
  let fixture: ComponentFixture<CourseHeaderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CourseHeaderComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
