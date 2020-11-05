import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CourseCollectionComponent } from './course-collection.component'

describe('CourseCollectionComponent', () => {
  let component: CourseCollectionComponent
  let fixture: ComponentFixture<CourseCollectionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CourseCollectionComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseCollectionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
